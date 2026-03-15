import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  userAccountsTable, withdrawalRequestsTable, complaintsTable,
  productsTable, adCampaignsTable, monthlyPoolTable,
  userMonthlyEarningsTable, subscriptionsTable, reviewsTable,
  uniqueProductClicksTable, championHistoryTable, pointEventsTable,
} from "@workspace/db";
import { eq, desc, sql, and, ne, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth";

const router: IRouter = Router();

// ---- Admin Auth Middleware ----
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Token gerekli" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number };
    (req as any).adminUserId = payload.userId;
    // Rol kontrolü DB'den
    db.select({ role: userAccountsTable.role })
      .from(userAccountsTable)
      .where(eq(userAccountsTable.id, payload.userId))
      .then(([u]) => {
        if (!u || u.role !== "admin") return res.status(403).json({ error: "Yönetici yetkisi gerekli" });
        next();
      })
      .catch(() => res.status(500).json({ error: "Yetki kontrol hatası" }));
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
}

router.use(requireAdmin);

// ---- Dashboard ----
router.get("/dashboard", async (_req, res) => {
  const [
    [{ totalUsers }],
    [{ totalProducts }],
    [{ pendingWithdrawals }],
    [{ pendingComplaints }],
    [{ totalRevenue }],
    [{ activeSubs }],
    [{ pendingCampaigns }],
  ] = await Promise.all([
    db.select({ totalUsers: sql<number>`COUNT(*)` }).from(userAccountsTable),
    db.select({ totalProducts: sql<number>`COUNT(*)` }).from(productsTable),
    db.select({ pendingWithdrawals: sql<number>`COUNT(*)` }).from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.status, "pending")),
    db.select({ pendingComplaints: sql<number>`COUNT(*)` }).from(complaintsTable).where(eq(complaintsTable.status, "pending")),
    db.select({ totalRevenue: sql<number>`COALESCE(SUM(pool_amount), 0)` }).from(monthlyPoolTable),
    db.select({ activeSubs: sql<number>`COUNT(*)` }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active")),
    db.select({ pendingCampaigns: sql<number>`COUNT(*)` }).from(adCampaignsTable).where(eq(adCampaignsTable.status, "pending")),
  ]);

  const recentUsers = await db.select({
    id: userAccountsTable.id,
    email: userAccountsTable.email,
    displayName: userAccountsTable.displayName,
    role: userAccountsTable.role,
    emailVerified: userAccountsTable.emailVerified,
    createdAt: userAccountsTable.createdAt,
  }).from(userAccountsTable).orderBy(desc(userAccountsTable.createdAt)).limit(5);

  res.json({
    stats: {
      totalUsers: Number(totalUsers),
      totalProducts: Number(totalProducts),
      pendingWithdrawals: Number(pendingWithdrawals),
      pendingComplaints: Number(pendingComplaints),
      totalRevenue: Number(totalRevenue),
      activeSubs: Number(activeSubs),
      pendingCampaigns: Number(pendingCampaigns),
    },
    recentUsers,
  });
});

// ---- Kullanıcılar ----
router.get("/users", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = (req.query.search as string)?.trim();

  let query = db.select({
    id: userAccountsTable.id,
    email: userAccountsTable.email,
    displayName: userAccountsTable.displayName,
    phone: userAccountsTable.phone,
    role: userAccountsTable.role,
    emailVerified: userAccountsTable.emailVerified,
    isChampion: userAccountsTable.isChampion,
    loyaltyMonths: userAccountsTable.loyaltyMonths,
    createdAt: userAccountsTable.createdAt,
  }).from(userAccountsTable);

  const users = await (search
    ? query.where(sql`email ILIKE ${'%' + search + '%'} OR display_name ILIKE ${'%' + search + '%'}`)
    : query)
    .orderBy(desc(userAccountsTable.createdAt))
    .limit(limit).offset(offset);

  const [{ total }] = await db.select({ total: sql<number>`COUNT(*)` }).from(userAccountsTable);

  res.json({ users, total: Number(total), page, pages: Math.ceil(Number(total) / limit) });
});

