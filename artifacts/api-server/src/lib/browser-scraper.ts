/**
 * Browser-based scraper using Playwright + Chromium.
 * Used for Cloudflare-protected sites like Akakçe.
 */
import { chromium } from "playwright-core";
import { execSync } from "child_process";
import type { StoreOffer } from "./scraper";

const STEALTH_SCRIPT = `
  // Remove webdriver flag
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'plugins', { get: () => [{ name: 'Chrome PDF Plugin' }, { name: 'Chrome PDF Viewer' }, { name: 'Native Client' }] });
  Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en-US', 'en'] });
  Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
  Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  // Overwrite chrome.runtime
  if (!window.chrome) { (window as any).chrome = { runtime: {} }; }
`;

export interface BrowserScrapedProduct {
  name: string | null;
  brand: string | null;
  currentPrice: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  description: string | null;
  category: string | null;
  storeOffers?: StoreOffer[];
  rawHtml?: string;
}

let _resolvedChromiumPath: string | null = null;

function getChromiumPath(): string {
  if (_resolvedChromiumPath) return _resolvedChromiumPath;
  if (process.env.CHROMIUM_PATH) {
    _resolvedChromiumPath = process.env.CHROMIUM_PATH;
    return _resolvedChromiumPath;
  }
  try {
    _resolvedChromiumPath = execSync("which chromium 2>/dev/null || which google-chrome 2>/dev/null || which chromium-browser 2>/dev/null", { timeout: 3000 })
      .toString()
      .trim();
    if (_resolvedChromiumPath) return _resolvedChromiumPath;
  } catch { /* fallback */ }
  throw new Error("Chromium bulunamadı. CHROMIUM_PATH ortam değişkenini ayarlayın.");
}

async function launchBrowser() {
  const executablePath = getChromiumPath();

  return chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-infobars",
      "--window-size=1280,800",
      "--lang=tr-TR",
    ],
  });
}

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
    s = afterComma.length <= 2 ? s.replace(",", ".") : s.replace(",", "");
  } else if (s.includes(".")) {
    const afterDot = s.split(".").pop() || "";
    if (afterDot.length === 3) s = s.replace(/\./g, "");
  }
  s = s.replace(/[^\d.]/g, "");
  const num = parseFloat(s);
  return isNaN(num) || num <= 0 ? null : num;
}

