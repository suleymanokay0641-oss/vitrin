import { Router, type IRouter } from "express";
import { scrapeProduct } from "../lib/scraper";
import { db } from "@workspace/db";
import { productsTable, pricesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { checkAndFireAlarms } from "./alarms";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).json({ error: "url parametresi gereklidir" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Geçersiz URL formatı" });
  }

  try {
    const result = await scrapeProduct(url);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    res.status(422).json({ error: `Ürün bilgisi çekilemedi: ${message}` });
  }
});

export default router;

export async function refreshProductPrice(productId: number) {
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) throw new Error("Ürün bulunamadı");
  if (!product.storeUrl) throw new Error("Bu ürün için mağaza URL'si kayıtlı değil");

  const scraped = await scrapeProduct(product.storeUrl);

  if (!scraped.currentPrice) {
    throw new Error("Güncel fiyat çekilemedi - site erişimi engellenmiş olabilir");
  }

  const prices = await db
    .select()
    .from(pricesTable)
    .where(eq(pricesTable.productId, productId))
    .orderBy(asc(pricesTable.recordedAt));

  const previousPrice = prices.length > 0 ? prices[prices.length - 1].price : product.originalPrice;

  // Sanity check — reject clearly bad parses (less than 2% or more than 5x previous price)
  const ratio = scraped.currentPrice / previousPrice;
  if (ratio < 0.02 || ratio > 5) {
    throw new Error(
      `Geçersiz fiyat tespit edildi: ₺${scraped.currentPrice.toLocaleString("tr-TR")} (önceki: ₺${previousPrice.toLocaleString("tr-TR")}). Sayfa yapısı değişmiş olabilir.`
    );
  }

  const changed = Math.abs(scraped.currentPrice - previousPrice) > 0.01;

  if (changed) {
    await db.insert(pricesTable).values({
      productId,
      price: scraped.currentPrice,
      note: "Otomatik güncelleme",
    });

    // Fiyat düştüyse alarmları kontrol et
    if (scraped.currentPrice < previousPrice) {
      checkAndFireAlarms(productId, scraped.currentPrice, {
        name: product.name,
        storeUrl: product.storeUrl ?? null,
        imageUrl: product.imageUrl ?? null,
      }).catch((err) => console.error("[alarm] Kontrol hatası:", err));
    }
  }

  // Update image and storeOffers when available
  const updateFields: { imageUrl?: string; lastOffersJson?: string } = {};
  if (scraped.imageUrl && !product.imageUrl) updateFields.imageUrl = scraped.imageUrl;
  if (scraped.storeOffers && scraped.storeOffers.length > 0) {
    updateFields.lastOffersJson = JSON.stringify(scraped.storeOffers);
  }
  if (Object.keys(updateFields).length > 0) {
    await db.update(productsTable).set(updateFields).where(eq(productsTable.id, productId));
  }

  return {
    success: true,
    newPrice: scraped.currentPrice,
    previousPrice,
    changed,
    message: changed
      ? `Fiyat güncellendi: ₺${previousPrice.toLocaleString("tr-TR")} → ₺${scraped.currentPrice.toLocaleString("tr-TR")}`
      : "Fiyat değişmedi",
  };
}
