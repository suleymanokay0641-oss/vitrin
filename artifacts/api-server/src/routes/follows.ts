import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userFollowsTable, userAccountsTable, pointEventsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router: IRouter = Router();

// GET /api/follows/followers/:userId — takipçiler
router.get("/followers/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const followers = await db.select({
    id: userAccountsTable.id,
    displayName: userAccountsTable.displayName,
    email: userAccountsTable.email,
    isChampion: userAccountsTable.isChampion,
    followedAt: userFollowsTable.createdAt,
  }).from(userFollowsTable)
    .innerJoin(userAccountsTable, eq(userFollowsTable.followerId, userAccountsTable.id))
    .where(eq(userFollowsTable.followingId, userId));

  res.json({ followers, count: followers.length });
});

// GET /api/follows/following/:userId — takip edilenler
router.get("/following/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const following = await db.select({
    id: userAccountsTable.id,
    displayName: userAccountsTable.displayName,
    email: userAccountsTable.email,
    isChampion: userAccountsTable.isChampion,
    followedAt: userFollowsTable.createdAt,
  }).from(userFollowsTable)
    .innerJoin(userAccountsTable, eq(userFollowsTable.followingId, userAccountsTable.id))
    .where(eq(userFollowsTable.followerId, userId));

  res.json({ following, count: following.length });
});

// POST /api/follows/:targetUserId — takip et
router.post("/:targetUserId", requireAuth as any, async (req: AuthRequest, res) => {
  const followerId = req.userId!;
  const followingId = parseInt(req.params.targetUserId);

  if (followerId === followingId) return res.status(400).json({ error: "Kendinizi takip edemezsiniz" });

  const [target] = await db.select({ id: userAccountsTable.id }).from(userAccountsTable).where(eq(userAccountsTable.id, followingId));
  if (!target) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  const [existing] = await db.select({ id: userFollowsTable.id }).from(userFollowsTable)
    .where(and(eq(userFollowsTable.followerId, followerId), eq(userFollowsTable.followingId, followingId)));
  if (existing) return res.status(409).json({ error: "Zaten takip ediyorsunuz" });

  await db.insert(userFollowsTable).values({ followerId, followingId });

  // Takip edilen kişiye bildirim + 5 puan (new_follower)
  const [follower] = await db.select({ displayName: userAccountsTable.displayName, email: userAccountsTable.email })
    .from(userAccountsTable).where(eq(userAccountsTable.id, followerId));
  const followerName = follower?.displayName || follower?.email?.split("@")[0] || "Biri";
  try {
    await db.insert(pointEventsTable).values({
      userId: followingId,
      type: "new_follower",
      points: 5,
      description: `${followerName} seni takip etmeye başladı`,
      referenceId: `follow-${followerId}-${followingId}`,
    });
    await db.update(userAccountsTable)
      .set({ totalPoints: sql`${userAccountsTable.totalPoints} + 5` })
      .where(eq(userAccountsTable.id, followingId));
  } catch {
    // Bildirim hatası kritik değil
  }

  res.json({ success: true, following: true });
});

// DELETE /api/follows/:targetUserId — takipten çık
router.delete("/:targetUserId", requireAuth as any, async (req: AuthRequest, res) => {
  const followerId = req.userId!;
  const followingId = parseInt(req.params.targetUserId);

  await db.delete(userFollowsTable).where(
    and(eq(userFollowsTable.followerId, followerId), eq(userFollowsTable.followingId, followingId))
  );
  res.json({ success: true, following: false });
});

// GET /api/follows/status/:targetUserId — takip durumu kontrol
router.get("/status/:targetUserId", requireAuth as any, async (req: AuthRequest, res) => {
  const followerId = req.userId!;
  const followingId = parseInt(req.params.targetUserId);

  const [row] = await db.select({ id: userFollowsTable.id }).from(userFollowsTable)
    .where(and(eq(userFollowsTable.followerId, followerId), eq(userFollowsTable.followingId, followingId)));

  res.json({ following: !!row });
});

export default router;