router.post("/users/:id/ban", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(userAccountsTable).set({ role: "banned" }).where(eq(userAccountsTable.id, id));
  res.json({ success: true });
});

router.post("/users/:id/unban", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(userAccountsTable).set({ role: "user" }).where(eq(userAccountsTable.id, id));
  res.json({ success: true });
});

router.post("/users/:id/role", async (req, res) => {
  const id = parseInt(req.params.id);
  const { role } = req.body;
  if (!["user", "admin", "moderator", "banned"].includes(role)) {
    return res.status(400).json({ error: "Geçersiz rol" });
  }
  await db.update(userAccountsTable).set({ role }).where(eq(userAccountsTable.id, id));
  res.json({ success: true });
});

// ---- Para Çekme Talepleri ----
router.get("/withdrawals", async (_req, res) => {
  const withdrawals = await db.select({
    id: withdrawalRequestsTable.id,
    userId: withdrawalRequestsTable.userId,
    amount: withdrawalRequestsTable.amount,
    method: withdrawalRequestsTable.method,
    accountInfo: withdrawalRequestsTable.accountInfo,
    accountName: withdrawalRequestsTable.accountName,
    status: withdrawalRequestsTable.status,
    createdAt: withdrawalRequestsTable.createdAt,
    email: userAccountsTable.email,
    displayName: userAccountsTable.displayName,
  }).from(withdrawalRequestsTable)
    .leftJoin(userAccountsTable, eq(withdrawalRequestsTable.userId, userAccountsTable.id))
    .orderBy(desc(withdrawalRequestsTable.createdAt))
    .limit(100);

  res.json({ withdrawals });
});

router.post("/withdrawals/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  const { note } = req.body;
  await db.update(withdrawalRequestsTable)
    .set({ status: "approved", note: note || null, processedAt: new Date() })
    .where(eq(withdrawalRequestsTable.id, id));

  // Kullanıcının kazancını "withdrawn" olarak işaretle
  const [w] = await db.select().from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.id, id));
  if (w) {
    await db.update(userMonthlyEarningsTable)
      .set({ status: "withdrawn" })
      .where(and(
        eq(userMonthlyEarningsTable.userId, w.userId),
        eq(userMonthlyEarningsTable.status, "withdrawable")
      ));
  }
  res.json({ success: true });
});

router.post("/withdrawals/:id/reject", async (req, res) => {
  const id = parseInt(req.params.id);
  const { note } = req.body;
  await db.update(withdrawalRequestsTable)
    .set({ status: "rejected", note: note || null, processedAt: new Date() })
    .where(eq(withdrawalRequestsTable.id, id));
  res.json({ success: true });
});

// ---- Şikayetler ----
router.get("/complaints", async (req, res) => {
  const status = (req.query.status as string) || "pending";
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 30;
  const offset = (page - 1) * limit;

  const complaints = await db.select({
    id: complaintsTable.id,
    targetType: complaintsTable.targetType,
    targetId: complaintsTable.targetId,
    reason: complaintsTable.reason,
    description: complaintsTable.description,
    status: complaintsTable.status,
    actionTaken: complaintsTable.actionTaken,
    createdAt: complaintsTable.createdAt,
    resolvedAt: complaintsTable.resolvedAt,
    reporterEmail: userAccountsTable.email,
    reporterName: userAccountsTable.displayName,
  }).from(complaintsTable)
    .leftJoin(userAccountsTable, eq(complaintsTable.reporterUserId, userAccountsTable.id))
    .where(eq(complaintsTable.status, status))
    .orderBy(desc(complaintsTable.createdAt))
    .limit(limit).offset(offset);

  const [{ total }] = await db.select({ total: sql<number>`COUNT(*)` })
    .from(complaintsTable).where(eq(complaintsTable.status, status));

  res.json({ complaints, total: Number(total), page, pages: Math.ceil(Number(total) / limit) });
});

