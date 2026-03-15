import { parse } from "node-html-parser";
import { scrapeWithBrowser } from "./browser-scraper";
import { proxyFetch, CloudflareBlockedError, hasScraperApiKey, getScraperApiSetupHint } from "./proxy-fetch";

export interface StoreOffer {
  store: string;
  price: number;
  url: string;
}

export interface ScrapedProduct {
  name: string | null;
  brand: string | null;
  currentPrice: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  description: string | null;
  store: string | null;
  storeUrl: string;
  category: string | null;
  storeOffers?: StoreOffer[];
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Ch-Ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/**
 * Parses Turkish-formatted prices like "54.999,00 TL", "1.299,90", "299.99", "299,99"
 */
function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null;

  let s = raw.toString().replace(/[₺TL€$£\s]/g, "").trim();
  if (!s) return null;

  if (s.includes(",") && s.includes(".")) {
    const commaPos = s.lastIndexOf(",");
    const dotPos = s.lastIndexOf(".");
    if (dotPos < commaPos) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    const afterComma = s.split(",").pop() || "";
    if (afterComma.length <= 2) {
      s = s.replace(",", ".");
    } else {
      s = s.replace(",", "");
    }
  } else if (s.includes(".")) {
    const afterDot = s.split(".").pop() || "";
    if (afterDot.length === 3) {
      s = s.replace(/\./g, "");
    }
  }

  s = s.replace(/[^\d.]/g, "");
  const num = parseFloat(s);
  return isNaN(num) || num <= 0 ? null : num;
}

function parseJsonLd(html: string): Partial<ScrapedProduct> | null {
  const root = parse(html);
  const scripts = root.querySelectorAll('script[type="application/ld+json"]');

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        const type = item["@type"];
        if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) {
          const offers = item.offers || item.Offers;
          const isAggregate = offers?.["@type"] === "AggregateOffer";

          // Extract individual offers (multi-store)
          const rawOffers: unknown[] = isAggregate && Array.isArray(offers.offers)
            ? offers.offers
            : Array.isArray(offers) ? offers : [];

          const storeOffers: StoreOffer[] = [];
          for (const o of rawOffers) {
            const offer = o as Record<string, unknown>;
            const price = offer.price != null ? parseFloat(String(offer.price)) : null;
            const seller = (offer.seller as Record<string, unknown>)?.name as string | undefined;
            const offerUrl = offer.url as string | undefined;
            if (price && price > 0 && seller) {
              storeOffers.push({ store: seller, price, url: offerUrl || "" });
            }
          }
          storeOffers.sort((a, b) => a.price - b.price);

          // Best single offer
          const offer = isAggregate ? offers : (Array.isArray(offers) ? offers[0] : offers);
          const currentPrice = isAggregate
            ? (offers.lowPrice != null ? parseFloat(String(offers.lowPrice)) : null)
            : (offer?.price != null ? parseFloat(String(offer.price)) : null);
          const listPrice = offer?.priceSpecification?.price
            ? parseFloat(offer.priceSpecification.price)
            : offer?.highPrice
            ? parseFloat(String(offer.highPrice))
            : isAggregate && offers.highPrice
            ? parseFloat(String(offers.highPrice))
            : null;

          let imageUrl: string | null = null;
          if (Array.isArray(item.image)) imageUrl = item.image[0];
          else if (typeof item.image === "string") imageUrl = item.image;
          else if ((item.image as Record<string, unknown>)?.url) imageUrl = (item.image as Record<string, unknown>).url as string;

          return {
            name: item.name || null,
            brand: item.brand?.name || (typeof item.brand === "string" ? item.brand : null),
            description: item.description || null,
            imageUrl,
            currentPrice: storeOffers[0]?.price || currentPrice || null,
            originalPrice: listPrice || (storeOffers.length > 0 ? storeOffers[storeOffers.length - 1].price : null) || currentPrice || null,
            category: Array.isArray(item.category) ? item.category[0] : item.category || null,
            storeOffers: storeOffers.length > 0 ? storeOffers : undefined,
          };
        }
      }
    } catch { /* skip */ }
  }
  return null;
}

