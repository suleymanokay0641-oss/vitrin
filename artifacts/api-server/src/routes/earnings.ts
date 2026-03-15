import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  monthlyPoolTable, uniqueProductClicksTable,
  userMonthlyEarningsTable, withdrawalRequestsTable,
  userAccountsTable, productsTable,
} from "@workspace/db";
import { eq, and, desc, sql, gte, ne, inArray } from "drizzle-orm";

const router: IRouter = Router();

function getYearMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getClickDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

async function getOrCreatePool(yearMonth: string) {
  const [existing] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, yearMonth));
  if (existing) return existing;
  const defaultPool = parseFloat(process.env["MONTHLY_POOL_TL"] || "500");
  const [created] = await db.insert(monthlyPoolTable).values({
    yearMonth,
    poolAmount: defaultPool,
    poolPercent: 30,
  }).returning();
  return created;
}

export async function recordUniqueClick(productId: number, creatorUserId: number | null, sessionId: string) {
  const yearMonth = getYearMonth();
  const clickDate = getClickDate();
  const existing = await db.select({ id: uniqueProductClicksTable.id })
    .from(uniqueProductClicksTable)
    .where(and(
      eq(uniqueProductClicksTable.productId, productId),
      eq(uniqueProductClicksTable.sessionId, sessionId),
      eq(uniqueProductClicksTable.clickDate, clickDate),
    ));
  if (existing.length > 0) return false;

  await db.insert(uniqueProductClicksTable).values({ productId, creatorUserId, sessionId, yearMonth, clickDate });

  if (creatorUserId) {
    const [existingEarnings] = await db.select().from(userMonthlyEarningsTable)
      .where(and(eq(userMonthlyEarningsTable.userId, creatorUserId), eq(userMonthlyEarningsTable.yearMonth, yearMonth)));
    if (existingEarnings) {
      await db.update(userMonthlyEarningsTable)
        .set({ totalClicks: sql`${userMonthlyEarningsTable.totalClicks} + 1` })
        .where(eq(userMonthlyEarningsTable.id, existingEarnings.id));
    } else {
      await db.insert(userMonthlyEarningsTable).values({ userId: creatorUserId, yearMonth, totalClicks: 1 });
    }
  }
  return true;
}

router.get("/pool", async (_req, res) => {
  const yearMonth = getYearMonth();
  const pool = await getOrCreatePool(yearMonth);

  const [clickCount] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(uniqueProductClicksTable)
    .where(eq(uniqueProductClicksTable.yearMonth, yearMonth));

  const totalClicks = Number(clickCount?.count ?? 0);
  const pricePerClick = totalClicks > 0 ? pool.poolAmount / totalClicks : 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  res.json({
    yearMonth,
    poolAmount: pool.poolAmount,
    poolPercent: pool.poolPercent,
    totalUniqueClicks: totalClicks,
    pricePerClick: parseFloat(pricePerClick.toFixed(4)),
    daysRemaining,
    status: pool.status,
    affiliateRevenue: pool.affiliateRevenue,
    adRevenue: pool.adRevenue,
    subscriptionRevenue: pool.subscriptionRevenue,
  });
});