router.post("/complaints", async (req, res) => {
  const { reporterUserId, targetType, targetId, reason, description } = req.body;
  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: "Eksik bilgi" });
  }
  const [c] = await db.insert(complaintsTable).values({
    reporterUserId: reporterUserId || null,
    targetType,
    targetId: parseInt(targetId),
    reason,
    description: description || null,
  }).returning({ id: complaintsTable.id });
  res.status(201).json({ success: true, id: c.id });
});

router.post("/complaints/:id/resolve", async (req, res) => {
  const id = parseInt(req.params.id);
  const adminUserId = (req as any).adminUserId;
  const { actionTaken } = req.body; // "removed" | "warned" | "banned" | "none"

  await db.update(complaintsTable).set({
    status: "resolved",
    resolvedByUserId: adminUserId,
    resolvedAt: new Date(),
    actionTaken: actionTaken || "none",
  }).where(eq(complaintsTable.id, id));

  // Eylem uygula
  if (actionTaken === "removed") {
    const [c] = await db.select().from(complaintsTable).where(eq(complaintsTable.id, id));
    if (c?.targetType === "product") {
      await db.update(productsTable).set({ deletedAt: new Date() } as any).where(eq(productsTable.id, c.targetId));
    } else if (c?.targetType === "review") {
      await db.delete(reviewsTable).where(eq(reviewsTable.id, c.targetId));
    }
  } else if (actionTaken === "banned") {
    const [c] = await db.select().from(complaintsTable).where(eq(complaintsTable.id, id));
    if (c?.reporterUserId) {
      // Şikayet edilen kişiyi ban'la (targetType=user durumunda targetId = userId)
      if (c.targetType === "user") {
        await db.update(userAccountsTable).set({ role: "banned" }).where(eq(userAccountsTable.id, c.targetId));
      }
    }
  }

  res.json({ success: true });
});

router.post("/complaints/:id/dismiss", async (req, res) => {
  const id = parseInt(req.params.id);
  const adminUserId = (req as any).adminUserId;
  await db.update(complaintsTable).set({
    status: "dismissed",
    resolvedByUserId: adminUserId,
    resolvedAt: new Date(),
    actionTaken: "none",
  }).where(eq(complaintsTable.id, id));
  res.json({ success: true });
});

// Şikayet ekle — giriş yapmadan da
router.post("/report", async (req, res) => {
  const { reporterUserId, targetType, targetId, reason, description } = req.body;
  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: "Eksik bilgi" });
  }
  const [c] = await db.insert(complaintsTable).values({
    reporterUserId: reporterUserId ? parseInt(reporterUserId) : null,
    targetType,
    targetId: parseInt(targetId),
    reason,
    description: description || null,
  }).returning({ id: complaintsTable.id });
  res.status(201).json({ success: true, id: c.id });
});

// ---- Ürün Kaldır (soft delete — name'i "[Kaldırıldı]" yap) ----
router.delete("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(productsTable).set({ name: "[Kaldırıldı - Admin]" }).where(eq(productsTable.id, id));
  res.json({ success: true });
});

// ---- Reklam Kampanyaları ----
router.get("/campaigns", async (_req, res) => {
  const campaigns = await db.select({
    id: adCampaignsTable.id,
    title: adCampaignsTable.title,
    status: adCampaignsTable.status,
    budget: adCampaignsTable.budget,
    spent: adCampaignsTable.spent,
    startDate: adCampaignsTable.startDate,
    endDate: adCampaignsTable.endDate,
    createdAt: adCampaignsTable.createdAt,
    advertiserEmail: userAccountsTable.email,
    advertiserName: userAccountsTable.displayName,
  }).from(adCampaignsTable)
    .leftJoin(userAccountsTable, eq(adCampaignsTable.advertiserId, userAccountsTable.id))
    .orderBy(desc(adCampaignsTable.createdAt))
    .limit(50);
  res.json({ campaigns });
});