function parseOpenGraph(html: string): Partial<ScrapedProduct> {
  const root = parse(html);

  function getMeta(...names: string[]): string | null {
    for (const name of names) {
      const val =
        root.querySelector(`meta[property="${name}"]`)?.getAttribute("content") ||
        root.querySelector(`meta[name="${name}"]`)?.getAttribute("content");
      if (val) return val;
    }
    return null;
  }

  const priceRaw = getMeta("product:price:amount", "og:price:amount", "twitter:data1");
  const title = getMeta("og:title") || root.querySelector("h1")?.textContent?.trim() || root.querySelector("title")?.textContent?.trim() || null;

  return {
    name: title,
    imageUrl: getMeta("og:image", "twitter:image") || null,
    description: getMeta("og:description", "description") || null,
    currentPrice: parsePrice(priceRaw),
    originalPrice: parsePrice(priceRaw),
  };
}

function parseDomPrices(html: string): { currentPrice: number | null; originalPrice: number | null } {
  const root = parse(html);

  const priceSelectors = [
    "[data-price]", "[itemprop='price']", ".price", ".prc-dsc", ".prc-org",
    ".product-price", ".current-price", ".sale-price", "[class*='price']",
    "[class*='Price']", "[class*='fiyat']", "[class*='Fiyat']",
  ];

  const prices: number[] = [];

  for (const sel of priceSelectors) {
    try {
      const els = root.querySelectorAll(sel);
      for (const el of els) {
        const dataPriceAttr = el.getAttribute("data-price") || el.getAttribute("content");
        if (dataPriceAttr) {
          const p = parsePrice(dataPriceAttr);
          if (p && p > 0) prices.push(p);
          continue;
        }
        const text = el.textContent?.trim();
        if (!text) continue;
        if (/(₺|TL|lira)/i.test(text) || /\d+[.,]\d+/.test(text)) {
          const p = parsePrice(text);
          if (p && p > 0) prices.push(p);
        }
      }
    } catch { /* ignore */ }
  }

  if (prices.length === 0) return { currentPrice: null, originalPrice: null };

  const sorted = [...new Set(prices)].sort((a, b) => a - b);
  const currentPrice = sorted[0];
  const originalPrice = sorted.length > 1 ? sorted[sorted.length - 1] : currentPrice;

  return { currentPrice, originalPrice };
}

/**
 * Akakçe-specific parser: tries JSON-LD AggregateOffer first, then DOM price list.
 * Akakçe is a Turkish price comparison aggregator (akakce.com).
 */
function parseAkakce(html: string): Partial<ScrapedProduct> {
  const root = parse(html);

  // 1) Try JSON-LD first (most reliable — Akakçe publishes rich schema)
  const jsonLd = parseJsonLd(html);
  if (jsonLd && (jsonLd.currentPrice || (jsonLd.storeOffers && jsonLd.storeOffers.length > 0))) {
    // Enrich name from h1 if JSON-LD name is missing
    if (!jsonLd.name) {
      jsonLd.name = root.querySelector("h1")?.textContent?.trim() || null;
    }
    // Enrich image from og:image if missing
    if (!jsonLd.imageUrl) {
      jsonLd.imageUrl = root.querySelector('meta[property="og:image"]')?.getAttribute("content") || null;
    }
    return jsonLd;
  }

  // 2) DOM fallback: scrape the price comparison list
  const storeOffers: StoreOffer[] = [];

  // Akakçe price list — try multiple known selector patterns
  const listCandidates = [
    root.querySelectorAll("ul.pr_l > li"),
    root.querySelectorAll(".pr_l > li"),
    root.querySelectorAll("[data-list] > li"),
    root.querySelectorAll("ul > li.w8"),
    root.querySelectorAll("li[data-v]"),
  ];

  for (const items of listCandidates) {
    if (items.length === 0) continue;

    for (const item of items) {
      // Store name — look for logos alt text or common class patterns
      const storeNameEl =
        item.querySelector(".pn_ms") ||
        item.querySelector(".mn") ||
        item.querySelector("[class*='merchant']") ||
        item.querySelector("[class*='store']") ||
        item.querySelector("[class*='brand']") ||
        item.querySelector("img");

      const storeName =
        storeNameEl?.getAttribute("alt")?.trim() ||
        storeNameEl?.textContent?.trim();

      // Price — find elements containing TL or ₺
      let priceText: string | null = null;
      const priceEl =
        item.querySelector(".pn_pr") ||
        item.querySelector(".pr") ||
        item.querySelector("[class*='price']") ||
        item.querySelector("[class*='Price']") ||
        item.querySelector("[itemprop='price']");

      if (priceEl) {
        priceText = priceEl.getAttribute("content") || priceEl.textContent?.trim() || null;
      } else {
        // Search all text nodes for price-like content
        const text = item.textContent || "";
        const match = text.match(/[\d.,]+\s*TL|₺\s*[\d.,]+/);
        if (match) priceText = match[0];
      }

      // Store URL
      const linkEl = item.querySelector("a");
      const storeUrl = linkEl?.getAttribute("href") || "";

      if (priceText) {
        const price = parsePrice(priceText);
        if (price && price > 0) {
          storeOffers.push({
            store: storeName || `Mağaza ${storeOffers.length + 1}`,
            price,
            url: storeUrl,
          });
        }
      }
    }

    if (storeOffers.length > 0) break; // Found data, stop trying other selectors
  }

  storeOffers.sort((a, b) => a.price - b.price);

  // Product name: prefer h1, then og:title
  const name =
    root.querySelector("h1")?.textContent?.trim() ||
    root.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
    null;

  // Image
  const imageUrl =
    root.querySelector('[itemprop="image"]')?.getAttribute("src") ||
    root.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
    null;

  // If DOM parse also failed, try generic price extraction
  if (storeOffers.length === 0) {
    const domPrices = parseDomPrices(html);
    return { name, imageUrl, ...domPrices };
  }

  return {
    name,
    imageUrl,
    currentPrice: storeOffers[0]?.price || null,
    originalPrice: storeOffers[storeOffers.length - 1]?.price || null,
    storeOffers,
  };
}

