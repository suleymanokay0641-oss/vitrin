import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon, Loader2, MousePointerClick, Trophy, TrendingUp,
  Plus, Coins, ArrowRight, ShoppingBag, Users, Zap, ChevronRight,
  Crown, CheckCircle, XCircle, Package, ExternalLink, Timer,
  BadgePercent, Star, Trash2, AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { AdSlot } from "@/components/ad-slot";
import { scrapeUrl, useCreateProduct, getSearchProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL;

interface VitrinProduct {
  id: number;
  name: string;
  url?: string;
  imageUrl?: string;
  currentPrice?: number;
  store?: string;
  monthlyClicks: number;
  createdAt: string;
}

interface VitrinData {
  products: VitrinProduct[];
  totalClicks: number;
  yearMonth: string;
  poolAmount: number;
  daysRemaining: number;
}

interface RankInfo {
  rank: number | null;
  totalPoints: number;
  clickPoints: number;
  activityPoints: number;
  estimatedEarnings: number;
  inPool: boolean;
  inSecondPool: boolean;
  daysRemaining: number;
  totalParticipants: number;
  totalRegistered: number;
  pointsToNextRank: number | null;
  nextRank: number | null;
  poolAmount: number;
}

interface ScrapeResult {
  name?: string;
  price?: string;
  imageUrl?: string;
  currency?: string;
  domain?: string;
}

function formatTL(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";
}

function formatDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

// --- URL Ekleme Kutusu ---
function AddUrlBox({ userId, onAdded }: { userId: string | null; onAdded: () => void }) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "scraping" | "confirming" | "adding">("idle");
  const [scraped, setScraped] = useState<ScrapeResult | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { mutateAsync: createProduct } = useCreateProduct();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed.startsWith("http")) {
      toast({ title: "Geçersiz URL", description: "https:// ile başlayan bir link girin", variant: "destructive" });
      return;
    }
    setState("scraping");
    try {
      const res = await scrapeUrl({ url: trimmed });
      setScraped(res);
      setState("confirming");
    } catch {
      toast({ title: "URL alınamadı", description: "Link erişilebilir değil veya desteklenmiyor", variant: "destructive" });
      setState("idle");
    }
  }, [url, toast]);

  const handleConfirm = useCallback(async () => {
    if (!scraped || !userId) return;
    if (!scraped.imageUrl) {
      toast({
        title: "Resim bulunamadı",
        description: "Bu ürün sayfasından resim çekilemedi. Lütfen farklı bir ürün linki deneyin.",
        variant: "destructive",
      });
      setState("idle");
      setScraped(null);
      setUrl("");
      return;
    }
    setState("adding");
    try {
      await createProduct({
        data: {
          url: url.trim(),
          name: scraped.name || "Ürün",
          currentPrice: scraped.price ? parseFloat(scraped.price.replace(/[^\d.,]/g, "").replace(",", ".")) : undefined,
          imageUrl: scraped.imageUrl,
          currency: scraped.currency ?? "TRY",
          domain: scraped.domain ?? formatDomain(url),
          createdByUserId: parseInt(userId),
        },
      });
      qc.invalidateQueries({ queryKey: getSearchProductsQueryKey({ q: "" }) });
      toast({ title: "Vitrine eklendi!", description: "Ürününüz yayına alındı." });
      setUrl("");
      setScraped(null);
      setState("idle");
      onAdded();
    } catch {
      toast({ title: "Hata", description: "Ekleme başarısız oldu", variant: "destructive" });
      setState("idle");
    }
  }, [scraped, userId, url, createProduct, qc, toast, onAdded]);

  return (
    <div className="w-full">
      {state !== "confirming" ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://trendyol.com/... veya herhangi bir ürün linki"
              className="pl-9 h-12 text-base border-2 border-border/50 focus:border-primary"
            />
          </div>
          <Button type="submit" size="lg" disabled={state === "scraping" || !url.trim()} className="h-12 px-6 font-semibold">
            {state === "scraping" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1.5" />Ekle</>}
          </Button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-primary/30 rounded-xl p-4 bg-primary/5 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            {scraped?.imageUrl ? (
              <img src={scraped.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border border-border flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-2">{scraped?.name || "Ürün"}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{formatDomain(url)}</p>
              {scraped?.price && (
                <Badge variant="secondary" className="mt-1 text-xs">{scraped.price}</Badge>
              )}
              {!scraped?.imageUrl && (
                <p className="text-destructive text-xs mt-1 font-medium">⚠ Resim çekilemedi — eklenemiyor</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConfirm} disabled={state === "adding" || !scraped?.imageUrl} className="flex-1 font-semibold">
              {state === "adding" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Vitrine Ekle & Kazan
            </Button>
            <Button variant="outline" onClick={() => { setState("idle"); setScraped(null); }}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// --- Havuz Bilgi Kartları (herkese görünür) ---
function PoolBar({ poolAmount, daysRemaining, participants }: { poolAmount: number; daysRemaining: number; participants: number }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-border/50 border border-border/50 rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm">
      {[
        { label: "Bu ay havuzda", value: formatTL(poolAmount), icon: <Coins className="w-4 h-4 text-emerald-500" /> },
        { label: "Katılımcı", value: participants.toLocaleString("tr-TR"), icon: <Users className="w-4 h-4 text-blue-500" /> },
        { label: "Kalan gün", value: daysRemaining.toString(), icon: <Timer className="w-4 h-4 text-orange-500" /> },
      ].map(item => (
        <div key={item.label} className="flex flex-col items-center py-3 px-2 gap-0.5">
          <div className="flex items-center gap-1.5 mb-0.5">{item.icon}<span className="text-xl font-bold">{item.value}</span></div>
          <span className="text-[11px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// --- Kullanıcı Sıra Kartı ---
function RankCard({ rankInfo }: { rankInfo: RankInfo }) {
  const { rank, totalPoints, clickPoints, activityPoints, estimatedEarnings, inPool, daysRemaining, totalParticipants, pointsToNextRank, nextRank } = rankInfo;
  return (
    <div className={`rounded-xl border-2 p-5 ${inPool ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className={`w-5 h-5 ${inPool ? "text-amber-500" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium text-muted-foreground">Bu ayki sıran</span>
          </div>
          {rank ? (
            <div className="text-4xl font-black">#{rank}</div>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">—</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {totalParticipants > 0 ? `${totalParticipants} katılımcı arasında` : "Henüz sıralamaya girmedin"}
          </p>
          {totalPoints > 0 && (
            <div className="flex gap-2 mt-1.5 text-xs">
              <span className="text-muted-foreground">🖱️ {clickPoints || 0} tıklama</span>
              <span className="text-purple-600">⚡ {activityPoints || 0} aktivite</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Tahmini kazanç</p>
          <div className="text-2xl font-black text-emerald-600">{formatTL(estimatedEarnings)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {inPool ? "İlk 1000'desin (%50 havuz)" : rank ? "1001+ (%40 eşit bölüşüm)" : "Aktivite yapınca başlar"}
          </p>
        </div>
      </div>
      {pointsToNextRank !== null && nextRank !== null && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
            {pointsToNextRank} puan daha → #{nextRank} olursun (ürün ekle, görev tamamla)
          </p>
        </div>
      )}
      {!rank && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Ürün ekle, vitrinini paylaş, görev tamamla → puan kazan → sıralamaya gir → havuzdan pay al
          </p>
        </div>
      )}
    </div>
  );
}

// --- Vitrin Ürün Listesi ---
function VitrinProducts({ products, totalClicks, accessToken, onDeleted }: {
  products: VitrinProduct[];
  totalClicks: number;
  accessToken?: string | null;
  onDeleted?: () => void;
}) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const recordClick = useCallback((id: number) => {
    fetch(`${BASE}api/products/${id}/affiliate-click`, { method: "POST" }).catch(() => {});
  }, []);

  const handleDelete = useCallback(async (p: VitrinProduct) => {
    if (!accessToken) { toast({ title: "Giriş gerekli", variant: "destructive" }); return; }
    if (!confirm(`"${p.name}" ürününü vitrininden kaldırmak istediğine emin misin?`)) return;
    setDeletingId(p.id);
    try {
      const r = await fetch(`${BASE}api/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || "Silinemedi"); }
      toast({ title: "Ürün silindi", description: `${p.name} vitrininden kaldırıldı.` });
      onDeleted?.();
    } catch (err: any) {
      toast({ title: "Hata", description: err.message || "Silinemedi", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }, [accessToken, toast, onDeleted]);

  if (products.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
        <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Vitrininde henüz ürün yok</p>
        <p className="text-sm mt-1">Yukarıya bir ürün linki yapıştır, hemen ekle</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {products.map(p => {
        const pct = totalClicks > 0 ? (p.monthlyClicks / totalClicks) * 100 : 0;
        return (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-border transition-colors group">
            <a
              href={p.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => p.url && recordClick(p.id)}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{p.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{p.store ?? (p.url ? formatDomain(p.url) : "")}</p>
                  {p.currentPrice && p.currentPrice > 0 && (
                    <span className="text-xs font-bold text-primary">{p.currentPrice.toLocaleString("tr-TR")} ₺</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-primary shrink-0">{p.monthlyClicks} tıklama</span>
                </div>
              </div>
            </a>
            <div className="flex items-center gap-1.5 shrink-0">
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordClick(p.id)}
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                  title="Siteyi aç"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {accessToken && (
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="Sil"
                >
                  {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Dashboard (giriş yapmış kullanıcı) ---
function UserDashboard({ userId }: { userId: string }) {
  const { accessToken } = useAuth();
  const [vitrin, setVitrin] = useState<VitrinData | null>(null);
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(() => {
    fetch(`${BASE}api/earnings/vitrin/${userId}`).then(r => r.json()).then(setVitrin).catch(() => {});
    fetch(`${BASE}api/rankings/my/${userId}`).then(r => r.json()).then(setRankInfo).catch(() => {});
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Vitrinin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Bu ay aldığın tıklamalar gerçek para kazandırıyor</p>
        </div>
        <Link href="/siralama">
          <Button variant="outline" size="sm" className="gap-2 font-medium">
            <Trophy className="w-4 h-4" />
            Sıralama
          </Button>
        </Link>
      </div>

      {vitrin && (
        <PoolBar
          poolAmount={vitrin.poolAmount}
          daysRemaining={vitrin.daysRemaining}
          participants={rankInfo?.totalParticipants ?? 0}
        />
      )}

      {rankInfo && <RankCard rankInfo={rankInfo} />}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Ürünlerim</h2>
          {vitrin && vitrin.totalClicks > 0 && (
            <Badge variant="secondary" className="gap-1">
              <MousePointerClick className="w-3 h-3" />
              Toplam {vitrin.totalClicks} tıklama
            </Badge>
          )}
        </div>
        <AddUrlBox userId={userId} onAdded={() => setRefreshKey(k => k + 1)} />
        {vitrin && (
          <VitrinProducts
            products={vitrin.products}
            totalClicks={vitrin.totalClicks}
            accessToken={accessToken}
            onDeleted={() => setRefreshKey(k => k + 1)}
          />
        )}
      </div>

      <div className="pt-2">
        <AdSlot />
      </div>

      <HowEarningsWork />
    </div>
  );
}

// --- Nasıl Çalışır Açıklaması ---
function HowEarningsWork() {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-4">
      <h3 className="font-bold text-base flex items-center gap-2">
        <BadgePercent className="w-4 h-4 text-primary" />
        Havuz nasıl dağıtılır?
      </h3>
      <div className="space-y-2.5 text-sm">
        {[
          { badge: "%50", label: "İlk 1000", desc: "Tıklama sayısına orantılı olarak paylaşılır", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
          { badge: "%40", label: "1001. ve sonrası", desc: "Kalan herkese eşit bölüşülür — kimse boş çıkmaz", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
          { badge: "%10", label: "Platform", desc: "Altyapı ve geliştirme için ayrılır", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
        ].map(row => (
          <div key={row.badge} className="flex items-start gap-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${row.color}`}>{row.badge}</span>
            <div>
              <span className="font-semibold">{row.label}</span>
              <span className="text-muted-foreground"> — {row.desc}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-border/50 space-y-1.5 text-sm">
        <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Gelir kaynakları</p>
        <p><span className="font-medium">Reklam gelirleri</span> → tamamı tıklama havuzuna</p>
        <p><span className="font-medium">Pro üyelik (49 TL/ay)</span> → %50 platform · %50 tüm kayıtlı kullanıcılara eşit ödül</p>
      </div>
    </div>
  );
}

// --- Ziyaretçi Landing Page ---
function GuestLanding() {
  const [url, setUrl] = useState("");
  const [pool, setPool] = useState<{ poolAmount: number; daysRemaining: number; totalParticipants?: number } | null>(null);

  useEffect(() => {
    fetch(`${BASE}api/earnings/pool`).then(r => r.json()).then(d => {
      setPool({ poolAmount: d.poolAmount, daysRemaining: d.daysRemaining });
    }).catch(() => {});
    fetch(`${BASE}api/rankings/live?limit=1`).then(r => r.json()).then(d => {
      setPool(prev => prev ? { ...prev, totalParticipants: d.meta?.totalParticipants ?? 0 } : null);
    }).catch(() => {});
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("guest-url-input") as HTMLInputElement;
    if (el) el.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Helmet>
        <title>Vitrin — Ürün ekle, aylık kazan</title>
        <meta name="description" content="Herhangi bir mağazadan ürün linki ekle. Ürününe her tıklamada aylık reklam havuzundan pay kazan." />
      </Helmet>

      {/* Hero */}
      <section className="w-full pt-20 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Ürün ekle · Tıklama al · Gerçek para kazan
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-5">
            Vitrinine ürün ekle,<br />
            <span className="text-primary">aylık para kazan.</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Herhangi bir mağazadan ürün linki ekle. Her tıklamada aylık gelir havuzundan pay al.
            Affiliate sistemi yok — her site eşit, herkes kazanabilir.
          </p>

          {pool && (
            <div className="max-w-md mx-auto mb-8">
              <PoolBar poolAmount={pool.poolAmount} daysRemaining={pool.daysRemaining} participants={pool.totalParticipants ?? 0} />
            </div>
          )}

          <form
            onSubmit={e => { e.preventDefault(); }}
            className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="guest-url-input"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://trendyol.com/... veya herhangi bir ürün linki"
                className="pl-9 h-13 text-base border-2"
              />
            </div>
            <Link href="/add">
              <Button size="lg" className="h-13 px-7 font-bold w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1.5" />
                Ücretsiz Başla
              </Button>
            </Link>
          </form>

          <p className="text-xs text-muted-foreground mt-3">
            Trendyol · Hepsiburada · Amazon TR · MediaMarkt · N11 · Teknosa · Vatan · ve daha fazlası
          </p>
        </motion.div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="w-full py-16 px-4 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10">3 adımda kazan</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", icon: <LinkIcon className="w-6 h-6" />, title: "URL'yi yapıştır", desc: "Herhangi bir e-ticaret sitesinden ürün linki yapıştır. Sistem ürün bilgilerini otomatik çeker." },
              { step: "2", icon: <ShoppingBag className="w-6 h-6" />, title: "Vitrinini paylaş", desc: "Ürün Vitrin'de yayına girer. Vitrinini sosyal medyada, gruplarda, arkadaşlarınla paylaş." },
              { step: "3", icon: <Coins className="w-6 h-6" />, title: "Aylık kazan", desc: "Her tıklama sıralamana katkı sağlar. Ay sonunda aylık havuzdan payını IBAN'ına çek." },
            ].map(item => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border/50 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Adım {item.step}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Havuz Dağıtımı */}
      <section className="w-full py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">Şeffaf gelir modeli</h2>
          <p className="text-center text-muted-foreground mb-10">Tüm reklam gelirleri, üyelik ücretleri belirli kurallara göre katılımcılara dağıtılır.</p>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Reklam Havuzu</h3>
              </div>
              <div className="space-y-3">
                {[
                  { pct: "50%", label: "İlk 1000", sub: "Orantılı — çok tıklayan çok kazanır", color: "text-amber-600" },
                  { pct: "40%", label: "1001 ve üzeri", sub: "Eşit — kimse boş çıkmaz", color: "text-blue-600" },
                  { pct: "10%", label: "Platform", sub: "Altyapı & geliştirme", color: "text-gray-500" },
                ].map(r => (
                  <div key={r.pct} className="flex items-center gap-3">
                    <span className={`text-xl font-black w-14 shrink-0 ${r.color}`}>{r.pct}</span>
                    <div>
                      <p className="font-semibold text-sm">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Pro Üyelik (49 TL/ay)</h3>
              </div>
              <div className="space-y-3">
                {[
                  { key: "sub-platform", pct: "50%", label: "Platform", sub: "Altyapı & geliştirme", color: "text-gray-500" },
                  { key: "sub-users", pct: "50%", label: "Tüm kayıtlı kullanıcılar", sub: "Sadece kayıtlı olman yeterli — eşit bölüşüm", color: "text-emerald-600" },
                ].map(r => (
                  <div key={r.key} className="flex items-center gap-3">
                    <span className={`text-xl font-black w-14 shrink-0 ${r.color}`}>{r.pct}</span>
                    <div>
                      <p className="font-semibold text-sm">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <Star className="w-3 h-3 inline mr-1" />
                  Sisteme kayıt ol → her ay Pro üyelik gelirinden payını al. Tıklama gerekmez.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16 px-4 bg-primary/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Hemen başla</h2>
          <p className="text-muted-foreground mb-7">Ücretsiz kayıt — kredi kartı gerekmez. İlk ürününü ekle, bu ay havuzda yerini al.</p>
          <Link href="/add">
            <Button size="lg" className="font-bold text-base px-8 h-14 gap-2">
              <Zap className="w-5 h-5" />
              Vitrinini Oluştur
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <AdSlot />
      </div>
    </div>
  );
}

// --- Ana Sayfa ---
export default function Home() {
  const [userId] = useState(() => localStorage.getItem("fd-user-id"));

  return (
    <>
      <Helmet>
        <title>Vitrin — Ürün ekle, aylık kazan</title>
        <meta name="description" content="Herhangi bir mağazadan ürün linki ekle. Her tıklamada aylık reklam havuzundan pay kazan." />
      </Helmet>

      <AnimatePresence mode="wait">
        {userId ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <UserDashboard userId={userId} />
          </motion.div>
        ) : (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <GuestLanding />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
