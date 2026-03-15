import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/products/:id/reviews
router.get("/:id/reviews", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, productId))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(50);

  const total = reviews.length;
  const avgRating = total > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
    : 0;

  const ratingDist = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  res.json({ reviews, total, avgRating, ratingDist });
});

// POST /api/products/:id/reviews
router.post("/:id/reviews", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) return res.status(400).json({ error: "Geçersiz ürün ID" });

  const { authorName, rating, comment, tag } = req.body;

  if (!authorName || typeof authorName !== "string" || authorName.trim().length < 2) {
    return res.status(400).json({ error: "Lütfen en az 2 karakterli bir isim girin." });
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Puan 1-5 arasında olmalı." });
  }
  if (!comment || typeof comment !== "string" || comment.trim().length < 10) {
    return res.status(400).json({ error: "Yorum en az 10 karakter olmalı." });
  }

  const VALID_TAGS = [
    "Aldım, Gerçekti",
    "Aldım, Sorunlu Çıktı",
    "Fiyat Manipülasyonu Gördüm",
    "Güvenilir Satıcı",
    "Şüpheli Satıcı",
    "Harika Fırsat",
  ];
  const safeTag = VALID_TAGS.includes(tag) ? tag : null;

  await db.insert(reviewsTable).values({
    productId,
    authorName: authorName.trim().slice(0, 50),
    rating,
    comment: comment.trim().slice(0, 1000),
    tag: safeTag,
  });

  res.status(201).json({ success: true });
});

export default router;
