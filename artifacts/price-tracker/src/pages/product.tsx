import { useState, useCallback } from "react";
import { useGetProduct, useRefreshProductPrice } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { cn, formatTRY, formatDate } from "@/lib/utils";
import { PriceChart } from "@/components/price-chart";
import { AddPriceDialog } from "@/components/add-price-dialog";
import { RiskPanel } from "@/components/risk-panel";
import { ColorVoting } from "@/components/color-voting";
import { ReviewSection } from "@/components/review-section";
import { AdSlot } from "@/components/ad-slot";
import { PriceAlarm } from "@/components/price-alarm";
import StoreComparison, { type StoreOffer } from "@/components/store-comparison";
import { OfficialPriceWarning } from "@/components/official-price-warning";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  TrendingDown,
  ShoppingBag,
  TrendingUp,
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  WifiOff,
  PenLine,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;

function imgProxy(url: string | null | undefined): string | null {
  if (!url) return null;
  return `${BASE}api/img-proxy?url=${encodeURIComponent(url)}`;
}

function StatCard({
  title,
  value,
  isSuccess,
  isDanger,
}: {
  title: string;
  value: number;
  isSuccess?: boolean;
  isDanger?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-border/60 bg-card overflow-hidden",
        isSuccess && "border-[#10b981]/30 bg-[#10b981]/5",
        isDanger && "border-destructive/30 bg-destructive/5"
      )}
    >
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p
          className={cn(
            "text-2xl font-display font-black tracking-tight",
            isSuccess && "text-[#10b981]",
            isDanger && "text-destructive",
            !isSuccess && !isDanger && "text-foreground"
          )}
        >
          {formatTRY(value)}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Product({ id }: { id: string }) {
  const productId = parseInt(id, 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: product, isLoading, error } = useGetProduct(productId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [refreshError, setRefreshError] = useState<{ message: string; isCloudflare: boolean } | null>(null);
  const [imgError, setImgError] = useState(false);

  const refreshMutation = useRefreshProductPrice({
    mutation: {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: ["getProduct", productId] });
        toast({
          title: result.changed ? "Fiyat Güncellendi!" : "Fiyat Değişmedi",
          description: result.message,
        });
        setIsRefreshing(false);
        setRefreshError(null);
      },
      onError: (err: unknown) => {
        const message = err instanceof Error ? err.message : "Fiyat güncellenemedi";
        const isCloudflare =
          message.toLowerCase().includes("cloudflare") ||
          message.toLowerCase().includes("scraperapi") ||
          message.toLowerCase().includes("bot koruması") ||
          message.toLowerCase().includes("engellenmiş");
        setRefreshError({ message, isCloudflare });
        setIsRefreshing(false);
      },
    },
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshMutation.mutate({ id: productId });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] rounded-3xl" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[300px] mt-8 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center flex flex-col items-center">
        <Helmet>
          <title>Ürün Bulunamadı — Fiyat Dedektifi</title>
        </Helmet>
        <AlertTriangle className="w-20 h-20 text-destructive/50 mb-6" />
        <h1 className="text-4xl font-display font-black mb-4">Ürün Bulunamadı</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Aradığınız ürün sistemimizde kayıtlı değil veya silinmiş olabilir.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const discountLabel = product.isFakeDiscount ? "Sahte İndirim" : "Gerçek İndirim";
  const metaTitle = `${product.name} — ${discountLabel} | Fiyat Dedektifi`;
  const metaDescription = `${product.name} fiyat geçmişi ve indirim analizi. Mevcut fiyat: ${formatTRY(product.currentPrice)}. ${
    product.isFakeDiscount
      ? "DİKKAT: Bu indirim sahte görünüyor."
      : "Bu gerçek bir indirim fırsatı!"
  }`;

  const sortedHistory = [...product.priceHistory].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
  const INITIAL_VISIBLE = 10;
  const visibleHistory = showAllHistory ? sortedHistory : sortedHistory.slice(0, INITIAL_VISIBLE);
  const hasMore = sortedHistory.length > INITIAL_VISIBLE;

  const proxyImg = !imgError ? imgProxy(product.imageUrl) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {product.imageUrl && <meta property="og:image" content={product.imageUrl} />}
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            brand: { "@type": "Brand", name: product.brand },
            category: product.category,
            description: product.description || metaDescription,
            image: product.imageUrl,
            offers: {
              "@type": "Offer",
              price: product.currentPrice,
              priceCurrency: "TRY",
              url: product.storeUrl,
              seller: { "@type": "Organization", name: product.store },
            },
          })}
        </script>
      </Helmet>

      {/* Back nav */}
      <Link
        href={`/search${product.category ? `?category=${encodeURIComponent(product.category)}` : ""}`}
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-medium mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        {product.category || "Tüm Ürünler"} Kategorisine Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Image & Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="aspect-square bg-white rounded-3xl border border-border/60 p-8 flex items-center justify-center relative overflow-hidden shadow-sm">
            {proxyImg ? (
              <img
                src={proxyImg}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply"
                onError={() => setImgError(true)}
              />
            ) : (
              <ShoppingBag className="w-32 h-32 text-muted-foreground/10" />
            )}
          </div>

          <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg mb-4">Ürün Bilgileri</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Marka</span>
                <span className="font-semibold">{product.brand}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Kategori</span>
                <span className="font-semibold">{product.category}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Mağaza</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">{product.store}</span>
                  {product.storeUrl && (
                    <a
                      href={product.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                      title="Mağazaya Git"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              {product.description && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Affiliate Buy Button */}
            {(product.affiliateUrl || product.storeUrl) && (
              <Button
                className="w-full h-12 gap-2 font-bold text-base rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white mt-6"
                onClick={async () => {
                  const clickerUserId = localStorage.getItem("fd-user-id");
                  let sessionId = localStorage.getItem("fd-session-id");
                  if (!sessionId) { sessionId = Math.random().toString(36).slice(2); localStorage.setItem("fd-session-id", sessionId); }
                  try {
                    const resp = await fetch(`${import.meta.env.BASE_URL}api/products/${product.id}/affiliate-click`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ clickerUserId: clickerUserId ? parseInt(clickerUserId) : null, sessionId }),
                    });
                    const data = await resp.json();
                    const target = data.affiliateUrl || product.affiliateUrl || product.storeUrl;
                    if (data.clickerEarned > 0) toast({ title: `+${data.clickerEarned} Dedektif Puanı! 🪙`, description: "Mağaza ziyaretinden puan kazandın." });
                    window.open(target, "_blank", "noopener,noreferrer");
                  } catch {
                    window.open(product.affiliateUrl || product.storeUrl || "#", "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                {product.store} Mağazasında İncele
                <ExternalLink className="w-4 h-4 opacity-70" />
              </Button>
            )}

            {product.storeUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 gap-2 font-semibold"
                onClick={handleRefresh}
                disabled={isRefreshing || refreshMutation.isPending}
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    (isRefreshing || refreshMutation.isPending) && "animate-spin"
                  )}
                />
                {isRefreshing || refreshMutation.isPending ? "Güncelleniyor..." : "Güncel Fiyatı Çek"}
              </Button>
            )}

            {/* Refresh error panel */}
            {refreshError && (
              <div className={cn(
                "mt-4 rounded-2xl border p-4 space-y-3 text-sm",
                refreshError.isCloudflare
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50"
                  : "bg-destructive/5 border-destructive/20"
              )}>
                <div className="flex items-start gap-2">
                  {refreshError.isCloudflare
                    ? <WifiOff className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    : <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
                  }
                  <p className={cn(
                    "font-semibold leading-snug",
                    refreshError.isCloudflare ? "text-amber-800 dark:text-amber-300" : "text-destructive"
                  )}>
                    {refreshError.isCloudflare
                      ? "Site bot koruması aktif (Cloudflare)"
                      : "Otomatik güncelleme başarısız"}
                  </p>
                </div>

                {refreshError.isCloudflare && (
                  <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3 space-y-1.5 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">🔑 Çözüm — ScraperAPI (ücretsiz):</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li><a href="https://www.scraperapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">scraperapi.com</a> adresine git → ücretsiz hesap aç</li>
                      <li>API anahtarını kopyala</li>
                      <li>Bu projenin <strong>Secrets</strong> bölümüne ekle: <code className="bg-muted px-1 rounded">SCRAPER_API_KEY</code></li>
                      <li>Sunucuyu yeniden başlat → tekrar dene</li>
                    </ol>
                  </div>
                )}

                <div className="pt-1">
                  <AddPriceDialog
                    productId={product.id}
                    defaultNote="Manuel güncelleme"
                    triggerLabel="Fiyatı Elle Gir"
                    triggerVariant="default"
                    triggerClassName="w-full gap-2 font-semibold h-9"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setRefreshError(null)}
                  className="text-xs text-muted-foreground underline w-full text-center"
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Analytics */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-display font-black text-foreground leading-tight mb-4">
              {product.name}
            </h1>

            {/* Verdict Banner */}
            <div
              className={cn(
                "p-6 md:p-8 rounded-3xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm",
                product.isFakeDiscount
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-[#10b981]/5 border-[#10b981]/20"
              )}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      product.isFakeDiscount
                        ? "bg-destructive/10 text-destructive"
                        : "bg-[#10b981]/10 text-[#10b981]"
                    )}
                  >
                    {product.isFakeDiscount ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <h2
                    className={cn(
                      "text-2xl font-display font-black",
                      product.isFakeDiscount ? "text-destructive" : "text-[#10b981]"
                    )}
                  >
                    {product.isFakeDiscount ? "DİKKAT: Sahte İndirim!" : "ONAYLI: Gerçek İndirim!"}
                  </h2>
                </div>
                <p className="text-base font-medium text-muted-foreground max-w-lg">
                  {product.isFakeDiscount
                    ? "Bu ürünün fiyatı önce şişirilmiş, ardından indirilmiş gibi gösteriliyor. Orijinal fiyatı mevcut fiyattan daha düşük veya çok yakın."
                    : "Analizlerimize göre bu ürün tüm zamanların en düşük fiyat seviyelerinde. Bu gerçek bir fırsat!"}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end bg-background/50 p-4 rounded-2xl backdrop-blur-sm border border-border/50">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Görünür İndirim
                </span>
                <span
                  className={cn(
                    "text-5xl font-display font-black tracking-tighter",
                    product.isFakeDiscount ? "text-destructive" : "text-[#10b981]"
                  )}
                >
                  %{product.discountPercent.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Şu Anki Fiyat"
              value={product.currentPrice}
              isSuccess={!product.isFakeDiscount}
              isDanger={product.isFakeDiscount}
            />
            <StatCard title="İlan Edilen Eski Fiyat" value={product.originalPrice} />
            <StatCard
              title="En Düşük Fiyat"
              value={product.lowestPrice}
              isSuccess={product.currentPrice === product.lowestPrice}
            />
            <StatCard title="En Yüksek Fiyat" value={product.highestPrice} />
          </div>

          {/* Official Price Warning */}
          <div className="mb-8">
            <OfficialPriceWarning
              productId={product.id}
              currentPrice={product.currentPrice}
              officialPrice={product.officialPrice}
              officialStoreName={product.officialStoreName}
              officialStoreUrl={product.officialStoreUrl}
            />
          </div>

          {/* Store Comparison (shown when multi-store data is available, e.g. from Akakçe) */}
          {product.storeOffers && (product.storeOffers as StoreOffer[]).length > 0 && (
            <div className="mb-8">
              <StoreComparison offers={product.storeOffers as StoreOffer[]} />
            </div>
          )}

          {/* Risk Panel */}
          <div className="mb-8">
            <RiskPanel
              currentPrice={product.currentPrice}
              originalPrice={product.originalPrice}
              lowestPrice={product.lowestPrice}
              highestPrice={product.highestPrice}
              priceHistory={product.priceHistory}
              store={product.store}
              discountPercent={product.discountPercent}
            />
          </div>

          {/* Chart */}
          <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Fiyat Geçmişi Analizi</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {sortedHistory.length} kayıt · {sortedHistory.length > 0 ? formatDate(sortedHistory[sortedHistory.length - 1].recordedAt) + " — " + formatDate(sortedHistory[0].recordedAt) : ""}
                  </p>
                </div>
              </div>
              <AddPriceDialog productId={product.id} />
            </div>

            <div className="pt-4 border-t border-border/50">
              <PriceChart data={product.priceHistory} />
            </div>
          </div>

          {/* Full history list */}
          <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold">
                Tüm Fiyat Kayıtları
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({sortedHistory.length} kayıt)
                </span>
              </h3>
            </div>

            {sortedHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Henüz fiyat kaydı bulunmuyor.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {visibleHistory.map((entry, idx) => {
                    const prev = sortedHistory[idx + 1];
                    const diff = prev ? entry.price - prev.price : 0;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-2.5 h-2.5 rounded-full shrink-0",
                              diff > 0
                                ? "bg-destructive"
                                : diff < 0
                                ? "bg-emerald-500"
                                : "bg-muted-foreground/40"
                            )}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground">
                                {formatTRY(entry.price)}
                              </p>
                              {entry.note?.startsWith("Manuel") && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-semibold uppercase tracking-wide">
                                  <PenLine className="w-2.5 h-2.5" />
                                  Manuel
                                </span>
                              )}
                            </div>
                            {entry.note && !entry.note.startsWith("Manuel") && (
                              <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                            )}
                            {diff !== 0 && (
                              <p
                                className={cn(
                                  "text-xs font-semibold mt-0.5",
                                  diff > 0 ? "text-destructive" : "text-emerald-600"
                                )}
                              >
                                {diff > 0 ? "+" : ""}
                                {formatTRY(diff)} önceki kayıta göre
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground bg-background px-3 py-1 rounded-lg border border-border/50 shrink-0">
                          {formatDate(entry.recordedAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 gap-2 font-semibold"
                    onClick={() => setShowAllHistory(!showAllHistory)}
                  >
                    {showAllHistory ? (
                      <><ChevronUp className="w-4 h-4" />Daha Az Göster</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" />Tüm Geçmişi Gör ({sortedHistory.length - INITIAL_VISIBLE} kayıt daha)</>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Community Section — full width below the grid */}
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriceAlarm
            productId={product.id}
            currentPrice={product.currentPrice}
            lowestPrice={product.lowestPrice}
          />
          <ColorVoting productId={product.id} />
        </div>
        <ReviewSection productId={product.id} />
        <AdSlot placement="product" keyword={product.name} className="mt-6" />
      </div>
    </div>
  );
}
