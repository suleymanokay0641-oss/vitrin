import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  adCampaignsTable, adClicksTable,
  advertiserBalanceTable, balanceTopupTable,
  userAccountsTable, monthlyPoolTable,
} from "@workspace/db";
import { eq, and, sql, gt, desc } from "drizzle-orm";

const router: IRouter = Router();
const AD_POOL_PERCENT = 30;

function getClickDate() { return new Date().toISOString().slice(0, 10); }
function getYM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function getOrCreateBalance(userId: number) {
  const [existing] = await db.select().from(advertiserBalanceTable).where(eq(advertiserBalanceTable.userId, userId));
  if (existing) return existing;
  const [created] = await db.insert(advertiserBalanceTable).values({ userId }).returning();
  return created;
}

router.get("/balance/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });
  const balance = await getOrCreateBalance(userId);
  const topups = await db.select().from(balanceTopupTable)
    .where(eq(balanceTopupTable.userId, userId))
    .orderBy(desc(balanceTopupTable.requestedAt)).limit(5);
  res.json({ ...balance, topups });
});

router.post("/topup", async (req, res) => {
  const { userId, amount, method, accountName } = req.body;
  if (!userId || !amount || !method || !accountName) return res.status(400).json({ error: "Tüm alanları doldurun" });
  if (amount < 100) return res.status(400).json({ error: "Minimum yükleme 100 TL" });
  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
  const [topup] = await db.insert(balanceTopupTable).values({ userId, amount, method, accountName }).returning();
  res.json({ success: true, topupId: topup.id });
});

router.post("/topup/approve", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env["ADMIN_KEY"]) return res.status(403).json({ error: "Yetkisiz" });
  const { topupId } = req.body;
  const [topup] = await db.select().from(balanceTopupTable).where(eq(balanceTopupTable.id, topupId));
  if (!topup) return res.status(404).json({ error: "Bulunamadı" });
  await db.update(balanceTopupTable).set({ status: "approved", processedAt: new Date() }).where(eq(balanceTopupTable.id, topupId));
  await getOrCreateBalance(topup.userId);
  await db.update(advertiserBalanceTable)
    .set({
      balance: sql`${advertiserBalanceTable.balance} + ${topup.amount}`,
      totalLoaded: sql`${advertiserBalanceTable.totalLoaded} + ${topup.amount}`,
      updatedAt: new Date(),
    })
    .where(eq(advertiserBalanceTable.userId, topup.userId));

  const ym = getYM();
  const [pool] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, ym));
  const poolAdd = topup.amount * (AD_POOL_PERCENT / 100);
  if (pool) {
    await db.update(monthlyPoolTable)
      .set({ adRevenue: sql`${monthlyPoolTable.adRevenue} + ${topup.amount}`, poolAmount: sql`${monthlyPoolTable.poolAmount} + ${poolAdd}` })
      .where(eq(monthlyPoolTable.yearMonth, ym));
  } else {
    await db.insert(monthlyPoolTable).values({ yearMonth: ym, adRevenue: topup.amount, poolAmount: poolAdd });
  }
  res.json({ success: true });
});

router.post("/campaigns", async (req, res) => {
  const { advertiserId, name, targetCategories, targetKeywords, placement, budgetTotal, dailyBudget, costPerClick, title, description, imageUrl, destinationUrl } = req.body;
  if (!advertiserId || !name || !budgetTotal || !dailyBudget || !title || !destinationUrl) {
    return res.status(400).json({ error: "Zorunlu alanlar eksik" });
  }
  const balance = await getOrCreateBalance(advertiserId);
  if (balance.balance < budgetTotal) {
    return res.status(400).json({ error: `Yetersiz bakiye. Mevcut: ${balance.balance.toFixed(2)} TL, Gereken: ${budgetTotal} TL` });
  }
  await db.update(advertiserBalanceTable)
    .set({ balance: sql`${advertiserBalanceTable.balance} - ${budgetTotal}`, updatedAt: new Date() })
    .where(eq(advertiserBalanceTable.userId, advertiserId));

  const [campaign] = await db.insert(adCampaignsTable).values({
    advertiserId, name,
    targetCategories: targetCategories || [],
    targetKeywords: targetKeywords || [],
    placement: placement || "all",
    budgetTotal, budgetRemaining: budgetTotal, dailyBudget,
    costPerClick: costPerClick || 2, title, description, imageUrl, destinationUrl,
    status: "active", startDate: new Date(),
  }).returning();

  res.json({ success: true, campaign });
});

