import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, pointEventsTable, raffleTicketsTable, productsTable } from "@workspace/db";
import { eq, and, desc, sql, gte } from "drizzle-orm";

const router: IRouter = Router();

const POINT_RULES: Record<string, { points: number; label: string; dailyMax: number }> = {
  game:           { points: 10,  label: "Oyun turu",           dailyMax: 50  },
  product_add:    { points: 25,  label: "Ürün eklendi",        dailyMax: 75  },
  review:         { points: 15,  label: "Yorum yazıldı",       dailyMax: 30  },
  alarm:          { points: 10,  label: "Fiyat alarmı kuruldu",dailyMax: 10  },
  affiliate_click:{ points: 5,   label: "Mağaza ziyareti",     dailyMax: 15  },
  referral:       { points: 100, label: "Arkadaş daveti",      dailyMax: 200 },
};

function getWeekKey(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

router.post("/register", async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Geçerli bir e-posta adresi giriniz." });
  }
  const lowerEmail = email.toLowerCase().trim();
  const [existing] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.email, lowerEmail));
  if (existing) {
    return res.json({ userId: existing.id, email: existing.email, totalPoints: existing.totalPoints, isNew: false });
  }
  const [created] = await db.insert(userAccountsTable).values({ email: lowerEmail }).returning();
  res.json({ userId: created.id, email: created.email, totalPoints: 0, isNew: true });
});

router.get("/balance/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });

  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  const weekKey = getWeekKey();
  const [ticketRow] = await db
    .select({ count: sql<number>`COALESCE(SUM(${raffleTicketsTable.ticketCount}), 0)` })
    .from(raffleTicketsTable)
    .where(and(eq(raffleTicketsTable.userId, userId), eq(raffleTicketsTable.weekKey, weekKey)));

  const recentEvents = await db
    .select()
    .from(pointEventsTable)
    .where(eq(pointEventsTable.userId, userId))
    .orderBy(desc(pointEventsTable.createdAt))
    .limit(10);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const [weeklyPts] = await db
    .select({ total: sql<number>`COALESCE(SUM(${pointEventsTable.points}), 0)` })
    .from(pointEventsTable)
    .where(and(eq(pointEventsTable.userId, userId), gte(pointEventsTable.createdAt, weekStart)));

  res.json({
    userId: user.id,
    email: user.email,
    totalPoints: user.totalPoints,
    weeklyPoints: weeklyPts?.total ?? 0,
    weeklyTickets: ticketRow?.count ?? 0,
    weekKey,
    recentEvents,
  });
});

