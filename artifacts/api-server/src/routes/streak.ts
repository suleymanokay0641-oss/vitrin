import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userStreakTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router: IRouter = Router();

// GET /api/streak/me
router.get("/me", requireAuth as any, async (req: AuthRequest, res) => {
  const [streak] = await db.select().from(userStreakTable).where(eq(userStreakTable.userId, req.userId!));
  if (!streak) return res.json({ currentStreak: 0, longestStreak: 0, lastActiveDate: null });
  res.json(streak);
});

// GET /api/streak/:userId
router.get("/:userId", async (req, res) => {
  const [streak] = await db.select().from(userStreakTable).where(eq(userStreakTable.userId, parseInt(req.params.userId)));
  if (!streak) return res.json({ currentStreak: 0, longestStreak: 0 });
  res.json({ currentStreak: streak.currentStreak, longestStreak: streak.longestStreak });
});

export default router;
