import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  subscriptionsTable, userAccountsTable,
  monthlyPoolTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const PRO_PRICE = 49;
// %50 platform, %50 kayıtlı tüm kullanıcılara eşit ödül (registrationRewardPool)

function getMonthEnd() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

router.get("/my/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Geçersiz kullanıcı" });

  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
  const isPro = sub?.status === "active" && sub?.plan === "pro" && (!sub.endDate || new Date(sub.endDate) > new Date());

  res.json({
    hasSub: !!sub,
    plan: sub?.plan ?? "free",
    status: sub?.status ?? "none",
    isPro,
    endDate: sub?.endDate ?? null,
    requestedAt: sub?.requestedAt ?? null,
  });
});

router.post("/request", async (req, res) => {
  const { userId, paymentMethod, accountInfo, accountName } = req.body;
  if (!userId || !paymentMethod || !accountInfo || !accountName) {
    return res.status(400).json({ error: "Tüm alanları doldurun" });
  }

  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  const [existing] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
  if (existing?.status === "active") {
    return res.status(400).json({ error: "Zaten aktif bir aboneliğiniz var" });
  }

  if (existing) {
    await db.update(subscriptionsTable)
      .set({ paymentMethod, accountInfo, accountName, status: "pending", requestedAt: new Date() })
      .where(eq(subscriptionsTable.userId, userId));
  } else {
    await db.insert(subscriptionsTable).values({
      userId, plan: "pro", status: "pending",
      amount: PRO_PRICE, paymentMethod, accountInfo, accountName,
    });
  }

  res.json({ success: true, message: "Abonelik talebiniz alındı. 1 iş günü içinde aktif edilir." });
});

router.post("/activate", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env["ADMIN_KEY"]) return res.status(403).json({ error: "Yetkisiz" });

  const { userId } = req.body;
  const startDate = new Date();
  const endDate = getMonthEnd();
  endDate.setMonth(endDate.getMonth() + 1);

  const [sub] = await db.update(subscriptionsTable)
    .set({ status: "active", startDate, endDate, activatedAt: new Date() })
    .where(eq(subscriptionsTable.userId, userId))
    .returning();

  if (!sub) return res.status(404).json({ error: "Abonelik bulunamadı" });

  const ym = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;
  const [pool] = await db.select().from(monthlyPoolTable).where(eq(monthlyPoolTable.yearMonth, ym));
  const rewardContrib = PRO_PRICE * 0.50; // %50 kayıtlı kullanıcılara eşit ödül
  if (pool) {
    await db.update(monthlyPoolTable)
      .set({
        subscriptionRevenue: sql`${monthlyPoolTable.subscriptionRevenue} + ${PRO_PRICE}`,
        registrationRewardPool: sql`${monthlyPoolTable.registrationRewardPool} + ${rewardContrib}`,
      })
      .where(eq(monthlyPoolTable.yearMonth, ym));
  } else {
    await db.insert(monthlyPoolTable).values({
      yearMonth: ym,
      subscriptionRevenue: PRO_PRICE,
      registrationRewardPool: rewardContrib,
    });
  }

  res.json({ success: true, sub });
});

router.get("/pending", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env["ADMIN_KEY"]) return res.status(403).json({ error: "Yetkisiz" });

  const pending = await db
    .select({
      id: subscriptionsTable.id,
      userId: subscriptionsTable.userId,
      email: userAccountsTable.email,
      amount: subscriptionsTable.amount,
      paymentMethod: subscriptionsTable.paymentMethod,
      accountInfo: subscriptionsTable.accountInfo,
      accountName: subscriptionsTable.accountName,
      requestedAt: subscriptionsTable.requestedAt,
      status: subscriptionsTable.status,
    })
    .from(subscriptionsTable)
    .innerJoin(userAccountsTable, eq(subscriptionsTable.userId, userAccountsTable.id))
    .where(eq(subscriptionsTable.status, "pending"));

  res.json(pending);
});

export default router;
