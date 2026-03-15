import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, pricesTable } from "@workspace/db";
import { eq, ilike, or, desc, asc, and, gte, sql } from "drizzle-orm";
import { userAccountsTable, pointEventsTable, userMonthlyPointsTable } from "@workspace/db";
import {
  uniqueProductClicksTable, reviewsTable, votesTable,
  priceAlarmsTable, collectionItemsTable, gameScoresTable, pageOwnerRevenueTable,
} from "@workspace/db";
import { refreshProductPrice } from "./scrape";
import { findOfficialPrice } from "../lib/official-price-scraper";
import { buildAffiliateUrl } from "../lib/affiliate";
import { recordUniqueClick } from "./earnings";
import { optionalAuth, requireAuth, type AuthRequest } from "../middleware/auth";
import crypto from "crypto";

function getYearMonth(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function upsertMonthlyClickPoints(userId: number, points: number) {
  const ym = getYearMonth();
  const [existing] = await db.select({ id: userMonthlyPointsTable.id })
    .from(userMonthlyPointsTable)
    .where(and(eq(userMonthlyPointsTable.userId, userId), eq(userMonthlyPointsTable.yearMonth, ym)));
  if (existing) {
    await db.update(userMonthlyPointsTable)
      .set({
        clickPoints: sql`${userMonthlyPointsTable.clickPoints} + ${points}`,
        totalPoints: sql`${userMonthlyPointsTable.totalPoints} + ${points}`,
      })
      .where(and(eq(userMonthlyPointsTable.userId, userId), eq(userMonthlyPointsTable.yearMonth, ym)));
  } else {
    await db.insert(userMonthlyPointsTable).values({
      userId, yearMonth: ym,
      clickPoints: points, activityPoints: 0, bonusPoints: 0, totalPoints: points,
    });
  }
}

const router: IRouter = Router();

function computeStats(prices: { price: number; recordedAt: Date }[], originalPrice: number) {
  const allPrices = prices.map((p) => p.price);
  const currentPrice = allPrices.length > 0 ? allPrices[allPrices.length - 1] : originalPrice;
  const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : originalPrice;
  const highestPrice = allPrices.length > 0 ? Math.max(...allPrices) : originalPrice;
  const discountPercent =
    originalPrice > 0 ? Math.max(0, ((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const recentPrices = prices.slice(-30);
  const avgRecentPrice =
    recentPrices.length > 1
      ? recentPrices.slice(0, -1).reduce((sum, p) => sum + p.price, 0) / (recentPrices.length - 1)
      : originalPrice;
  const isFakeDiscount = discountPercent > 5 && currentPrice >= avgRecentPrice * 0.97;

  return { currentPrice, lowestPrice, highestPrice, discountPercent, isFakeDiscount };
}

router.get("/search", async (req, res) => {
  const q = (req.query.q as string) || "";
  const category = req.query.category as string | undefined;

  let products;
  if (q || category) {
    const conditions = [];
    if (q) {
      conditions.push(ilike(productsTable.name, `%${q}%`));
      conditions.push(ilike(productsTable.brand, `%${q}%`));
    }

    let query = db.select().from(productsTable);
    if (conditions.length > 0 && category) {
      products = await query
        .where(
          or(
            ...conditions,
            eq(productsTable.category, category)
          )
        )
        .orderBy(desc(productsTable.createdAt))
        .limit(50);
    } else if (conditions.length > 0) {
      products = await query.where(or(...conditions)).orderBy(desc(productsTable.createdAt)).limit(50);
    } else if (category) {
      products = await query
        .where(eq(productsTable.category, category))
        .orderBy(desc(productsTable.createdAt))
        .limit(50);
    } else {
      products = await query.orderBy(desc(productsTable.createdAt)).limit(50);
    }
  } else {
    products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt)).limit(50);
  }

  const result = await Promise.all(
    products.map(async (product) => {
      const prices = await db
        .select()
        .from(pricesTable)
        .where(eq(pricesTable.productId, product.id))
        .orderBy(asc(pricesTable.recordedAt));

      const stats = computeStats(prices, product.originalPrice);

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl,
        store: product.store,
        originalPrice: product.originalPrice,
        lastUpdated: prices.length > 0 ? prices[prices.length - 1].recordedAt : product.createdAt,
        ...stats,
      };
    })
  );

  res.json(result);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const prices = await db
    .select()
    .from(pricesTable)
    .where(eq(pricesTable.productId, id))
    .orderBy(asc(pricesTable.recordedAt));

  const stats = computeStats(prices, product.originalPrice);

  let storeOffers: unknown[] = [];
  try {
    storeOffers = product.lastOffersJson ? JSON.parse(product.lastOffersJson) : [];
  } catch { /* ignore bad JSON */ }

  res.json({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    imageUrl: product.imageUrl,
    store: product.store,
    storeUrl: product.storeUrl,
    originalPrice: product.originalPrice,
    officialPrice: product.officialPrice ?? null,
    officialStoreUrl: product.officialStoreUrl ?? null,
    officialStoreName: product.officialStoreName ?? null,
    createdAt: product.createdAt,
    storeOffers,
    priceHistory: prices.map((p) => ({
      id: p.id,
      productId: p.productId,
      price: p.price,
      note: p.note,
      recordedAt: p.recordedAt,
    })),
    ...stats,
  });
});

router.post("/", optionalAuth as any, async (req: AuthRequest, res) => {
  const { name, brand, category, description, imageUrl, store, storeUrl, initialPrice, originalPrice, currentPrice, storeOffers } = req.body;
  // currentPrice fallback: mobil app currentPrice ile gönderiyor olabilir
  const finalOriginalPrice = Number(originalPrice || currentPrice || initialPrice || 0);
  const finalInitialPrice = Number(initialPrice || currentPrice || originalPrice || 0);

  const lastOffersJson = storeOffers && Array.isArray(storeOffers) && storeOffers.length > 0
    ? JSON.stringify(storeOffers)
    : null;

  // Try to find official brand store price in background (non-blocking)
  let officialPrice: number | null = null;
  let officialStoreUrl: string | null = null;
  let officialStoreName: string | null = null;
  try {
    const official = await findOfficialPrice(name, brand);
    if (official) {
      officialPrice = official.price;
      officialStoreUrl = official.storeUrl;
      officialStoreName = official.storeName;
      console.log(`[official-price] "${name}" için ${official.storeName}: ${official.price} ₺`);
    }
  } catch { /* non-critical — proceed without official price */ }

  // JWT'den kullanıcı kimliğini al (güvenli — client'a güvenme)
  const validCreatedByUserId = req.userId ?? null;

  const [product] = await db
    .insert(productsTable)
    .values({ name, brand: brand || "", category: category || "Genel", description, imageUrl, store: store || "Diğer", storeUrl, originalPrice: finalOriginalPrice, lastOffersJson, officialPrice, officialStoreUrl, officialStoreName, createdByUserId: validCreatedByUserId })
    .returning();

  await db.insert(pricesTable).values({ productId: product.id, price: finalInitialPrice });

  const prices = await db
    .select()
    .from(pricesTable)
    .where(eq(pricesTable.productId, product.id))
    .orderBy(asc(pricesTable.recordedAt));

  const stats = computeStats(prices, product.originalPrice);

  res.status(201).json({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    imageUrl: product.imageUrl,
    store: product.store,
    storeUrl: product.storeUrl,
    affiliateUrl: buildAffiliateUrl(product.storeUrl),
    originalPrice: product.originalPrice,
    officialPrice: product.officialPrice ?? null,
    officialStoreUrl: product.officialStoreUrl ?? null,
    officialStoreName: product.officialStoreName ?? null,
    createdAt: product.createdAt,
    priceHistory: prices.map((p) => ({
      id: p.id,
      productId: p.productId,
      price: p.price,
      note: p.note,
      recordedAt: p.recordedAt,
    })),
    ...stats,
  });
});

// PATCH /:id/official-price — manually set or update the official store price
router.patch("/:id/official-price", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

  const { officialPrice, officialStoreUrl, officialStoreName } = req.body;
  if (!officialPrice || typeof officialPrice !== "number" || officialPrice <= 0) {
    return res.status(400).json({ error: "Geçerli bir resmi fiyat girin" });
  }

  const [updated] = await db
    .update(productsTable)
    .set({
      officialPrice,
      officialStoreUrl: officialStoreUrl || null,
      officialStoreName: officialStoreName || "Resmi Mağaza",
    })
    .where(eq(productsTable.id, id))
    .returning();

  res.json({
    officialPrice: updated.officialPrice,
    officialStoreUrl: updated.officialStoreUrl,
    officialStoreName: updated.officialStoreName,
  });
});

