import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  userMonthlyPointsTable, userAccountsTable, monthlyPoolTable,
} from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router: IRouter = Router();

const TOP_POOL_SLOTS = 1000;
const TOP_SHARE = 0.50;
const REST_SHARE = 0.40;

function getYearMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function anonymizeName(displayName?: string | null, email?: string | null, userId?: number): string {
  if (displayName && displayName.trim().length > 0) {
    // Soyadının sadece ilk harfini göster: "Süleyman K."
    const parts = displayName.trim().split(" ");
    if (parts.length > 1) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    return parts[0];
  }
  if (!email) return `Vitrinör #${userId}`;
  const [local] = email.split("@");
  if (local.length <= 2) return local + "***";
  return local.slice(0, 2) + "*".repeat(Math.min(local.length - 2, 4));
}

function getDaysRemaining(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Kazanç tahmini: top 1000 → orantılı, 1001+ → eşit bölüşüm
function calcEarnings(rank: number, pts: number, topPts: number, poolAmount: number, restCount: number): number {
  const topPool = poolAmount * TOP_SHARE;
  const restPool = poolAmount * REST_SHARE;
  if (rank <= TOP_POOL_SLOTS && topPts > 0) {
    return (pts / topPts) * topPool;
  } else if (restCount > 0) {
    return restPool / restCount;
  }
  return 0;
}

// GET /api/rankings/live — Bu ayki canlı sıralama (user_monthly_points tablosundan)
router.get("/live", async (req, res) => {
  const limit = Math.min(parseInt(req.query["limit"] as string || "100"), 2000);
  const yearMonth = getYearMonth();

  const [pool] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, yearMonth));
  const poolAmount = pool?.poolAmount ?? parseFloat(process.env["MONTHLY_POOL_TL"] || "500");

  // Tüm kullanıcıları bu ay toplam puanlarına göre sırala
  const allRanked = await db
    .select({
      userId: userMonthlyPointsTable.userId,
      totalPoints: userMonthlyPointsTable.totalPoints,
      clickPoints: userMonthlyPointsTable.clickPoints,
      activityPoints: userMonthlyPointsTable.activityPoints,
      bonusPoints: userMonthlyPointsTable.bonusPoints,
      displayName: userAccountsTable.displayName,
      email: userAccountsTable.email,
    })
    .from(userMonthlyPointsTable)
    .leftJoin(userAccountsTable, eq(userMonthlyPointsTable.userId, userAccountsTable.id))
    .where(eq(userMonthlyPointsTable.yearMonth, yearMonth))
    .orderBy(desc(userMonthlyPointsTable.totalPoints));

  const topPts = allRanked.slice(0, TOP_POOL_SLOTS).reduce((s, u) => s + u.totalPoints, 0);
  const restCount = Math.max(0, allRanked.length - TOP_POOL_SLOTS);

  const ranked = allRanked.slice(0, limit).map((user, idx) => {
    const rank = idx + 1;
    const inPool = rank <= TOP_POOL_SLOTS;
    const estimated = calcEarnings(rank, user.totalPoints, topPts, poolAmount, restCount);
    return {
      rank,
      displayName: anonymizeName(user.displayName, user.email, user.userId),
      totalPoints: user.totalPoints,
      clickPoints: user.clickPoints,
      activityPoints: user.activityPoints,
      bonusPoints: user.bonusPoints,
      estimatedEarnings: parseFloat(estimated.toFixed(2)),
      inPool,
      inSecondPool: !inPool && rank > 0,
    };
  });

  res.json({
    ranked,
    meta: {
      yearMonth,
      poolAmount,
      totalParticipants: allRanked.length,
      topPoolSlots: TOP_POOL_SLOTS,
      daysRemaining: getDaysRemaining(),
      topPoolShare: TOP_SHARE,
      restPoolShare: REST_SHARE,
    },
  });
});

// GET /api/rankings/my/:userId — Kullanıcının kendi sıralaması
router.get("/my/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });

  const yearMonth = getYearMonth();
  const [pool] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, yearMonth));
  const poolAmount = pool?.poolAmount ?? parseFloat(process.env["MONTHLY_POOL_TL"] || "500");

  const allRanked = await db
    .select({
      userId: userMonthlyPointsTable.userId,
      totalPoints: userMonthlyPointsTable.totalPoints,
      clickPoints: userMonthlyPointsTable.clickPoints,
      activityPoints: userMonthlyPointsTable.activityPoints,
    })
    .from(userMonthlyPointsTable)
    .where(eq(userMonthlyPointsTable.yearMonth, yearMonth))
    .orderBy(desc(userMonthlyPointsTable.totalPoints));

  const totalUsers = await db.select({ count: count() }).from(userAccountsTable);
  const totalRegistered = Number(totalUsers[0]?.count ?? 0);

  const userIdx = allRanked.findIndex(u => u.userId === userId);
  const myEntry = allRanked[userIdx];

  const topPts = allRanked.slice(0, TOP_POOL_SLOTS).reduce((s, u) => s + u.totalPoints, 0);
  const restCount = Math.max(0, allRanked.length - TOP_POOL_SLOTS);

  if (!myEntry) {
    return res.json({
      rank: null, totalPoints: 0, clickPoints: 0, activityPoints: 0,
      estimatedEarnings: 0, inPool: false, inSecondPool: false,
      daysRemaining: getDaysRemaining(), totalParticipants: allRanked.length,
      totalRegistered, pointsToNextRank: null, nextRank: null, poolAmount,
    });
  }

  const rank = userIdx + 1;
  const estimated = calcEarnings(rank, myEntry.totalPoints, topPts, poolAmount, restCount);

  let pointsToNextRank: number | null = null;
  let nextRank: number | null = null;
  if (rank > 1) {
    const above = allRanked[userIdx - 1];
    pointsToNextRank = (above.totalPoints - myEntry.totalPoints) + 1;
    nextRank = rank - 1;
  }

  res.json({
    rank,
    totalPoints: myEntry.totalPoints,
    clickPoints: myEntry.clickPoints,
    activityPoints: myEntry.activityPoints,
    estimatedEarnings: parseFloat(estimated.toFixed(2)),
    inPool: rank <= TOP_POOL_SLOTS,
    inSecondPool: rank > TOP_POOL_SLOTS,
    daysRemaining: getDaysRemaining(),
    totalParticipants: allRanked.length,
    totalRegistered,
    pointsToNextRank,
    nextRank,
    poolAmount,
  });
});

export default router;
