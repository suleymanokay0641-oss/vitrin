import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const products = await db.select({ category: productsTable.category }).from(productsTable);
  const categories = [...new Set(products.map((p) => p.category))].sort();
  res.json(categories);
});

export default router;
