import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { votesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/products/:id/votes — toplam oy dağılımı
router.get("/:id/votes", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  const votes = await db
    .select()
    .from(votesTable)
    .where(eq(votesTable.productId, productId));

  const green = votes.filter((v) => v.color === "green").length;
  const yellow = votes.filter((v) => v.color === "yellow").length;
  const red = votes.filter((v) => v.color === "red").length;
  const total = votes.length;

  res.json({
    total,
    green,
    yellow,
    red,
    greenPct: total > 0 ? Math.round((green / total) * 100) : 0,
    yellowPct: total > 0 ? Math.round((yellow / total) * 100) : 0,
    redPct: total > 0 ? Math.round((red / total) * 100) : 0,
  });
});

// POST /api/products/:id/votes — oy gönder
router.post("/:id/votes", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  const { color, sessionId } = req.body;
  if (!["green", "yellow", "red"].includes(color)) {
    return res.status(400).json({ error: "Geçersiz renk. 'green', 'yellow' veya 'red' olmalı." });
  }
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 8) {
    return res.status(400).json({ error: "Geçersiz session ID" });
  }

  // Önceki oy var mı kontrol et
  const existing = await db
    .select()
    .from(votesTable)
    .where(and(eq(votesTable.productId, productId), eq(votesTable.sessionId, sessionId)));

  if (existing.length > 0) {
    // Oyu güncelle (renk değiştirme izni)
    await db
      .update(votesTable)
      .set({ color })
      .where(and(eq(votesTable.productId, productId), eq(votesTable.sessionId, sessionId)));
    return res.json({ success: true, action: "updated" });
  }

  await db.insert(votesTable).values({ productId, color, sessionId });
  res.json({ success: true, action: "created" });
});

export default router;
