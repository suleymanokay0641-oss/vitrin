import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  userAccountsTable, productsTable, pointEventsTable, collectionsTable,
  userFollowsTable, userStreakTable, userMonthlyPointsTable, championHistoryTable,
  userMonthlyEarningsTable, pricesTable,
} from "@workspace/db";
import { eq, desc, sql, and, sum, inArray } from "drizzle-orm";
import { optionalAuth, requireAuth, type AuthRequest } from "../middleware/auth";

const router: IRouter = Router();

// GET /api/vitrin/me/products — kişisel ürün listesi (sahip için detaylı)
router.get("/me/products", requireAuth as any, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const products = await db.select({
    id: productsTable.id,
    name: productsTable.name,
    brand: productsTable.brand,
    imageUrl: productsTable.imageUrl,
    store: productsTable.store,
    storeUrl: productsTable.storeUrl,
    category: productsTable.category,
    affiliateClickCount: productsTable.affiliateClickCount,
    createdAt: productsTable.createdAt,
  }).from(productsTable)
    .where(eq(productsTable.createdByUserId, userId))
    .orderBy(desc(productsTable.createdAt));

  // Her ürün için kazanılan toplam puan
  const productIds = products.map(p => p.id.toString());
  let pointsPerProduct: Record<string, number> = {};
  if (productIds.length > 0) {
    const rows = await db.select({
      referenceId: pointEventsTable.referenceId,
      totalPoints: sql<number>`sum(points)::int`,
    }).from(pointEventsTable)
      .where(
        and(
          eq(pointEventsTable.userId, userId),
          eq(pointEventsTable.type, "product_click_earned"),
          sql`reference_id = ANY(ARRAY[${sql.raw(productIds.map(id => `'${id}'`).join(","))}])`
        )
      )
      .groupBy(pointEventsTable.referenceId);
    rows.forEach(r => { if (r.referenceId) pointsPerProduct[r.referenceId] = r.totalPoints; });
  }

  // Özet istatistikler
  const ym = new Date().toISOString().slice(0, 7);
  const [monthPoints] = await db.select().from(userMonthlyPointsTable)
    .where(and(eq(userMonthlyPointsTable.userId, userId), eq(userMonthlyPointsTable.yearMonth, ym)));
  const [streak] = await db.select().from(userStreakTable).where(eq(userStreakTable.userId, userId));
  const [userRow] = await db.select({ totalPoints: userAccountsTable.totalPoints, displayName: userAccountsTable.displayName, email: userAccountsTable.email })
    .from(userAccountsTable).where(eq(userAccountsTable.id, userId));

  const totalClicks = products.reduce((s, p) => s + (p.affiliateClickCount || 0), 0);
  const username = userRow?.displayName?.toLowerCase().replace(/\s+/g, "") || userRow?.email?.split("@")[0] || "";

  res.json({
    products: products.map(p => ({
      ...p,
      pointsEarned: pointsPerProduct[p.id.toString()] || 0,
    })),
    summary: {
      totalProducts: products.length,
      totalClicks,
      monthPoints: monthPoints?.totalPoints || 0,
      monthClickPoints: monthPoints?.clickPoints || 0,
      monthActivityPoints: monthPoints?.activityPoints || 0,
      currentStreak: streak?.currentStreak || 0,
      allTimePoints: userRow?.totalPoints || 0,
    },
    username,
  });
});