router.post("/earn", async (req, res) => {
  const { userId, type, referenceId, customPoints } = req.body;
  if (!userId || !type) return res.status(400).json({ error: "Eksik bilgi" });

  const rule = POINT_RULES[type];
  if (!rule) return res.status(400).json({ error: "Bilinmeyen işlem türü" });

  const points = typeof customPoints === "number" ? Math.min(customPoints, rule.points) : rule.points;

  if (referenceId) {
    const existing = await db
      .select()
      .from(pointEventsTable)
      .where(and(eq(pointEventsTable.userId, userId), eq(pointEventsTable.type, type), eq(pointEventsTable.referenceId, String(referenceId))));
    if (existing.length > 0) {
      const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
      return res.json({ success: false, reason: "duplicate", pointsEarned: 0, newTotal: user?.totalPoints ?? 0 });
    }
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [dailySum] = await db
    .select({ total: sql<number>`COALESCE(SUM(${pointEventsTable.points}), 0)` })
    .from(pointEventsTable)
    .where(and(eq(pointEventsTable.userId, userId), eq(pointEventsTable.type, type), gte(pointEventsTable.createdAt, today)));

  if ((dailySum?.total ?? 0) >= rule.dailyMax) {
    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    return res.json({ success: false, reason: "daily_limit", pointsEarned: 0, newTotal: user?.totalPoints ?? 0 });
  }

  await db.insert(pointEventsTable).values({
    userId,
    type,
    points,
    description: rule.label,
    referenceId: referenceId ? String(referenceId) : null,
  });

  const [updated] = await db
    .update(userAccountsTable)
    .set({ totalPoints: sql`${userAccountsTable.totalPoints} + ${points}` })
    .where(eq(userAccountsTable.id, userId))
    .returning();

  res.json({ success: true, pointsEarned: points, newTotal: updated.totalPoints });
});

router.post("/redeem/raffle", async (req, res) => {
  const { userId, ticketCount = 1 } = req.body;
  if (!userId || ticketCount < 1) return res.status(400).json({ error: "Geçersiz istek" });

  const cost = ticketCount * 100;
  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
  if (user.totalPoints < cost) return res.status(400).json({ error: `Yetersiz puan. Gerekli: ${cost}, Mevcut: ${user.totalPoints}` });

  const weekKey = getWeekKey();

  await db.insert(pointEventsTable).values({
    userId,
    type: "raffle_spend",
    points: -cost,
    description: `${ticketCount} çekiliş bileti`,
    referenceId: weekKey,
  });

  await db.update(userAccountsTable)
    .set({ totalPoints: sql`${userAccountsTable.totalPoints} - ${cost}` })
    .where(eq(userAccountsTable.id, userId));

  const [existing] = await db.select().from(raffleTicketsTable)
    .where(and(eq(raffleTicketsTable.userId, userId), eq(raffleTicketsTable.weekKey, weekKey)));

  if (existing) {
    await db.update(raffleTicketsTable)
      .set({ ticketCount: sql`${raffleTicketsTable.ticketCount} + ${ticketCount}` })
      .where(eq(raffleTicketsTable.id, existing.id));
  } else {
    await db.insert(raffleTicketsTable).values({ userId, weekKey, ticketCount });
  }

  const [updated] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  res.json({ success: true, weekKey, ticketsBought: ticketCount, newTotal: updated.totalPoints });
});

router.get("/my-products/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });

  const myProducts = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      store: productsTable.store,
      affiliateClickCount: productsTable.affiliateClickCount,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .where(eq(productsTable.createdByUserId, userId))
    .orderBy(desc(productsTable.affiliateClickCount))
    .limit(20);

  const [totalEarned] = await db
    .select({ total: sql<number>`COALESCE(SUM(${pointEventsTable.points}), 0)` })
    .from(pointEventsTable)
    .where(and(eq(pointEventsTable.userId, userId), eq(pointEventsTable.type, "product_click_earned")));

  res.json({ products: myProducts, totalClickEarned: totalEarned?.total ?? 0 });
});

router.get("/tournament", async (_req, res) => {
  const weekKey = getWeekKey();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const topEarners = await db
    .select({
      email: userAccountsTable.email,
      weeklyPoints: sql<number>`COALESCE(SUM(${pointEventsTable.points}), 0)`.as("weekly_points"),
    })
    .from(pointEventsTable)
    .innerJoin(userAccountsTable, eq(pointEventsTable.userId, userAccountsTable.id))
    .where(gte(pointEventsTable.createdAt, weekStart))
    .groupBy(userAccountsTable.email)
    .orderBy(desc(sql`COALESCE(SUM(${pointEventsTable.points}), 0)`))
    .limit(10);

  const [totalTickets] = await db
    .select({ count: sql<number>`COALESCE(SUM(${raffleTicketsTable.ticketCount}), 0)` })
    .from(raffleTicketsTable)
    .where(eq(raffleTicketsTable.weekKey, weekKey));

  const endOfWeek = new Date(weekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  res.json({
    weekKey,
    prize: process.env["WEEKLY_GAME_REWARD"] || "500 TL Trendyol Hediye Kartı",
    sponsor: process.env["WEEKLY_GAME_SPONSOR"] || "Trendyol",
    endDate: endOfWeek.toISOString(),
    totalTickets: totalTickets?.count ?? 0,
    topEarners: topEarners.map((e) => ({
      email: e.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
      weeklyPoints: e.weeklyPoints,
    })),
  });
});

export default router;
