import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { priceAlarmsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sendAlarmEmail } from "../lib/email";
import crypto from "node:crypto";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const router: IRouter = Router();

// POST /api/products/:id/alarms — alarm oluştur
router.post("/:id/alarms", async (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  const { email, targetPrice } = req.body ?? {};

  if (!email || !isValidEmail(String(email))) {
    return res.status(400).json({ error: "Geçerli bir e-posta adresi gereklidir" });
  }
  const price = Number(targetPrice);
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "Geçerli bir hedef fiyat gereklidir" });
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

  // Aynı email + aynı ürün için zaten aktif alarm varsa güncelle
  const existing = await db
    .select()
    .from(priceAlarmsTable)
    .where(
      and(
        eq(priceAlarmsTable.productId, productId),
        eq(priceAlarmsTable.email, email),
        eq(priceAlarmsTable.isActive, true)
      )
    );

  if (existing.length > 0) {
    // Mevcut alarmı güncelle
    await db
      .update(priceAlarmsTable)
      .set({ targetPrice: price })
      .where(eq(priceAlarmsTable.id, existing[0].id));

    return res.json({
      id: existing[0].id,
      token: existing[0].token,
      message: "Alarm güncellendi",
    });
  }

  const token = crypto.randomBytes(24).toString("hex");

  const [alarm] = await db
    .insert(priceAlarmsTable)
    .values({ productId, email, targetPrice: price, token, isActive: true })
    .returning();

  res.status(201).json({ id: alarm.id, token: alarm.token, message: "Alarm kuruldu" });
});

// GET /api/products/:id/alarms/:token — belirli token'ın alarmlarını getir
router.get("/:id/alarms/:token", async (req, res) => {
  const productId = parseInt(req.params.id);
  const { token } = req.params;
  if (isNaN(productId)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  const alarms = await db
    .select()
    .from(priceAlarmsTable)
    .where(
      and(
        eq(priceAlarmsTable.productId, productId),
        eq(priceAlarmsTable.token, token),
        eq(priceAlarmsTable.isActive, true)
      )
    );

  res.json(alarms);
});

// DELETE /api/alarms/:id — alarm iptal et
router.delete("/:alarmId", async (req, res) => {
  const alarmId = parseInt(req.params.alarmId);
  const token = req.query.token as string;

  if (isNaN(alarmId)) return res.status(400).json({ error: "Geçersiz alarm ID" });
  if (!token) return res.status(400).json({ error: "token gereklidir" });

  const [existing] = await db
    .select()
    .from(priceAlarmsTable)
    .where(and(eq(priceAlarmsTable.id, alarmId), eq(priceAlarmsTable.token, token)));

  if (!existing) return res.status(404).json({ error: "Alarm bulunamadı veya yetkiniz yok" });

  await db
    .update(priceAlarmsTable)
    .set({ isActive: false })
    .where(eq(priceAlarmsTable.id, alarmId));

  res.json({ message: "Alarm iptal edildi" });
});

export default router;

// Fiyat güncellenince çağrılan alarm kontrol fonksiyonu
export async function checkAndFireAlarms(
  productId: number,
  newPrice: number,
  product: { name: string; storeUrl: string | null; imageUrl: string | null }
): Promise<void> {
  const alarms = await db
    .select()
    .from(priceAlarmsTable)
    .where(
      and(
        eq(priceAlarmsTable.productId, productId),
        eq(priceAlarmsTable.isActive, true)
      )
    );

  const triggered = alarms.filter((a) => newPrice <= a.targetPrice);

  for (const alarm of triggered) {
    const sent = await sendAlarmEmail({
      to: alarm.email,
      productName: product.name,
      productId,
      targetPrice: alarm.targetPrice,
      currentPrice: newPrice,
      storeUrl: product.storeUrl,
      imageUrl: product.imageUrl,
    });

    if (sent) {
      await db
        .update(priceAlarmsTable)
        .set({ triggeredAt: new Date(), isActive: false })
        .where(eq(priceAlarmsTable.id, alarm.id));
    }
  }

  if (triggered.length > 0) {
    console.log(`[alarm] ${triggered.length} alarm tetiklendi (ürün: ${productId}, yeni fiyat: ₺${newPrice})`);
  }
}