export async function scrapeWithBrowser(url: string, timeoutMs = 30000): Promise<BrowserScrapedProduct> {
  let browser: import("playwright-core").Browser | null = null;

  try {
    browser = await launchBrowser();

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      locale: "tr-TR",
      timezoneId: "Europe/Istanbul",
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: {
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "sec-ch-ua": '"Chromium";v="138", "Google Chrome";v="138", "Not=A?Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    });

    // Inject stealth script before every page load
    await context.addInitScript(STEALTH_SCRIPT);

    const page = await context.newPage();

    // Block unnecessary resources to speed up loading
    await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2,ttf,otf,mp4,mp3,ogg}", (route) =>
      route.abort()
    );
    await page.route("**/{analytics,gtm,hotjar,googletagmanager,facebook,twitter,tiktok}**", (route) =>
      route.abort()
    );

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });

    // Wait for prices to appear or timeout after 10s
    await page.waitForTimeout(2000);

    // Try to extract JSON-LD first
    const jsonLdData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || "");
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            const type = item["@type"];
            if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) {
              return item;
            }
          }
        } catch { /* ignore */ }
      }
      return null;
    });

    // Extract product name from h1
    const name = await page.evaluate(() =>
      document.querySelector("h1")?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
      null
    );

    // Extract image
    const imageUrl = await page.evaluate(() =>
      document.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      document.querySelector('[itemprop="image"]')?.getAttribute("src") ||
      null
    );

    // Parse JSON-LD offers
    const storeOffers: StoreOffer[] = [];
    if (jsonLdData?.offers) {
      const rawOffers = jsonLdData.offers["@type"] === "AggregateOffer"
        ? (Array.isArray(jsonLdData.offers.offers) ? jsonLdData.offers.offers : [])
        : (Array.isArray(jsonLdData.offers) ? jsonLdData.offers : [jsonLdData.offers]);

      for (const offer of rawOffers) {
        const price = offer.price != null ? parseFloat(String(offer.price)) : null;
        const seller = offer.seller?.name || offer.seller;
        if (price && price > 0 && seller) {
          storeOffers.push({
            store: String(seller),
            price,
            url: offer.url || "",
          });
        }
      }
    }

    // If no JSON-LD offers, try DOM-based extraction for Akakçe
    if (storeOffers.length === 0) {
      const domOffers = await page.evaluate(() => {
        const results: Array<{ store: string; price: number; url: string }> = [];

        // Akakçe-specific: look for price list items
        const selectors = [
          "ul.pr_l > li",
          ".pr_l > li",
          "li[data-v]",
          ".product-list > li",
          "ul > li.prd",
        ];

        for (const sel of selectors) {
          const items = document.querySelectorAll(sel);
          if (!items.length) continue;

          items.forEach((item) => {
            // Store name from image alt or text
            const img = item.querySelector("img");
            const storeName =
              img?.getAttribute("alt") ||
              item.querySelector(".pn_ms, .mn, [class*='merchant'], [class*='store']")?.textContent?.trim();

            // Price text
            const priceEl = item.querySelector(".pn_pr, .pr, [itemprop='price'], [class*='price'], [class*='Price']");
            const priceText =
              priceEl?.getAttribute("content") ||
              priceEl?.textContent?.trim() ||
              (() => {
                const text = item.textContent || "";
                const m = text.match(/[\d.,]+\s*TL|₺\s*[\d.,]+/);
                return m ? m[0] : null;
              })();

            const linkEl = item.querySelector("a");
            const storeUrl = linkEl?.getAttribute("href") || "";

            if (priceText && storeName) {
              // Parse price
              let s = priceText.replace(/[₺TL€$£\s]/g, "").trim();
              if (s.includes(",") && s.includes(".")) {
                const ci = s.lastIndexOf(","), di = s.lastIndexOf(".");
                s = di < ci ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
              } else if (s.includes(",")) {
                const after = s.split(",").pop() || "";
                s = after.length <= 2 ? s.replace(",", ".") : s.replace(",", "");
              } else if (s.includes(".")) {
                const after = s.split(".").pop() || "";
                if (after.length === 3) s = s.replace(/\./g, "");
              }
              s = s.replace(/[^\d.]/g, "");
              const price = parseFloat(s);
              if (!isNaN(price) && price > 0) {
                results.push({ store: storeName, price, url: storeUrl });
              }
            }
          });

          if (results.length > 0) break;
        }
        return results;
      });

      storeOffers.push(...domOffers);
    }

    storeOffers.sort((a, b) => a.price - b.price);

    // JSON-LD single price fallback
    let currentPrice: number | null = null;
    let originalPrice: number | null = null;

    if (jsonLdData?.offers) {
      const offers = jsonLdData.offers;
      if (offers["@type"] === "AggregateOffer") {
        currentPrice = offers.lowPrice != null ? parseFloat(String(offers.lowPrice)) : null;
        originalPrice = offers.highPrice != null ? parseFloat(String(offers.highPrice)) : null;
      } else {
        const singleOffer = Array.isArray(offers) ? offers[0] : offers;
        currentPrice = singleOffer?.price != null ? parseFloat(String(singleOffer.price)) : null;
        originalPrice = currentPrice;
      }
    }

    if (storeOffers.length > 0) {
      currentPrice = storeOffers[0].price;
      originalPrice = storeOffers[storeOffers.length - 1].price;
    }

    // Fall back to DOM price scan
    if (!currentPrice) {
      const domPrice = await page.evaluate(() => {
        const selectors = ["[data-price]", "[itemprop='price']", ".price", "[class*='price']", "[class*='Price']"];
        const prices: number[] = [];
        for (const sel of selectors) {
          document.querySelectorAll(sel).forEach((el) => {
            const t = el.getAttribute("content") || el.textContent?.trim() || "";
            const n = parseFloat(t.replace(/[^\d.]/g, ""));
            if (!isNaN(n) && n > 0) prices.push(n);
          });
        }
        return prices.length > 0 ? Math.min(...prices) : null;
      });
      currentPrice = domPrice;
      originalPrice = domPrice;
    }

    await context.close();

    return {
      name: name || jsonLdData?.name || null,
      brand: jsonLdData?.brand?.name || (typeof jsonLdData?.brand === "string" ? jsonLdData.brand : null) || null,
      currentPrice,
      originalPrice,
      imageUrl,
      description: jsonLdData?.description || null,
      category: jsonLdData?.category || null,
      storeOffers: storeOffers.length > 0 ? storeOffers : undefined,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => { /* ignore */ });
    }
  }
}
