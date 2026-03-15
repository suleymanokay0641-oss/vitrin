import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, pricesTable, gameScoresTable } from "@workspace/db";
import { eq, isNotNull, asc, desc, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/round", async (req, res) => {
  const excludeParam = (req.query.exclude as string) || "";
  const excludeIds = excludeParam
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n));

  let products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      brand: productsTable.brand,
      category: productsTable.category,
      imageUrl: productsTable.imageUrl,
    })
    .from(productsTable)
    .where(isNotNull(productsTable.imageUrl));

  if (excludeIds.length > 0) {
    products = products.filter((p) => !excludeIds.includes(p.id));
  }

  if (products.length === 0) {
    return res.status(404).json({ error: "Oynanacak ürün kalmadı. Tebrikler, hepsini bitirdin!" });
  }

  const pick = products[Math.floor(Math.random() * products.length)];

  const prices = await db
    .select({ price: pricesTable.price })
    .from(pricesTable)
    .where(eq(pricesTable.productId, pick.id))
    .orderBy(asc(pricesTable.recordedAt));

  const allPrices = prices.map((p) => p.price);
  const actual = allPrices.length > 0 ? allPrices[allPrices.length - 1] : 0;

  const factor = 0.4 + Math.random() * 0.4;
  const hintLow = Math.round(actual * (1 - factor) / 100) * 100;
  const hintHigh = Math.round(actual * (1 + factor) / 100) * 100;

  res.json({
    id: pick.id,
    name: pick.name,
    brand: pick.brand,
    category: pick.category,
    imageUrl: pick.imageUrl,
    hintRange: { low: Math.max(1, hintLow), high: hintHigh },
  });
});

router.post("/guess", async (req, res) => {
  const { productId, guessedPrice, playerName } = req.body;
  if (!productId || typeof guessedPrice !== "number" || guessedPrice <= 0) {
    return res.status(400).json({ error: "Geçersiz istek" });
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

  const prices = await db
    .select({ price: pricesTable.price })
    .from(pricesTable)
    .where(eq(pricesTable.productId, productId))
    .orderBy(asc(pricesTable.recordedAt));

  const allPrices = prices.map((p) => p.price);
  const actualPrice = allPrices.length > 0 ? allPrices[allPrices.length - 1] : product.originalPrice;

  const diff = Math.abs(guessedPrice - actualPrice) / actualPrice;
  const accuracy = Math.max(0, 1 - diff);
  const score = Math.round(accuracy * 100);
  const percentOff = Math.round(diff * 100);

  const level =
    score >= 95 ? "perfect" :
    score >= 80 ? "great" :
    score >= 60 ? "good" :
    score >= 40 ? "close" : "miss";

  await db.insert(gameScoresTable).values({
    playerName: (playerName as string)?.trim() || "Anonim",
    productId,
    guessedPrice,
    actualPrice,
    score,
  });

  res.json({
    actualPrice,
    productName: product.name,
    productImageUrl: product.imageUrl,
    score,
    accuracy,
    percentOff,
    level,
    guessedPrice,
  });
});

router.get("/leaderboard", async (_req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weekly = await db
    .select({
      playerName: gameScoresTable.playerName,
      bestScore: sql<number>`MAX(${gameScoresTable.score})`.as("best_score"),
      totalRounds: sql<number>`COUNT(*)`.as("total_rounds"),
      avgScore: sql<number>`ROUND(AVG(${gameScoresTable.score}))`.as("avg_score"),
    })
    .from(gameScoresTable)
    .where(gte(gameScoresTable.createdAt, oneWeekAgo))
    .groupBy(gameScoresTable.playerName)
    .orderBy(desc(sql`MAX(${gameScoresTable.score})`))
    .limit(10);

  const allTime = await db
    .select({
      playerName: gameScoresTable.playerName,
      bestScore: sql<number>`MAX(${gameScoresTable.score})`.as("best_score"),
      totalRounds: sql<number>`COUNT(*)`.as("total_rounds"),
    })
    .from(gameScoresTable)
    .groupBy(gameScoresTable.playerName)
    .orderBy(desc(sql`MAX(${gameScoresTable.score})`))
    .limit(10);

  const totalGames = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(gameScoresTable);

  res.json({
    weekly,
    allTime,
    totalGames: totalGames[0]?.count ?? 0,
    weeklyReward: process.env["WEEKLY_GAME_REWARD"] || null,
    weeklySponsor: process.env["WEEKLY_GAME_SPONSOR"] || null,
  });
});

export default router;