router.post("/campaigns/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(adCampaignsTable).set({ status: "active" }).where(eq(adCampaignsTable.id, id));
  res.json({ success: true });
});

router.post("/campaigns/:id/reject", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(adCampaignsTable).set({ status: "rejected" }).where(eq(adCampaignsTable.id, id));
  res.json({ success: true });
});

// ---- Havuz Yönetimi ----
router.get("/pool", async (_req, res) => {
  const pools = await db.select().from(monthlyPoolTable).orderBy(desc(monthlyPoolTable.yearMonth)).limit(12);
  res.json({ pools });
});

router.post("/pool/set", async (req, res) => {
  const { yearMonth, poolAmount } = req.body;
  if (!yearMonth || !poolAmount) return res.status(400).json({ error: "yearMonth ve poolAmount gerekli" });
  await db.insert(monthlyPoolTable).values({ yearMonth, poolAmount: parseFloat(poolAmount), poolPercent: 30 })
    .onConflictDoUpdate({ target: monthlyPoolTable.yearMonth, set: { poolAmount: parseFloat(poolAmount) } });
  res.json({ success: true });
});

// ---- Ay Sonu Reset & Kazanç Dağıtımı ----
// POST /api/admin/month-end-reset
// 1. Belirtilen ay için composite puan bazlı sıralama hesapla (user_monthly_points)
// 2. %50 → top 1000 (proportional by totalPoints), %40 → 1001+ (equal), %10 → platform
// 3. userMonthlyEarningsTable'a yaz, championHistoryTable'a top 5'i kaydet
// 4. Pool'u "distributed" olarak işaretle
router.post("/month-end-reset", async (req, res) => {
  const { yearMonth } = req.body;
  const ym: string = yearMonth || new Date().toISOString().slice(0, 7);

  // 1. Pool al
  const [pool] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, ym));
  if (!pool) return res.status(404).json({ error: `${ym} için havuz bulunamadı` });
  if (pool.status === "distributed") return res.status(400).json({ error: "Bu ay zaten dağıtıldı" });

  const totalPool = pool.poolAmount;
  const top1000Pool = totalPool * 0.50;
  const restPool = totalPool * 0.40;
  const platformPool = totalPool * 0.10;

  // 2. O aya ait kullanıcı → composite toplam puan (tıklama + aktivite + bonus)
  const pointsResult = await db.execute(sql`
    SELECT user_id, total_points, click_points, activity_points, bonus_points
    FROM user_monthly_points
    WHERE year_month = ${ym}
      AND total_points > 0
    ORDER BY total_points DESC
  `);
  const pointRows = (pointsResult as any).rows ?? pointsResult;

  const ranked = (pointRows as any[]).map((r, i) => ({
    userId: Number(r.user_id),
    totalPoints: Number(r.total_points),
    clickPoints: Number(r.click_points),
    rank: i + 1,
  }));

  if (ranked.length === 0) {
    return res.json({ success: true, message: "Bu ay puanlanan kullanıcı yok, dağıtılacak kazanç yok", distributed: 0 });
  }

  const top1000 = ranked.slice(0, 1000);
  const rest = ranked.slice(1000);

  const totalTop1000Points = top1000.reduce((s, u) => s + u.totalPoints, 0);
  const equalShare = rest.length > 0 ? restPool / rest.length : 0;

  const results: Array<{ userId: number; rank: number; totalPoints: number; earningsAmount: number }> = [];

  for (const u of top1000) {
    const share = totalTop1000Points > 0 ? (u.totalPoints / totalTop1000Points) * top1000Pool : 0;
    results.push({ userId: u.userId, rank: u.rank, totalPoints: u.totalPoints, earningsAmount: parseFloat(share.toFixed(2)) });
  }
  for (const u of rest) {
    results.push({ userId: u.userId, rank: u.rank, totalPoints: u.totalPoints, earningsAmount: parseFloat(equalShare.toFixed(2)) });
  }

  // 3. userMonthlyEarningsTable'a ekle/güncelle
  for (const r of results) {
    await db.insert(userMonthlyEarningsTable).values({
      userId: r.userId,
      yearMonth: ym,
      totalClicks: r.totalPoints, // Geriye dönük uyumluluk için alan adı totalClicks olarak kalıyor
      earningsAmount: r.earningsAmount,
      status: "withdrawable",
    }).onConflictDoNothing();
  }

  // 4. Top 5 → championHistoryTable
  const top5 = results.slice(0, 5);
  for (const r of top5) {
    await db.insert(championHistoryTable).values({
      userId: r.userId,
      yearMonth: ym,
      finalRank: r.rank,
      totalPoints: r.totalPoints,
      earnings: r.earningsAmount,
    }).onConflictDoNothing();
  }

  // 5. Pool'u distributed yap
  await db.update(monthlyPoolTable)
    .set({ status: "distributed", calculatedAt: new Date() })
    .where(eq(monthlyPoolTable.yearMonth, ym));

  res.json({
    success: true,
    yearMonth: ym,
    totalPool,
    platformPool: parseFloat(platformPool.toFixed(2)),
    participantCount: results.length,
    top1000Count: top1000.length,
    restCount: rest.length,
    distributed: results.length,
    top5: top5.map(r => ({ userId: r.userId, rank: r.rank, totalPoints: r.totalPoints, earnings: r.earningsAmount })),
  });
});