router.post("/:id/refresh", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  try {
    const result = await refreshProductPrice(id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    const status = message.includes("bulunamadı") ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

router.post("/:id/prices", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const { price, note } = req.body;
  const [entry] = await db.insert(pricesTable).values({ productId: id, price, note }).returning();

  res.status(201).json({
    id: entry.id,
    productId: entry.productId,
    price: entry.price,
    note: entry.note,
    recordedAt: entry.recordedAt,
  });
});

// POST /api/products/:id/affiliate-click
// Kural: Aynı kişi (giriş yaptıysa: userId, yapmadıysa: IP) aynı ürüne günde 1 kez puan kazandırır
// isExternal=true → tıklayan dışarıdan gelmiş (sosyal medya vb.) → ürün sahibi 2x puan kazanır
router.post("/:id/affiliate-click", optionalAuth as any, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Geçersiz ürün" });

  // Referrer tabanlı dış tıklama tespiti: client'tan gelen flag veya Referer başlığından çıkar
  const isExternalBody = req.body?.isExternal === true;
  const refererHeader = req.headers["referer"] || req.headers["referrer"] || "";
  // Vitrin kendi domaininden gelen istekler internal; boş veya farklı domain → external
  const isExternalReferer = typeof refererHeader === "string" && refererHeader.length > 0
    ? !refererHeader.includes("vitrin") && !refererHeader.includes(req.headers.host || "")
    : false;
  const isExternal = isExternalBody || isExternalReferer;

  // Tıklayan kim? JWT'den al, yoksa IP kullan
  const clickerUserId = req.userId || null;
  const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket?.remoteAddress
    || "unknown";
  const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16);

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

  // Mağaza URL'sini döndür
  const affiliateUrl = buildAffiliateUrl(product.storeUrl) || product.storeUrl || null;

  // Click sayacı her zaman artar (istatistik için)
  await db.update(productsTable)
    .set({ affiliateClickCount: sql`${productsTable.affiliateClickCount} + 1` })
    .where(eq(productsTable.id, id));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  // Benzersiz anahtar: giriş yaptıysa userId, yapmadıysa IP hash
  const clickerKey = clickerUserId ? `user-${clickerUserId}` : `ip-${ipHash}`;

  // Kendi ürününe tıklamak puan kazandırmaz
  const isSelfClick = clickerUserId != null && product.createdByUserId === clickerUserId;
  const results = { creatorEarned: 0, clickerEarned: 0, alreadyCounted: false };

  if (!isSelfClick) {
    // Yeni hesap koruması: 3 günden genç hesaplar ürün sahibine puan kazandıramaz
    let clickerIsNewAccount = false;
    if (clickerUserId) {
      const [clickerAcc] = await db.select({ createdAt: userAccountsTable.createdAt })
        .from(userAccountsTable).where(eq(userAccountsTable.id, clickerUserId));
      const ageMs = clickerAcc ? Date.now() - new Date(clickerAcc.createdAt).getTime() : 0;
      clickerIsNewAccount = ageMs < 3 * 24 * 60 * 60 * 1000;
    }

    // Hız limiti: Bir kullanıcı günde 50'den fazla FARKLI ürüne puan kazandırdıysa → bot şüphesi
    let clickerOverLimit = false;
    if (clickerUserId && !clickerIsNewAccount) {
      const [velocityRow] = await db.select({ cnt: sql<number>`count(*)::int` })
        .from(pointEventsTable)
        .where(and(
          eq(pointEventsTable.userId, clickerUserId),
          eq(pointEventsTable.type, "affiliate_click"),
          gte(pointEventsTable.createdAt, today),
        ));
      clickerOverLimit = (velocityRow?.cnt ?? 0) >= 50;
    }

    // --- Ürün sahibi puan kazanır (bu tıklayan için günde 1 bu ürün için) ---
    if (product.createdByUserId && !clickerIsNewAccount && !clickerOverLimit) {
      const creatorRef = `click-creator-${id}-${clickerKey}-${todayStr}`;
      const [existing] = await db.select({ id: pointEventsTable.id })
        .from(pointEventsTable)
        .where(and(
          eq(pointEventsTable.userId, product.createdByUserId),
          eq(pointEventsTable.type, "product_click_earned"),
          eq(pointEventsTable.referenceId, creatorRef),
        ));

      if (existing) {
        results.alreadyCounted = true;
      } else {
        try {
          // Dış tıklama (sosyal medya vb.) 2x puan kazandırır
          const creatorPoints = isExternal ? 10 : 5;
          const desc = isExternal
            ? `"${product.name.slice(0, 40)}" — dış tıklama (2x puan)`
            : `"${product.name.slice(0, 40)}" ürününe tıklama`;
          await db.insert(pointEventsTable).values({
            userId: product.createdByUserId,
            type: "product_click_earned",
            points: creatorPoints,
            description: desc,
            referenceId: creatorRef,
          });
          await db.update(userAccountsTable)
            .set({ totalPoints: sql`${userAccountsTable.totalPoints} + ${creatorPoints}` })
            .where(eq(userAccountsTable.id, product.createdByUserId));
          // Aylık puanlar tablosunu da güncelle (sıralama için)
          await upsertMonthlyClickPoints(product.createdByUserId, creatorPoints);
          results.creatorEarned = creatorPoints;
        } catch {
          // Ürün sahibi silinmiş olabilir — sessizce geç
        }
      }
    }

    // --- Tıklayan kişi de puan kazanır (giriş yaptıysa, günde 1 bu ürün için) ---
    if (clickerUserId && !clickerIsNewAccount && !clickerOverLimit) {
      const clickerRef = `click-clicker-${id}-user-${clickerUserId}-${todayStr}`;
      const [existingClicker] = await db.select({ id: pointEventsTable.id })
        .from(pointEventsTable)
        .where(and(
          eq(pointEventsTable.userId, clickerUserId),
          eq(pointEventsTable.type, "affiliate_click"),
          eq(pointEventsTable.referenceId, clickerRef),
        ));
      if (!existingClicker) {
        try {
          await db.insert(pointEventsTable).values({
            userId: clickerUserId,
            type: "affiliate_click",
            points: 5,
            description: `Mağaza ziyareti: ${product.store || product.name.slice(0, 30)}`,
            referenceId: clickerRef,
          });
          await db.update(userAccountsTable)
            .set({ totalPoints: sql`${userAccountsTable.totalPoints} + 5` })
            .where(eq(userAccountsTable.id, clickerUserId));
          results.clickerEarned = 5;
        } catch {
          // Tıklayan kullanıcı silinmiş olabilir — sessizce geç
        }
      }
    }
  }

  res.json({ affiliateUrl, ...results });
});