router.get("/campaigns/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });
  const campaigns = await db.select().from(adCampaignsTable)
    .where(eq(adCampaignsTable.advertiserId, userId))
    .orderBy(desc(adCampaignsTable.createdAt));
  res.json(campaigns);
});

router.patch("/campaigns/:id/pause", async (req, res) => {
  const id = parseInt(req.params.id);
  const { advertiserId } = req.body;
  const [c] = await db.select().from(adCampaignsTable).where(eq(adCampaignsTable.id, id));
  if (!c || c.advertiserId !== advertiserId) return res.status(403).json({ error: "Yetkisiz" });
  const newStatus = c.status === "active" ? "paused" : "active";
  await db.update(adCampaignsTable).set({ status: newStatus }).where(eq(adCampaignsTable.id, id));
  res.json({ success: true, status: newStatus });
});

router.get("/serve", async (req, res) => {
  const { placement, keyword, category } = req.query as Record<string, string>;

  const active = await db.select().from(adCampaignsTable)
    .where(and(
      eq(adCampaignsTable.status, "active"),
      gt(adCampaignsTable.budgetRemaining, 0),
    ));

  if (active.length === 0) return res.json(null);

  let scored = active.map(c => {
    let score = c.costPerClick;
    if (keyword && c.targetKeywords.some(k => keyword.toLowerCase().includes(k.toLowerCase()))) score += 3;
    if (category && c.targetCategories.includes(category)) score += 2;
    if (c.placement === "all" || c.placement === placement) score += 1;
    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const winner = scored[0];
  await db.update(adCampaignsTable)
    .set({ totalImpressions: sql`${adCampaignsTable.totalImpressions} + 1` })
    .where(eq(adCampaignsTable.id, winner.id));

  res.json({
    id: winner.id,
    title: winner.title,
    description: winner.description,
    imageUrl: winner.imageUrl,
    destinationUrl: winner.destinationUrl,
    costPerClick: winner.costPerClick,
  });
});

router.post("/click/:campaignId", async (req, res) => {
  const campaignId = parseInt(req.params.campaignId);
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId gerekli" });

  const clickDate = getClickDate();
  const [existing] = await db.select().from(adClicksTable).where(
    and(eq(adClicksTable.campaignId, campaignId), eq(adClicksTable.sessionId, sessionId), eq(adClicksTable.clickDate, clickDate))
  );
  if (existing) return res.json({ counted: false });

  const [campaign] = await db.select().from(adCampaignsTable).where(eq(adCampaignsTable.id, campaignId));
  if (!campaign || campaign.status !== "active" || campaign.budgetRemaining <= 0) {
    return res.json({ counted: false });
  }

  await db.insert(adClicksTable).values({ campaignId, sessionId, clickDate });
  const newRemaining = Math.max(0, campaign.budgetRemaining - campaign.costPerClick);
  const newStatus = newRemaining <= 0 ? "exhausted" : "active";
  await db.update(adCampaignsTable)
    .set({ budgetRemaining: newRemaining, status: newStatus, totalClicks: sql`${adCampaignsTable.totalClicks} + 1` })
    .where(eq(adCampaignsTable.id, campaignId));
  await db.update(advertiserBalanceTable)
    .set({ totalSpent: sql`${advertiserBalanceTable.totalSpent} + ${campaign.costPerClick}`, updatedAt: new Date() })
    .where(eq(advertiserBalanceTable.userId, campaign.advertiserId));

  res.json({ counted: true });
});

router.get("/pending-topups", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env["ADMIN_KEY"]) return res.status(403).json({ error: "Yetkisiz" });
  const topups = await db.select({
    id: balanceTopupTable.id,
    userId: balanceTopupTable.userId,
    email: userAccountsTable.email,
    amount: balanceTopupTable.amount,
    method: balanceTopupTable.method,
    accountName: balanceTopupTable.accountName,
    requestedAt: balanceTopupTable.requestedAt,
  })
    .from(balanceTopupTable)
    .innerJoin(userAccountsTable, eq(balanceTopupTable.userId, userAccountsTable.id))
    .where(eq(balanceTopupTable.status, "pending"))
    .orderBy(desc(balanceTopupTable.requestedAt));
  res.json(topups);
});

export default router;