router.get("/dashboard/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });

  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  const yearMonth = getYearMonth();
  const pool = await getOrCreatePool(yearMonth);

  const [poolClickCount] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(uniqueProductClicksTable)
    .where(eq(uniqueProductClicksTable.yearMonth, yearMonth));
  const totalPoolClicks = Number(poolClickCount?.count ?? 0);
  const pricePerClick = totalPoolClicks > 0 ? pool.poolAmount / totalPoolClicks : 0;

  const [myEarningsRow] = await db.select().from(userMonthlyEarningsTable)
    .where(and(eq(userMonthlyEarningsTable.userId, userId), eq(userMonthlyEarningsTable.yearMonth, yearMonth)));
  const myClicks = myEarningsRow?.totalClicks ?? 0;
  const estimatedTL = parseFloat((myClicks * pricePerClick).toFixed(2));

  const pastEarnings = await db.select().from(userMonthlyEarningsTable)
    .where(and(eq(userMonthlyEarningsTable.userId, userId), ne(userMonthlyEarningsTable.yearMonth, yearMonth)))
    .orderBy(desc(userMonthlyEarningsTable.yearMonth))
    .limit(6);

  const totalWithdrawable = pastEarnings
    .filter(e => e.status === "withdrawable")
    .reduce((s, e) => s + e.earningsAmount, 0);

  const pendingWithdrawal = await db.select().from(withdrawalRequestsTable)
    .where(and(eq(withdrawalRequestsTable.userId, userId), eq(withdrawalRequestsTable.status, "pending")));

  const myProductCount = await db.select({ count: sql<number>`COUNT(*)` })
    .from(productsTable).where(eq(productsTable.createdByUserId, userId));

  res.json({
    userId,
    email: user.email,
    currentMonth: {
      yearMonth,
      myClicks,
      estimatedTL,
      poolAmount: pool.poolAmount,
      totalPoolClicks,
      pricePerClick: parseFloat(pricePerClick.toFixed(4)),
    },
    totalWithdrawable: parseFloat(totalWithdrawable.toFixed(2)),
    hasPendingWithdrawal: pendingWithdrawal.length > 0,
    pastEarnings: pastEarnings.map(e => ({
      yearMonth: e.yearMonth,
      totalClicks: e.totalClicks,
      earningsAmount: e.earningsAmount,
      status: e.status,
    })),
    myProductCount: Number(myProductCount[0]?.count ?? 0),
  });
});

router.post("/withdraw", async (req, res) => {
  const { userId, method, accountInfo, accountName } = req.body;
  if (!userId || !method || !accountInfo || !accountName) {
    return res.status(400).json({ error: "Tüm alanları doldurun" });
  }
  if (!["iban", "papara"].includes(method)) {
    return res.status(400).json({ error: "Geçersiz ödeme yöntemi" });
  }

  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  const yearMonth = getYearMonth();
  const prevMonth = (() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return getYearMonth(d);
  })();

  const withdrawableRows = await db.select().from(userMonthlyEarningsTable)
    .where(and(eq(userMonthlyEarningsTable.userId, userId), eq(userMonthlyEarningsTable.status, "withdrawable")));

  const totalWithdrawable = withdrawableRows.reduce((s, e) => s + e.earningsAmount, 0);

  if (totalWithdrawable < 50) {
    return res.status(400).json({ error: `Minimum çekim tutarı 50 TL. Mevcut: ${totalWithdrawable.toFixed(2)} TL` });
  }

  const [existingPending] = await db.select().from(withdrawalRequestsTable)
    .where(and(eq(withdrawalRequestsTable.userId, userId), eq(withdrawalRequestsTable.status, "pending")));

  if (existingPending) {
    return res.status(400).json({ error: "Bekleyen bir çekim talebiniz zaten var" });
  }

  const [request] = await db.insert(withdrawalRequestsTable).values({
    userId,
    yearMonth: prevMonth,
    amount: parseFloat(totalWithdrawable.toFixed(2)),
    method,
    accountInfo,
    accountName,
    status: "pending",
  }).returning();

  await db.update(userMonthlyEarningsTable)
    .set({ status: "withdrawn" })
    .where(and(eq(userMonthlyEarningsTable.userId, userId), eq(userMonthlyEarningsTable.status, "withdrawable")));

  res.json({ success: true, requestId: request.id, amount: request.amount, status: "pending" });
});

router.get("/withdrawals/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });
  const withdrawals = await db.select().from(withdrawalRequestsTable)
    .where(eq(withdrawalRequestsTable.userId, userId))
    .orderBy(desc(withdrawalRequestsTable.requestedAt))
    .limit(10);
  res.json(withdrawals);
});

