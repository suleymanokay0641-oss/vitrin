/**
 * Smart fetch wrapper that routes through ScraperAPI when available,
 * otherwise falls back to direct fetch.
 *
 * ScraperAPI handles:
 * - Residential IP routing (bypasses Cloudflare/bot protection)
 * - JavaScript rendering (for JS-heavy sites like Akakçe)
 * - Automatic retries
 *
 * Sign up for free at https://www.scraperapi.com (1000 free req/month)
 * Set SCRAPER_API_KEY environment variable to enable.
 */

const SCRAPER_API_BASE = "https://api.scraperapi.com";
const DIRECT_FETCH_TIMEOUT = 15000;

export function hasScraperApiKey(): boolean {
  return !!process.env.SCRAPER_API_KEY;
}

interface ProxyFetchOptions {
  /**
   * Whether JavaScript rendering is needed (for Cloudflare-protected/JS-heavy sites).
   * Uses 5x credits on ScraperAPI. Default: false.
   */
  renderJs?: boolean;
  /** Custom headers for direct fetch mode (ignored in proxy mode) */
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Fetch a URL, routing through ScraperAPI if key is configured.
 * Returns the response HTML string, or throws on error.
 */
export async function proxyFetch(url: string, options: ProxyFetchOptions = {}): Promise<string> {
  const { renderJs = false, headers = {}, timeoutMs = DIRECT_FETCH_TIMEOUT } = options;
  const apiKey = process.env.SCRAPER_API_KEY;

  if (apiKey) {
    return scraperApiFetch(url, apiKey, renderJs, timeoutMs);
  }

  return directFetch(url, headers, timeoutMs);
}

async function scraperApiFetch(url: string, apiKey: string, renderJs: boolean, timeoutMs: number): Promise<string> {
  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    country_code: "tr",
    ...(renderJs ? { render: "true" } : {}),
  });

  const scraperUrl = `${SCRAPER_API_BASE}?${params}`;

  const response = await fetch(scraperUrl, {
    headers: { Accept: "text/html,application/json" },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs + 20000), // ScraperAPI needs extra time
  });

  if (!response.ok) {
    throw new Error(`ScraperAPI HTTP ${response.status}: ${await response.text().then(t => t.slice(0, 200))}`);
  }

  return response.text();
}

async function directFetch(url: string, headers: Record<string, string>, timeoutMs: number): Promise<string> {
  const defaultHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
  };

  const response = await fetch(url, {
    headers: { ...defaultHeaders, ...headers },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();

  // Detect Cloudflare block
  if (
    html.includes("Attention Required! | Cloudflare") ||
    html.includes("cf-browser-verification") ||
    html.includes("Sorry, you have been blocked") ||
    html.includes("Enable JavaScript and cookies to continue")
  ) {
    throw new CloudflareBlockedError(url);
  }

  return html;
}

export class CloudflareBlockedError extends Error {
  constructor(url: string) {
    super(`Cloudflare bot koruması aktif: ${new URL(url).hostname}`);
    this.name = "CloudflareBlockedError";
  }
}

export function getScraperApiSetupHint(): string {
  return [
    "Bu site bot koruması (Cloudflare) kullanıyor.",
    "Çözüm: ScraperAPI ücretsiz hesabı oluşturun (scraperapi.com) ve",
    "SCRAPER_API_KEY ortam değişkenine API anahtarınızı ekleyin.",
    "Ücretsiz plan: 1000 istek/ay, kredi kartı gerekmez.",
  ].join(" ");
}
