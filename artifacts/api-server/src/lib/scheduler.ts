import cron from "node-cron";
import { db } from "@workspace/db";
import { productsTable, priceAlarmsTable, pointEventsTable, userAccountsTable } from "@workspace/db";
import { eq, and, isNotNull, isNull } from "drizzle-orm";
import { refreshProductPrice } from "../routes/scrape";

let isRunning = false;

async function checkPriceAlarms(productId: number, newPrice: number, productName: string) {
  // Bu ürüne ait aktif alarmları bul; targetPrice >= newPrice → alarm tetiklendi
  const triggered = await db.select().from(priceAlarmsTable)
    .where(and(
      eq(priceAlarmsTable.productId, productId),
      eq(priceAlarmsTable.isActive, true),
      isNull(priceAlarmsTable.triggeredAt),
    ));

  for (const alarm of triggered) {
    if (newPrice <= 0 || alarm.targetPrice < newPrice) continue;

    // Alarm email'ini user'a çevir
    const [user] = await db.select({ id: userAccountsTable.id })
      .from(userAccountsTable)
      .where(eq(userAccountsTable.email, alarm.email));

    if (user) {
      const ref = `price-drop-${alarm.id}-${productId}`;
      try {
        await db.insert(pointEventsTable).values({
          userId: user.id,
          type: "price_drop",
          points: 0,
          description: `"${productName.slice(0, 40)}" fiyatı ${newPrice.toLocaleString("tr-TR")} ₺'a düştü`,
          referenceId: ref,
        });
      } catch {
        // Duplicate — zaten bildirilmiş
      }
    }

    // Alarmı tetiklenmiş olarak işaretle
    await db.update(priceAlarmsTable)
      .set({ isActive: false, triggeredAt: new Date() })
      .where(eq(priceAlarmsTable.id, alarm.id));

    console.log(`[Zamanlayıcı] 🔔 Alarm tetiklendi: "${productName}" → ${newPrice} ₺ (hedef: ${alarm.targetPrice} ₺, email: ${alarm.email})`);
  }
}

export async function refreshAllProducts() {
  if (isRunning) {
    console.log("[Zamanlayıcı] Önceki yenileme hâlâ çalışıyor, atlanıyor.");
    return;
  }
  isRunning = true;

  console.log("[Zamanlayıcı] Tüm ürün fiyatları yenileniyor...");

  const products = await db
    .select({ id: productsTable.id, name: productsTable.name })
    .from(productsTable)
    .where(isNotNull(productsTable.storeUrl));

  console.log(`[Zamanlayıcı] ${products.length} ürün URL'si bulundu.`);

  let success = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const result = await refreshProductPrice(product.id);
      if (result.changed) {
        console.log(
          `[Zamanlayıcı] ✓ "${product.name}" — ${result.previousPrice} → ${result.newPrice} ₺`
        );
        // Fiyat değiştiyse alarm kontrolü yap
        if (result.newPrice && result.newPrice > 0) {
          await checkPriceAlarms(product.id, result.newPrice, product.name);
        }
      } else {
        console.log(`[Zamanlayıcı] - "${product.name}" — fiyat değişmedi`);
      }
      success++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "bilinmeyen hata";
      console.warn(`[Zamanlayıcı] ✗ "${product.name}" — hata: ${msg}`);
      failed++;
    }

    // Siteleri spam'lemememek için her istekten sonra 3 saniye bekle
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(
    `[Zamanlayıcı] Tamamlandı — ${success} başarılı, ${failed} başarısız.`
  );
  isRunning = false;
}

export function startScheduler() {
  // Her gün saat 06:00'da çalıştır (Türkiye saati UTC+3 için 03:00 UTC)
  cron.schedule(
    "0 3 * * *",
    async () => {
      console.log("[Zamanlayıcı] Günlük fiyat yenileme başladı...");
      await refreshAllProducts();
    },
    {
      timezone: "Europe/Istanbul",
    }
  );

  // Uygulama başladığında ilk 30 saniye sonra da bir kez çalıştır
  setTimeout(async () => {
    console.log("[Zamanlayıcı] İlk çalıştırma başlıyor (30 saniye sonra)...");
    await refreshAllProducts();
  }, 30_000);

  console.log("[Zamanlayıcı] Günlük fiyat yenileme zamanlandı (her gün 06:00 İstanbul).");
}
