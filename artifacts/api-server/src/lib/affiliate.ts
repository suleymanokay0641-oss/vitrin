const TRENDYOL_ID = process.env["TRENDYOL_AFFILIATE_ID"] || "";
const HEPSIBURADA_ID = process.env["HEPSIBURADA_AFFILIATE_ID"] || "";
const AMAZON_TR_TAG = process.env["AMAZON_TR_AFFILIATE_TAG"] || "";

export function buildAffiliateUrl(originalUrl: string | null | undefined): string | null {
  if (!originalUrl) return null;
  try {
    const u = new URL(originalUrl);
    const host = u.hostname.toLowerCase();

    if (host.includes("trendyol.com") && TRENDYOL_ID) {
      u.searchParams.set("boutiqueId", TRENDYOL_ID);
      return u.toString();
    }
    if (host.includes("hepsiburada.com") && HEPSIBURADA_ID) {
      u.searchParams.set("affiliateId", HEPSIBURADA_ID);
      return u.toString();
    }
    if ((host.includes("amazon.com.tr") || host.includes("amazon.tr")) && AMAZON_TR_TAG) {
      u.searchParams.set("tag", AMAZON_TR_TAG);
      return u.toString();
    }
    return originalUrl;
  } catch {
    return originalUrl;
  }
}

export function getStoreName(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  try {
    const host = new URL(url).hostname.toLowerCase().replace("www.", "");
    if (host.includes("trendyol")) return "Trendyol";
    if (host.includes("hepsiburada")) return "Hepsiburada";
    if (host.includes("amazon")) return "Amazon TR";
    if (host.includes("mediamarkt")) return "MediaMarkt";
    if (host.includes("teknosa")) return "Teknosa";
    if (host.includes("vatan")) return "Vatan";
    if (host.includes("n11")) return "N11";
    if (host.includes("ciceksepeti")) return "ÇiçekSepeti";
    return fallback;
  } catch {
    return fallback;
  }
}