// DELETE /api/products/:id — sadece ürünü ekleyen kullanıcı silebilir
router.delete("/:id", optionalAuth as any, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "Geçersiz ürün ID" });
  if (!req.userId) return res.status(401).json({ error: "Giriş gerekli" });

  const [product] = await db.select({ id: productsTable.id, createdByUserId: productsTable.createdByUserId })
    .from(productsTable).where(eq(productsTable.id, id));

  if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });
  if (product.createdByUserId !== req.userId) return res.status(403).json({ error: "Bu ürünü silme yetkin yok" });

  await db.delete(uniqueProductClicksTable).where(eq(uniqueProductClicksTable.productId, id));
  await db.delete(reviewsTable).where(eq(reviewsTable.productId, id));
  await db.delete(votesTable).where(eq(votesTable.productId, id));
  await db.delete(priceAlarmsTable).where(eq(priceAlarmsTable.productId, id));
  await db.delete(collectionItemsTable).where(eq(collectionItemsTable.productId, id));
  await db.delete(gameScoresTable).where(eq(gameScoresTable.productId, id));
  await db.delete(pageOwnerRevenueTable).where(eq(pageOwnerRevenueTable.productId, id));
  await db.delete(pricesTable).where(eq(pricesTable.productId, id));
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

export default router;
