import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { collectionsTable, collectionItemsTable, productsTable, userAccountsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, optionalAuth, type AuthRequest } from "../middleware/auth";

const router: IRouter = Router();

function generateSlug(title: string, userId: number): string {
  const base = title.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "-").replace(/-+/g, "-").slice(0, 40);
  return `${base}-${userId}-${Date.now().toString(36)}`;
}

// GET /api/collections/user/:userId — kullanıcı koleksiyonları
router.get("/user/:userId", optionalAuth as any, async (req: AuthRequest, res) => {
  const userId = parseInt(req.params.userId);
  const isOwner = req.userId === userId;

  const cols = await db.select({
    id: collectionsTable.id, title: collectionsTable.title, slug: collectionsTable.slug,
    description: collectionsTable.description, isPublic: collectionsTable.isPublic,
    viewCount: collectionsTable.viewCount, createdAt: collectionsTable.createdAt,
    updatedAt: collectionsTable.updatedAt,
  }).from(collectionsTable)
    .where(isOwner ? eq(collectionsTable.userId, userId) : and(eq(collectionsTable.userId, userId), eq(collectionsTable.isPublic, true)))
    .orderBy(desc(collectionsTable.updatedAt));

  res.json(cols);
});

// GET /api/collections/:slug — koleksiyon detayı
router.get("/:slug", optionalAuth as any, async (req: AuthRequest, res) => {
  const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.slug, req.params.slug));
  if (!col) return res.status(404).json({ error: "Koleksiyon bulunamadı" });

  if (!col.isPublic && req.userId !== col.userId) {
    return res.status(403).json({ error: "Bu koleksiyon gizli" });
  }

  // görüntülenme sayısı artır
  if (req.userId !== col.userId) {
    await db.update(collectionsTable).set({ viewCount: col.viewCount + 1 }).where(eq(collectionsTable.id, col.id));
  }

  const items = await db.select({
    id: collectionItemsTable.id, sortOrder: collectionItemsTable.sortOrder, addedAt: collectionItemsTable.addedAt,
    product: {
      id: productsTable.id, name: productsTable.name, brand: productsTable.brand,
      imageUrl: productsTable.imageUrl, store: productsTable.store, storeUrl: productsTable.storeUrl,
    },
  }).from(collectionItemsTable)
    .innerJoin(productsTable, eq(collectionItemsTable.productId, productsTable.id))
    .where(eq(collectionItemsTable.collectionId, col.id))
    .orderBy(collectionItemsTable.sortOrder);

  const [owner] = await db.select({ id: userAccountsTable.id, displayName: userAccountsTable.displayName }).from(userAccountsTable).where(eq(userAccountsTable.id, col.userId));

  res.json({ ...col, items, owner });
});

// POST /api/collections — yeni koleksiyon oluştur
router.post("/", requireAuth as any, async (req: AuthRequest, res) => {
  const { title, description, isPublic = true } = req.body;
  if (!title) return res.status(400).json({ error: "Başlık zorunlu" });

  const slug = generateSlug(title, req.userId!);
  const [col] = await db.insert(collectionsTable).values({
    userId: req.userId!, title, description: description || null, slug, isPublic,
  }).returning();

  res.status(201).json(col);
});

// PUT /api/collections/:id — koleksiyon güncelle
router.put("/:id", requireAuth as any, async (req: AuthRequest, res) => {
  const colId = parseInt(req.params.id);
  const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, colId));
  if (!col || col.userId !== req.userId) return res.status(403).json({ error: "Yetki yok" });

  const { title, description, isPublic } = req.body;
  const [updated] = await db.update(collectionsTable)
    .set({ title: title || col.title, description: description ?? col.description, isPublic: isPublic ?? col.isPublic, updatedAt: new Date() })
    .where(eq(collectionsTable.id, colId))
    .returning();

  res.json(updated);
});

// DELETE /api/collections/:id
router.delete("/:id", requireAuth as any, async (req: AuthRequest, res) => {
  const colId = parseInt(req.params.id);
  const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, colId));
  if (!col || col.userId !== req.userId) return res.status(403).json({ error: "Yetki yok" });

  await db.delete(collectionsTable).where(eq(collectionsTable.id, colId));
  res.json({ success: true });
});

// POST /api/collections/:id/items — koleksiyona ürün ekle
router.post("/:id/items", requireAuth as any, async (req: AuthRequest, res) => {
  const colId = parseInt(req.params.id);
  const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, colId));
  if (!col || col.userId !== req.userId) return res.status(403).json({ error: "Yetki yok" });

  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Ürün ID gerekli" });

  const existing = await db.select({ id: collectionItemsTable.id }).from(collectionItemsTable)
    .where(and(eq(collectionItemsTable.collectionId, colId), eq(collectionItemsTable.productId, parseInt(productId))));
  if (existing.length > 0) return res.status(409).json({ error: "Ürün zaten koleksiyonda" });

  const [item] = await db.insert(collectionItemsTable).values({
    collectionId: colId, productId: parseInt(productId), sortOrder: Date.now(),
  }).returning();
  await db.update(collectionsTable).set({ updatedAt: new Date() }).where(eq(collectionsTable.id, colId));

  res.status(201).json(item);
});

// DELETE /api/collections/:id/items/:itemId
router.delete("/:id/items/:itemId", requireAuth as any, async (req: AuthRequest, res) => {
  const colId = parseInt(req.params.id);
  const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, colId));
  if (!col || col.userId !== req.userId) return res.status(403).json({ error: "Yetki yok" });

  await db.delete(collectionItemsTable).where(and(
    eq(collectionItemsTable.id, parseInt(req.params.itemId)),
    eq(collectionItemsTable.collectionId, colId),
  ));
  res.json({ success: true });
});

export default router;