// GET /api/vitrin/:username — vitrin profili
router.get("/:username", optionalAuth as any, async (req: AuthRequest, res) => {
  const rawUsername = req.params.username;
  // E-posta veya display_name ile ara
  const [user] = await db.select({
    id: userAccountsTable.id,
    email: userAccountsTable.email,
    displayName: userAccountsTable.displayName,
    totalPoints: userAccountsTable.totalPoints,
    isChampion: userAccountsTable.isChampion,
    loyaltyMonths: userAccountsTable.loyaltyMonths,
    championMultiplier: userAccountsTable.championMultiplier,
    createdAt: userAccountsTable.createdAt,
  }).from(userAccountsTable)
    .where(
      sql`lower(display_name) = ${rawUsername.toLowerCase()} OR lower(split_part(email, '@', 1)) = ${rawUsername.toLowerCase()}`
    );

  if (!user) return res.status(404).json({ error: "Vitrin bulunamadı" });

  const isOwner = req.userId === user.id;

  // Eklediği ürünler (en son 20)
  const addedProducts = await db.select({
    id: productsTable.id, name: productsTable.name, brand: productsTable.brand,
    imageUrl: productsTable.imageUrl, store: productsTable.store, storeUrl: productsTable.storeUrl,
    originalPrice: productsTable.originalPrice,
    category: productsTable.category, createdAt: productsTable.createdAt,
  }).from(productsTable)
    .where(eq(productsTable.createdByUserId, user.id))
    .orderBy(desc(productsTable.createdAt))
    .limit(20);

  // Her ürünün en güncel fiyatını prices tablosundan al
  const productIds = addedProducts.map(p => p.id);
  let latestPriceMap: Record<number, number> = {};
  if (productIds.length > 0) {
    const result = await db.execute(sql`
      SELECT DISTINCT ON (product_id) product_id, price
      FROM prices
      WHERE product_id = ANY(ARRAY[${sql.raw(productIds.join(","))}]::int[])
        AND price > 0
      ORDER BY product_id, recorded_at DESC
    `);
    const rows = (result as any).rows ?? result;
    for (const row of rows as any[]) {
      latestPriceMap[row.product_id] = parseFloat(row.price);
    }
  }

  // Bu aya ait tıklama puanları
  const ym = new Date().toISOString().slice(0, 7);
  const [monthPoints] = await db.select().from(userMonthlyPointsTable)
    .where(and(eq(userMonthlyPointsTable.userId, user.id), eq(userMonthlyPointsTable.yearMonth, ym)));

  // Streak
  const [streak] = await db.select().from(userStreakTable).where(eq(userStreakTable.userId, user.id));

  // Koleksiyonlar (herkese açık)
  const collections = await db.select({
    id: collectionsTable.id, title: collectionsTable.title, slug: collectionsTable.slug,
    description: collectionsTable.description, viewCount: collectionsTable.viewCount,
    updatedAt: collectionsTable.updatedAt,
  }).from(collectionsTable)
    .where(isOwner
      ? eq(collectionsTable.userId, user.id)
      : and(eq(collectionsTable.userId, user.id), eq(collectionsTable.isPublic, true))
    )
    .orderBy(desc(collectionsTable.updatedAt))
    .limit(6);

  // Takipçi / takip sayısı
  const [followerCount] = await db.select({ count: sql<number>`count(*)::int` }).from(userFollowsTable).where(eq(userFollowsTable.followingId, user.id));
  const [followingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(userFollowsTable).where(eq(userFollowsTable.followerId, user.id));

  // Mevcut kullanıcı takip ediyor mu?
  let isFollowing = false;
  if (req.userId && req.userId !== user.id) {
    const [fRow] = await db.select({ id: userFollowsTable.id }).from(userFollowsTable)
      .where(and(eq(userFollowsTable.followerId, req.userId), eq(userFollowsTable.followingId, user.id)));
    isFollowing = !!fRow;
  }

  // Champion geçmişi (son 3 ay)
  const champHistory = await db.select().from(championHistoryTable)
    .where(eq(championHistoryTable.userId, user.id))
    .orderBy(desc(championHistoryTable.createdAt))
    .limit(3);

  // Bu ayki tıklama + sıralama (userMonthlyEarningsTable)
  const currentYm = new Date().toISOString().slice(0, 7);
  const [myEarnings] = await db.select({
    totalClicks: userMonthlyEarningsTable.totalClicks,
  })
    .from(userMonthlyEarningsTable)
    .where(and(
      eq(userMonthlyEarningsTable.userId, user.id),
      eq(userMonthlyEarningsTable.yearMonth, currentYm),
    ));

  // Sıra: kaç kişi bu kullanıcıdan fazla tıklama almış (0-indexed → +1)
  let monthlyRank: number | null = null;
  if (myEarnings && myEarnings.totalClicks > 0) {
    const [rankRow] = await db.select({ cnt: sql<number>`count(*)::int` })
      .from(userMonthlyEarningsTable)
      .where(and(
        eq(userMonthlyEarningsTable.yearMonth, currentYm),
        sql`${userMonthlyEarningsTable.totalClicks} > ${myEarnings.totalClicks}`,
      ));
    monthlyRank = (rankRow?.cnt ?? 0) + 1;
  }

  const username = user.displayName || user.email.split("@")[0];

  res.json({
    user: { ...user, username },
    isOwner,
    isFollowing,
    stats: {
      totalProducts: addedProducts.length,
      followerCount: followerCount?.count || 0,
      followingCount: followingCount?.count || 0,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      monthPoints: monthPoints?.totalPoints || 0,
      monthClickPoints: monthPoints?.clickPoints || 0,
      monthActivityPoints: monthPoints?.activityPoints || 0,
      monthlyClicks: myEarnings?.totalClicks || 0,
      monthlyRank,
    },
    addedProducts: addedProducts.map(p => ({
      ...p,
      displayPrice: (p.originalPrice && p.originalPrice > 0)
        ? p.originalPrice
        : (latestPriceMap[p.id] || null),
    })),
    collections,
    champHistory,
  });
});

export default router;