function extractFromUrl(url: string): Partial<ScrapedProduct> {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);

    const slug = parts
      .map((p) => p.replace(/-p-\d+$/, "").replace(/-\d+$/, ""))
      .sort((a, b) => b.length - a.length)[0] || "";

    const name = slug
      .replace(/-/g, " ")
      .replace(/en-ucuz-/gi, "")
      .replace(/-fiyati.*/gi, "")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || null;

    const brand = parts.length > 1
      ? parts[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

    return { name: name || null, brand: brand || null };
  } catch {
    return {};
  }
}

function detectStore(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace("www.", "");
    if (hostname.includes("akakce")) return "Akakçe (Fiyat Karşılaştırma)";
    if (hostname.includes("trendyol")) return "Trendyol";
    if (hostname.includes("hepsiburada")) return "Hepsiburada";
    if (hostname.includes("amazon")) return "Amazon Türkiye";
    if (hostname.includes("mediamarkt")) return "MediaMarkt";
    if (hostname.includes("gittigidiyor")) return "GittiGidiyor";
    if (hostname.includes("ciceksepeti")) return "ÇiçekSepeti";
    if (hostname.includes("n11")) return "N11";
    if (hostname.includes("vatan")) return "Vatan Bilgisayar";
    if (hostname.includes("teknosa")) return "Teknosa";
    if (hostname.includes("boyner")) return "Boyner";
    if (hostname.includes("lcwaikiki")) return "LC Waikiki";
    if (hostname.includes("zara")) return "Zara";
    if (hostname.includes("mango")) return "Mango";
    return hostname;
  } catch {
    return "Bilinmeyen Mağaza";
  }
}