router.post("/pool/add-revenue", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env["ADMIN_KEY"]) return res.status(403).json({ error: "Yetkisiz" });

  const { yearMonth, affiliateRevenue = 0, adRevenue = 0, subscriptionRevenue = 0 } = req.body;
  const ym = yearMonth || getYearMonth();

  const pool = await getOrCreatePool(ym);
  const totalRevenue = affiliateRevenue + adRevenue + subscriptionRevenue;
  const poolAmount = parseFloat((totalRevenue * (pool.poolPercent / 100)).toFixed(2));

  const [updated] = await db.update(monthlyPoolTable)
    .set({ affiliateRevenue, adRevenue, subscriptionRevenue, totalRevenue, poolAmount })
    .where(eq(monthlyPoolTable.yearMonth, ym))
    .returning();

  res.json(updated);
});

router.post("/pool/calculate", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env["ADMIN_KEY"]) return res.status(403).json({ error: "Yetkisiz" });

  const { yearMonth } = req.body;
  const ym = yearMonth || (() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return getYearMonth(d);
  })();

  const [pool] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, ym));
  if (!pool) return res.status(404).json({ error: "Bu ay için havuz bulunamadı" });
  if (pool.status === "calculated") return res.status(400).json({ error: "Bu ay zaten hesaplandı" });

  const clicksByUser = await db.select({
    creatorUserId: uniqueProductClicksTable.creatorUserId,
    clicks: sql<number>`COUNT(*)`,
  })
    .from(uniqueProductClicksTable)
    .where(and(eq(uniqueProductClicksTable.yearMonth, ym)))
    .groupBy(uniqueProductClicksTable.creatorUserId);

  const totalClicks = clicksByUser.reduce((s, r) => s + Number(r.clicks), 0);
  if (totalClicks === 0) return res.status(400).json({ error: "Bu ay hiç tıklama yok" });

  const pricePerClick = pool.poolAmount / totalClicks;
  let distributed = 0;

  for (const row of clicksByUser) {
    if (!row.creatorUserId) continue;
    const clicks = Number(row.clicks);
    const amount = parseFloat((clicks * pricePerClick).toFixed(2));
    distributed += amount;

    await db.update(userMonthlyEarningsTable)
      .set({ earningsAmount: amount, totalClicks: clicks, status: "withdrawable" })
      .where(and(eq(userMonthlyEarningsTable.userId, row.creatorUserId), eq(userMonthlyEarningsTable.yearMonth, ym)));
  }

  await db.update(monthlyPoolTable)
    .set({ status: "calculated", totalUniqueClicks: totalClicks, pricePerClick, calculatedAt: new Date() })
    .where(eq(monthlyPoolTable.id, pool.id));

  res.json({ success: true, yearMonth: ym, totalClicks, poolAmount: pool.poolAmount, distributed, pricePerClick });
});

// Kullanıcının vitrinini getir (ürünler + bu ayki tıklamalar)
router.get("/vitrin/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });

  const yearMonth = getYearMonth();
  const pool = await getOrCreatePool(yearMonth);

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      url: productsTable.storeUrl,
      imageUrl: productsTable.imageUrl,
      currentPrice: productsTable.originalPrice,
      store: productsTable.store,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .where(eq(productsTable.createdByUserId, userId))
    .orderBy(desc(productsTable.createdAt));

  const productIds = products.map(p => p.id);

  const clicksByProduct = productIds.length > 0 ? await db
    .select({
      productId: uniqueProductClicksTable.productId,
      clicks: sql<number>`COUNT(*)`,
    })
    .from(uniqueProductClicksTable)
    .where(and(
      eq(uniqueProductClicksTable.yearMonth, yearMonth),
      inArray(uniqueProductClicksTable.productId, productIds)
    ))
    .groupBy(uniqueProductClicksTable.productId) : [];

  const clickMap: Record<number, number> = {};
  for (const row of clicksByProduct) {
    clickMap[row.productId] = Number(row.clicks);
  }

  const productsWithClicks = products.map(p => ({
    ...p,
    monthlyClicks: clickMap[p.id] ?? 0,
  }));

  const totalClicks = productsWithClicks.reduce((s, p) => s + p.monthlyClicks, 0);

  res.json({
    products: productsWithClicks,
    totalClicks,
    yearMonth,
    poolAmount: pool.poolAmount,
    daysRemaining: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() > Date.now()
      ? Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() - Date.now()) / 86400000)
      : 0,
  });
});

export default router;
