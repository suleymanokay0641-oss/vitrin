import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, pricesTable } from "@workspace/db";
import { desc, eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: /api/sitemap.xml
`);
});

router.get("/sitemap.xml", async (_req, res) => {
  const products = await db
    .select({ id: productsTable.id, name: productsTable.name })
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt))
    .limit(1000);

  const baseUrl = "https://fiyatdedektifi.com";
  const now = new Date().toISOString();

  const urls = [
    `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority><lastmod>${now}</lastmod></url>`,
    `  <url><loc>${baseUrl}/search</loc><changefreq>hourly</changefreq><priority>0.9</priority><lastmod>${now}</lastmod></url>`,
    ...products.map(
      (p) =>
        `  <url><loc>${baseUrl}/product/${p.id}</loc><changefreq>daily</changefreq><priority>0.8</priority><lastmod>${now}</lastmod></url>`
    ),
  ];

  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`);
});

export default router;
