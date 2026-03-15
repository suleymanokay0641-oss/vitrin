import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  userMonthlyEarningsTable, userAccountsTable, monthlyPoolTable, productsTable,
} from "@workspace/db";
import { eq, desc, inArray, isNotNull, sql, count } from "drizzle-orm";

const router: IRouter = Router();

function getYearMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function calcEarnings(rank: number, clicks: number, topClicks: number, poolAmount: number, restCount: number): number {
  const TOP_POOL_SLOTS = 1000;
  const TOP_SHARE = 0.50;
  const REST_SHARE = 0.40;
  if (rank <= TOP_POOL_SLOTS && topClicks > 0) {
    return (clicks / topClicks) * poolAmount * TOP_SHARE;
  } else if (restCount > 0) {
    return (poolAmount * REST_SHARE) / restCount;
  }
  return 0;
}

// GET /api/discover — öne çıkan vitrinler (tüm kullanıcılar, rank + ürün önizlemeleri)
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query["limit"] as string || "50"), 200);
    const yearMonth = getYearMonth();

    const [pool] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, yearMonth));
    const poolAmount = pool?.poolAmount ?? parseFloat(process.env["MONTHLY_POOL_TL"] || "500");

    // Tüm kayıtlı kullanıcıları al, earnings ile left join
    const allUsers = await db
      .select({
        userId: userAccountsTable.id,
        email: userAccountsTable.email,
        displayName: userAccountsTable.displayName,
        isChampion: userAccountsTable.isChampion,
        totalPoints: userAccountsTable.totalPoints,
        totalClicks: userMonthlyEarningsTable.totalClicks,
      })
      .from(userAccountsTable)
      .leftJoin(
        userMonthlyEarningsTable,
        eq(userMonthlyEarningsTable.userId, userAccountsTable.id),
      )
      .orderBy(desc(sql`COALESCE(${userMonthlyEarningsTable.totalClicks}, 0)`), desc(userAccountsTable.totalPoints))
      .limit(limit);

    if (allUsers.length === 0) {
      return res.json({ vitrins: [], yearMonth, poolAmount });
    }

    const userIds = allUsers.map(u => u.userId);

    // Ürün sayıları — tüm kullanıcılar
    const productCountRows = await db
      .select({
        userId: productsTable.createdByUserId,
        cnt: count(productsTable.id),
      })
      .from(productsTable)
      .where(inArray(productsTable.createdByUserId, userIds))
      .groupBy(productsTable.createdByUserId);

    const countByUser: Record<number, number> = {};
    for (const r of productCountRows) {
      if (r.userId !== null) countByUser[r.userId] = Number(r.cnt);
    }

    // Her kullanıcı için en iyi 3 resimli ürün
    const allProducts = await db
      .select({
        productId: productsTable.id,
        userId: productsTable.createdByUserId,
        name: productsTable.name,
        imageUrl: productsTable.imageUrl,
        store: productsTable.store,
      })
      .from(productsTable)
      .where(
        sql`${productsTable.createdByUserId} = ANY(${sql.raw(`ARRAY[${userIds.join(",")}]::int[]`)}) AND ${productsTable.imageUrl} IS NOT NULL`,
      )
      .orderBy(desc(productsTable.id));

    // Kullanıcı başına max 3 ürün
    const productsByUser: Record<number, typeof allProducts> = {};
    for (const p of allProducts) {
      if (!p.userId) continue;
      if (!productsByUser[p.userId]) productsByUser[p.userId] = [];
      if (productsByUser[p.userId].length < 3) productsByUser[p.userId].push(p);
    }

    // Tıklama toplamı hesapla (earnings tablosundaki veriler için)
    const topClicks = allUsers.slice(0, 1000).reduce((s, u) => s + (u.totalClicks ?? 0), 0);
    const usersWithClicks = allUsers.filter(u => (u.totalClicks ?? 0) > 0);
    const restCount = Math.max(0, usersWithClicks.length - 1000);

    // Sıralama ata — sadece tıklaması olanlar gerçek sıra alır
    let rankCounter = 0;
    const vitrins = allUsers.map(u => {
      const clicks = u.totalClicks ?? 0;
      const hasClicks = clicks > 0;
      if (hasClicks) rankCounter++;
      const rank = hasClicks ? rankCounter : 9999;
      const estimated = hasClicks
        ? calcEarnings(rank, clicks, topClicks, poolAmount, restCount)
        : 0;

      return {
        rank: hasClicks ? rank : null,
        userId: u.userId,
        displayName: u.displayName || u.email?.split("@")[0] || `Kullanıcı #${u.userId}`,
        username: (u.displayName?.toLowerCase() || u.email?.split("@")[0]?.toLowerCase() || `user${u.userId}`),
        totalClicks: clicks,
        totalPoints: u.totalPoints || 0,
        estimatedEarnings: parseFloat(estimated.toFixed(2)),
        isChampion: u.isChampion || false,
        productCount: countByUser[u.userId] || 0,
        previewProducts: (productsByUser[u.userId] || []).map(p => ({
          name: p.name,
          imageUrl: p.imageUrl,
          store: p.store,
        })),
      };
    });

    res.json({ vitrins, yearMonth, poolAmount });
  } catch (err) {
    console.error("[discover]", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

export default router;
