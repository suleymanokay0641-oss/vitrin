/**
 * Official brand store price scraper for Turkish market.
 * Tries to find the same product on the brand's official Turkish website.
 * If the tracked price is BELOW official price → counterfeit / gray market risk.
 */

import { parse } from "node-html-parser";
import { proxyFetch } from "./proxy-fetch";

export interface OfficialPriceResult {
  price: number;
  storeUrl: string;
  storeName: string;
}

interface BrandConfig {
  name: string;
  buildSearchUrl: (query: string) => string;
  parsePrice: (html: string, query: string) => number | null;
}

const BRAND_CONFIGS: Record<string, BrandConfig> = {
  apple: {
    name: "Apple Türkiye",
    buildSearchUrl: (q) =>
      `https://www.apple.com/tr/search/${encodeURIComponent(q)}?src=serp`,
    parsePrice: parseApplePrice,
  },
  samsung: {
    name: "Samsung Türkiye",
    buildSearchUrl: (q) =>
      `https://www.samsung.com/tr/search/?searchvalue=${encodeURIComponent(q)}`,
    parsePrice: parseSamsungPrice,
  },
  dyson: {
    name: "Dyson Türkiye",
    buildSearchUrl: (q) =>
      `https://www.dyson.com.tr/search#q=${encodeURIComponent(q)}&t=coveo`,
    parsePrice: parseGenericJsonLdPrice,
  },
  huawei: {
    name: "Huawei Türkiye",
    buildSearchUrl: (q) =>
      `https://consumer.huawei.com/tr/search/?keywords=${encodeURIComponent(q)}`,
    parsePrice: parseGenericJsonLdPrice,
  },
  xiaomi: {
    name: "Xiaomi Türkiye",
    buildSearchUrl: (q) =>
      `https://www.mi.com/tr/search?q=${encodeURIComponent(q)}`,
    parsePrice: parseGenericJsonLdPrice,
  },
  sony: {
    name: "Sony Türkiye",
    buildSearchUrl: (q) =>
      `https://www.sony.com.tr/search/?q=${encodeURIComponent(q)}`,
    parsePrice: parseGenericJsonLdPrice,
  },
  lg: {
    name: "LG Türkiye",
    buildSearchUrl: (q) =>
      `https://www.lg.com/tr/search?search=${encodeURIComponent(q)}`,
    parsePrice: parseGenericJsonLdPrice,
  },
};

function detectBrandKey(brand: string): string | null {
  const b = brand.toLowerCase().trim();
  for (const key of Object.keys(BRAND_CONFIGS)) {
    if (b.includes(key)) return key;
  }
  return null;
}

function buildSearchQuery(productName: string, brand: string): string {
  const noStore = productName
    .replace(/\b(trendyol|hepsiburada|amazon|n11|mediamarkt)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const words = noStore.split(" ").slice(0, 6).join(" ");
  return words || brand;
}

function parseTurkishPrice(text: string): number | null {
  if (!text) return null;
  let s = text.replace(/[₺TL\s]/gi, "").trim();
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    const commaPos = s.lastIndexOf(",");
    const dotPos = s.lastIndexOf(".");
    s = dotPos < commaPos
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    const afterComma = s.split(",").pop() || "";
    s = afterComma.length <= 2 ? s.replace(",", ".") : s.replace(/,/g, "");
  } else if (s.includes(".")) {
    const afterDot = s.split(".").pop() || "";
    if (afterDot.length === 3) s = s.replace(/\./g, "");
  }
  s = s.replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return isNaN(n) || n <= 0 ? null : n;
}

function parseGenericJsonLdPrice(html: string): number | null {
  const root = parse(html);
  const scripts = root.querySelectorAll('script[type="application/ld+json"]');
  for (const s of scripts) {
    try {
      const data = JSON.parse(s.textContent);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const type = item["@type"];
        if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) {
          const offers = item.offers || item.Offers;
          if (!offers) continue;
          const offerList = Array.isArray(offers) ? offers : [offers];
          for (const o of offerList) {
            const p = o.price != null ? parseFloat(String(o.price)) : null;
            if (p && p > 100) return p;
            const low = o.lowPrice != null ? parseFloat(String(o.lowPrice)) : null;
            if (low && low > 100) return low;
          }
        }
      }
    } catch { /* skip */ }
  }
  return null;
}

function parseApplePrice(html: string, _query: string): number | null {
  // Try JSON-LD first
  const jsonLdPrice = parseGenericJsonLdPrice(html);
  if (jsonLdPrice) return jsonLdPrice;

  const root = parse(html);

  // Apple search result cards
  const priceSelectors = [
    "[data-autom='hero-cta-price']",
    ".rc-price .current_price",
    ".rf-serp-productcard-price",
    "[class*='price']",
    ".form-selector-title-price",
  ];
  for (const sel of priceSelectors) {
    const els = root.querySelectorAll(sel);
    for (const el of els) {
      const text = el.textContent?.trim();
      if (!text) continue;
      const p = parseTurkishPrice(text);
      if (p && p > 1000) return p;
    }
  }

  // Fallback: scan for ₺ patterns in text
  const bodyText = root.querySelector("body")?.textContent || "";
  const matches = bodyText.match(/(?:₺|TL)\s*[\d.,]+(?:\s*[\d.,]+)?/g) || [];
  const prices: number[] = [];
  for (const m of matches) {
    const p = parseTurkishPrice(m);
    if (p && p > 1000) prices.push(p);
  }
  if (prices.length > 0) {
    prices.sort((a, b) => a - b);
    return prices[0];
  }

  return null;
}

function parseSamsungPrice(html: string, _query: string): number | null {
  const jsonLdPrice = parseGenericJsonLdPrice(html);
  if (jsonLdPrice) return jsonLdPrice;

  const root = parse(html);

  const selectors = [
    ".price-unit",
    ".card-price",
    "[class*='price']",
    ".searchresults-price",
  ];
  for (const sel of selectors) {
    const els = root.querySelectorAll(sel);
    for (const el of els) {
      const text = el.textContent?.trim();
      if (!text) continue;
      const p = parseTurkishPrice(text);
      if (p && p > 500) return p;
    }
  }

  return null;
}

export async function findOfficialPrice(
  productName: string,
  brand: string,
): Promise<OfficialPriceResult | null> {
  const brandKey = detectBrandKey(brand);
  if (!brandKey) return null;

  const config = BRAND_CONFIGS[brandKey];
  const query = buildSearchQuery(productName, brand);

  const searchUrl = config.buildSearchUrl(query);
  console.log(`[official-price] ${config.name} aranıyor: "${query}"`);

  try {
    const html = await proxyFetch(searchUrl, { timeoutMs: 15000 });
    const price = config.parsePrice(html, query);

    if (!price || price <= 0) {
      console.log(`[official-price] ${config.name}: fiyat bulunamadı`);
      return null;
    }

    console.log(`[official-price] ${config.name}: ${price} ₺ bulundu`);
    return { price, storeUrl: searchUrl, storeName: config.name };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "bilinmeyen hata";
    console.log(`[official-price] ${config.name} erişilemedi: ${msg}`);
    return null;
  }
}