// POST /api/admin/distribute-registration-rewards
// Belirtilen ayda kayıt olan kullanıcılara kayıt ödülü dağıt (registrationRewardPool'dan)
router.post("/distribute-registration-rewards", async (req, res) => {
  const { yearMonth, rewardPerUser } = req.body;
  const ym: string = yearMonth || new Date().toISOString().slice(0, 7);
  const reward = parseFloat(rewardPerUser ?? "10"); // Varsayılan: 10 TL

  if (isNaN(reward) || reward <= 0) {
    return res.status(400).json({ error: "Geçerli bir rewardPerUser değeri girin" });
  }

  // O ay içinde kayıt olan kullanıcıları bul
  const monthStart = new Date(`${ym}-01T00:00:00.000Z`);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const newUsers = await db.select({ id: userAccountsTable.id, email: userAccountsTable.email })
    .from(userAccountsTable)
    .where(and(
      sql`${userAccountsTable.createdAt} >= ${monthStart.toISOString()}`,
      sql`${userAccountsTable.createdAt} < ${monthEnd.toISOString()}`,
    ));

  if (newUsers.length === 0) {
    return res.json({ success: true, message: "Bu ayda kayıt olan kullanıcı yok", rewarded: 0 });
  }

  // Her yeni kullanıcıya puan olarak kayıt ödülü ver (puan eventi)
  let rewarded = 0;
  for (const u of newUsers) {
    const ref = `registration-reward-${ym}-${u.id}`;
    const [existing] = await db.select({ id: pointEventsTable.id })
      .from(pointEventsTable)
      .where(and(eq(pointEventsTable.userId, u.id), eq(pointEventsTable.referenceId, ref)));
    if (!existing) {
      await db.insert(pointEventsTable).values({
        userId: u.id,
        type: "registration_reward",
        points: Math.round(reward * 10), // TL yerine puan (1 TL ≈ 10 puan)
        description: `${ym} kayıt ödülü: ${reward} TL değerinde`,
        referenceId: ref,
      });
      await db.update(userAccountsTable)
        .set({ totalPoints: sql`${userAccountsTable.totalPoints} + ${Math.round(reward * 10)}` })
        .where(eq(userAccountsTable.id, u.id));
      rewarded++;
    }
  }

  res.json({
    success: true,
    yearMonth: ym,
    rewardPerUser: reward,
    totalNewUsers: newUsers.length,
    rewarded,
    totalDistributed: parseFloat((rewarded * reward).toFixed(2)),
  });
});

export default router;