export function isAkakceUrl(url: string): boolean {
  try {
    return new URL(url).hostname.toLowerCase().includes("akakce");
  } catch {
    return false;
  }
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  const store = detectStore(url);
  const urlData = extractFromUrl(url);
  const isAkakce = isAkakceUrl(url);

  // === AKAKÇE: use ScraperAPI (with JS rendering) or browser fallback ===
  if (isAkakce) {
    console.log(`[scraper] Akakçe URL, kazıma modu: ${hasScraperApiKey() ? "ScraperAPI (JS)" : "Tarayıcı"}`);
    if (hasScraperApiKey()) {
      try {
        const html = await proxyFetch(url, { renderJs: true, timeoutMs: 45000 });
        const akakceData = parseAkakce(html);
        return {
          name: akakceData.name || urlData.name || null,
          brand: akakceData.brand || urlData.brand || null,
          currentPrice: akakceData.currentPrice || null,
          originalPrice: akakceData.originalPrice || akakceData.currentPrice || null,
          imageUrl: akakceData.imageUrl || null,
          description: akakceData.description || null,
          store,
          storeUrl: url,
          category: akakceData.category || null,
          storeOffers: akakceData.storeOffers,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "bilinmeyen hata";
        throw new Error(`Akakçe ScraperAPI hatası: ${msg}`);
      }
    } else {
      // Browser fallback (may still be blocked by Cloudflare from datacenter IP)
      try {
        const browserData = await scrapeWithBrowser(url, 35000);
        if (browserData.name === "Sorry, you have been blocked" || !browserData.currentPrice) {
          throw new Error("cloudflare_blocked");
        }
        return {
          name: browserData.name || urlData.name || null,
          brand: browserData.brand || urlData.brand || null,
          currentPrice: browserData.currentPrice || null,
          originalPrice: browserData.originalPrice || browserData.currentPrice || null,
          imageUrl: browserData.imageUrl || null,
          description: browserData.description || null,
          store,
          storeUrl: url,
          category: browserData.category || null,
          storeOffers: browserData.storeOffers,
        };
      } catch {
        throw new Error(
          `Akakçe sayfası yüklenemedi — Cloudflare koruması aktif. ` +
          getScraperApiSetupHint()
        );
      }
    }
  }

  // === STANDARD SITES: try direct fetch, detect Cloudflare, fallback to ScraperAPI or browser ===
  let html: string | null = null;
  let cloudflareBlocked = false;

  try {
    html = await proxyFetch(url, { timeoutMs: 15000 });
  } catch (err) {
    if (err instanceof CloudflareBlockedError || (err instanceof Error && err.message.includes("403"))) {
      cloudflareBlocked = true;
    } else {
      // Non-Cloudflare error: try to construct basic product from URL
      const name = urlData.name;
      if (!name) {
        throw new Error(`Sayfa yüklenemedi: ${err instanceof Error ? err.message : "bilinmeyen hata"}`);
      }
      return { name, brand: urlData.brand, currentPrice: null, originalPrice: null, imageUrl: null, description: null, store, storeUrl: url, category: null };
    }
  }

  // Cloudflare bypass: ScraperAPI → browser → graceful fallback
  if (cloudflareBlocked) {
    console.log(`[scraper] Cloudflare algılandı: ${url}`);
    if (hasScraperApiKey()) {
      try {
        html = await proxyFetch(url, { renderJs: false, timeoutMs: 30000 });
        cloudflareBlocked = false;
      } catch { /* try browser next */ }
    }

    if (cloudflareBlocked) {
      try {
        const browserData = await scrapeWithBrowser(url, 30000);
        if (browserData.name !== "Sorry, you have been blocked" && (browserData.currentPrice || browserData.name)) {
          return {
            name: browserData.name || urlData.name || null,
            brand: browserData.brand || urlData.brand || null,
            currentPrice: browserData.currentPrice || null,
            originalPrice: browserData.originalPrice || browserData.currentPrice || null,
            imageUrl: browserData.imageUrl || null,
            description: browserData.description || null,
            store,
            storeUrl: url,
            category: browserData.category || null,
            storeOffers: browserData.storeOffers,
          };
        }
      } catch { /* final fallback */ }

      // Final: can't bypass; return what we can from URL
      const name = urlData.name;
      if (!name) {
        throw new Error(
          `${new URL(url).hostname} bot koruması aktif. ` + getScraperApiSetupHint()
        );
      }
      return { name, brand: urlData.brand, currentPrice: null, originalPrice: null, imageUrl: null, description: null, store, storeUrl: url, category: null };
    }
  }

  if (!html) {
    const name = urlData.name;
    if (!name) throw new Error("Sayfa içeriği alınamadı ve URL'den ürün bilgisi çıkarılamadı.");
    return { name, brand: urlData.brand, currentPrice: null, originalPrice: null, imageUrl: null, description: null, store, storeUrl: url, category: null };
  }

  // Standard site parsing
  const jsonLdData = parseJsonLd(html) || {};
  const ogData = parseOpenGraph(html);
  const domPrices = (!jsonLdData.currentPrice && !ogData.currentPrice)
    ? parseDomPrices(html)
    : { currentPrice: null, originalPrice: null };

  const merged: ScrapedProduct = {
    name: jsonLdData.name || ogData.name || urlData.name || null,
    brand: jsonLdData.brand || urlData.brand || null,
    currentPrice: jsonLdData.currentPrice || ogData.currentPrice || domPrices.currentPrice || null,
    originalPrice: jsonLdData.originalPrice || ogData.originalPrice || domPrices.originalPrice || null,
    imageUrl: jsonLdData.imageUrl || ogData.imageUrl || null,
    description: jsonLdData.description || ogData.description || null,
    store,
    storeUrl: url,
    category: jsonLdData.category || null,
    storeOffers: jsonLdData.storeOffers,
  };

  if (!merged.currentPrice && merged.originalPrice) merged.currentPrice = merged.originalPrice;
  if (!merged.originalPrice && merged.currentPrice) merged.originalPrice = merged.currentPrice;

  return merged;
}
