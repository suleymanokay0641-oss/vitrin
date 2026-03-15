import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { pointEventsTable, userAccountsTable } from "@workspace/db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth";

const router: IRouter = Router();

// GET /api/notifications — giriş yapmış kullanıcının bildirimleri
router.get("/", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Token gerekli" });

  let userId: number;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number };
    userId = payload.userId;
  } catch {
    return res.status(401).json({ error: "Geçersiz token" });
  }

  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

  // Point events = bildirim kaynağı
  const events = await db
    .select({
      id: pointEventsTable.id,
      type: pointEventsTable.type,
      points: pointEventsTable.points,
      description: pointEventsTable.description,
      referenceId: pointEventsTable.referenceId,
      createdAt: pointEventsTable.createdAt,
    })
    .from(pointEventsTable)
    .where(eq(pointEventsTable.userId, userId))
    .orderBy(desc(pointEventsTable.createdAt))
    .limit(limit);

  // Her event'i bildirim formatına çevir
  const notifications = events.map((e) => {
    let icon = "star";
    let color = "#F59E0B";
    let title = e.description;
    let subtitle = `+${e.points} puan`;

    switch (e.type) {
      case "product_click_earned":
        icon = "mouse-pointer";
        color = "#3B82F6";
        title = e.description || "Ürününe tıklama geldi";
        subtitle = `+${e.points} puan kazandın`;
        break;
      case "affiliate_click":
        icon = "external-link";
        color = "#8B5CF6";
        title = e.description || "Mağaza ziyareti";
        subtitle = `+${e.points} puan kazandın`;
        break;
      case "task_completed":
      case "daily_login":
      case "share_vitrin":
      case "follow_user":
      case "add_product":
      case "create_collection":
        icon = "check-circle";
        color = "#10B981";
        title = e.description || "Görev tamamlandı";
        subtitle = `+${e.points} puan kazandın`;
        break;
      case "registration_reward":
        icon = "gift";
        color = "#F59E0B";
        title = "Kayıt ödülü!";
        subtitle = `+${e.points} puan`;
        break;
      case "monthly_pool_share":
        icon = "dollar-sign";
        color = "#10B981";
        title = "Aylık havuz payın yatırıldı";
        subtitle = `+${e.points} puan`;
        break;
      case "champion_bonus":
        icon = "award";
        color = "#F59E0B";
        title = "Şampiyon bonusu!";
        subtitle = `x${e.points} çarpan`;
        break;
      case "new_follower":
        icon = "user-plus";
        color = "#10B981";
        title = e.description || "Yeni takipçin var!";
        subtitle = `+${e.points} puan kazandın`;
        break;
      case "price_drop":
        icon = "trending-down";
        color = "#EF4444";
        title = e.description || "Fiyat düştü!";
        subtitle = "Alarm fiyatının altına indi";
        break;
      default:
        icon = "star";
        color = "#F59E0B";
    }

    return {
      id: e.id,
      type: e.type,
      icon,
      color,
      title,
      subtitle,
      points: e.points,
      createdAt: e.createdAt,
    };
  });

  // Özet istatistikler
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [summary] = await db
    .select({
      totalPoints: sql<number>`COALESCE(SUM(${pointEventsTable.points}), 0)`,
      clickCount: sql<number>`COALESCE(COUNT(CASE WHEN ${pointEventsTable.type} = 'product_click_earned' THEN 1 END), 0)`,
    })
    .from(pointEventsTable)
    .where(and(eq(pointEventsTable.userId, userId), gte(pointEventsTable.createdAt, thirtyDaysAgo)));

  res.json({ notifications, summary });
});

// GET /api/notifications/unread-count — okunmamış bildirim sayısı
router.get("/unread-count", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.json({ count: 0 });

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number };
    // Son 24 saatteki yeni point eventler = "okunmamış"
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pointEventsTable)
      .where(and(eq(pointEventsTable.userId, payload.userId), gte(pointEventsTable.createdAt, oneDayAgo)));
    res.json({ count: Number(result?.count || 0) });
  } catch {
    res.json({ count: 0 });
  }
});

export default router;
