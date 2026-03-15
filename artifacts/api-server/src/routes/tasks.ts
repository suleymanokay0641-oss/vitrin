import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userDailyTasksTable, userAccountsTable, userMonthlyPointsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router: IRouter = Router();

const DAILY_TASKS = [
  { type: "add_product", label: "Ürün Ekle", description: "Platformda bir ürün ekle", points: 10, maxPerDay: 3 },
  { type: "share_vitrin", label: "Vitrinini Paylaş", description: "Vitrin sayfanı sosyal medyada paylaş", points: 15, maxPerDay: 1 },
  { type: "create_collection", label: "Koleksiyon Oluştur", description: "Yeni bir koleksiyon oluştur", points: 20, maxPerDay: 1 },
  { type: "follow_user", label: "Biri Takip Et", description: "Bir kullanıcıyı takip et", points: 5, maxPerDay: 3 },
  { type: "login", label: "Gün İçinde Giriş Yap", description: "Bugün platforma giriş yap", points: 2, maxPerDay: 1 },
  { type: "review_product", label: "Ürün Yorumla", description: "Bir ürüne yorum yaz", points: 8, maxPerDay: 2 },
  { type: "vote_product", label: "Ürün Oyla", description: "Bir ürünü oyla", points: 3, maxPerDay: 5 },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yearMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// GET /api/tasks — günlük görevler + tamamlananlar
router.get("/", requireAuth as any, async (req: AuthRequest, res) => {
  const todayStr = today();
  const completed = await db.select().from(userDailyTasksTable)
    .where(and(eq(userDailyTasksTable.userId, req.userId!), eq(userDailyTasksTable.yearMonthDay, todayStr)));

  const completedByType = completed.reduce<Record<string, number>>((acc, t) => {
    acc[t.taskType] = (acc[t.taskType] || 0) + 1;
    return acc;
  }, {});

  const tasks = DAILY_TASKS.map(task => ({
    ...task,
    completedCount: completedByType[task.type] || 0,
    canComplete: (completedByType[task.type] || 0) < task.maxPerDay,
    totalPoints: task.points * task.maxPerDay,
  }));

  const totalEarned = completed.reduce((sum, t) => sum + t.pointsEarned, 0);
  const maxPossible = DAILY_TASKS.reduce((sum, t) => sum + t.points * t.maxPerDay, 0);

  res.json({ tasks, totalEarned, maxPossible, date: todayStr });
});

// POST /api/tasks/complete — görevi tamamla
router.post("/complete", requireAuth as any, async (req: AuthRequest, res) => {
  const { taskType } = req.body;
  if (!taskType) return res.status(400).json({ error: "Görev türü gerekli" });

  const task = DAILY_TASKS.find(t => t.type === taskType);
  if (!task) return res.status(404).json({ error: "Geçersiz görev türü" });

  const todayStr = today();
  const existing = await db.select().from(userDailyTasksTable)
    .where(and(
      eq(userDailyTasksTable.userId, req.userId!),
      eq(userDailyTasksTable.taskType, taskType),
      eq(userDailyTasksTable.yearMonthDay, todayStr),
    ));

  if (existing.length >= task.maxPerDay) {
    return res.status(409).json({ error: "Bu görevi bugün zaten tamamladınız", limit: task.maxPerDay });
  }

  await db.insert(userDailyTasksTable).values({
    userId: req.userId!, taskType, yearMonthDay: todayStr, pointsEarned: task.points,
  });

  const ym = yearMonth();
  const [monthPts] = await db.select().from(userMonthlyPointsTable)
    .where(and(eq(userMonthlyPointsTable.userId, req.userId!), eq(userMonthlyPointsTable.yearMonth, ym)));

  if (monthPts) {
    await db.update(userMonthlyPointsTable).set({
      activityPoints: monthPts.activityPoints + task.points,
      totalPoints: monthPts.totalPoints + task.points,
    }).where(and(eq(userMonthlyPointsTable.userId, req.userId!), eq(userMonthlyPointsTable.yearMonth, ym)));
  } else {
    await db.insert(userMonthlyPointsTable).values({
      userId: req.userId!, yearMonth: ym, activityPoints: task.points, totalPoints: task.points,
    });
  }

  await db.update(userAccountsTable).set({ totalPoints: (await db.select({ tp: userAccountsTable.totalPoints }).from(userAccountsTable).where(eq(userAccountsTable.id, req.userId!)))[0]!.tp + task.points }).where(eq(userAccountsTable.id, req.userId!));

  res.json({ success: true, pointsEarned: task.points, task: task.label });
});

export default router;
