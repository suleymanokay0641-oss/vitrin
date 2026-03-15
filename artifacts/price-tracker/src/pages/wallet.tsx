import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { usePoints } from "@/hooks/use-points";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Coins, Trophy, Ticket, Gift, Star,
  Gamepad2, Package, Bell, MessageSquare, Users,
  Loader2, CheckCircle, ChevronRight, Crown, Zap,
  TrendingUp, Clock, MousePointerClick, Link as LinkIcon,
  Banknote, Wallet as WalletIcon, CircleDollarSign, ArrowDownToLine,
  BadgeCheck, Info, BarChart3, CalendarDays,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;

const EARN_WAYS = [
  { icon: Gamepad2, label: "Oyun Oyna",       pts: "10 puan/tur",   max: "Günde max 50",  color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30" },
  { icon: Package,  label: "Ürün Ekle",       pts: "25 puan/ürün",  max: "Günde max 75",  color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  { icon: MessageSquare, label: "Yorum Yaz",  pts: "15 puan/yorum", max: "Günde max 30",  color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
  { icon: Bell,     label: "Alarm Kur",       pts: "10 puan/alarm", max: "Günde max 10",  color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  { icon: Star,     label: "Mağaza Ziyareti", pts: "5 puan/ziyaret",max: "Günde max 15",  color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30" },
  { icon: Users,    label: "Arkadaş Davet",   pts: "100 puan",      max: "Sınırsız",      color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30" },
];

interface TournamentInfo {
  weekKey: string; prize: string; sponsor: string; endDate: string;
  totalTickets: number; topEarners: Array<{ email: string; weeklyPoints: number }>;
}

interface PoolInfo {
  yearMonth: string; poolAmount: number; pricePerClick: number;
  totalUniqueClicks: number; daysRemaining: number; status: string;
}

interface EarningsDashboard {
  userId: number; email: string;
  currentMonth: { yearMonth: string; myClicks: number; estimatedTL: number; poolAmount: number; totalPoolClicks: number; pricePerClick: number };
  totalWithdrawable: number; hasPendingWithdrawal: boolean;
  pastEarnings: Array<{ yearMonth: string; totalClicks: number; earningsAmount: number; status: string }>;
  myProductCount: number;
}

interface WithdrawalRequest { id: number; amount: number; method: string; status: string; requestedAt: string }

function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Çekiliş yapıldı!"); return; }
      const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d} gün ${h} saat ${m} dakika`);
    };
    calc(); const t = setInterval(calc, 60000); return () => clearInterval(t);
  }, [endDate]);
  return <span>{timeLeft}</span>;
}

function formatYM(ym: string) {
  const [y, m] = ym.split("-");
  const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  return `${months[parseInt(m)-1]} ${y}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:      { label: "İşlemde",    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    withdrawable: { label: "Çekilebilir", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    withdrawn:    { label: "Çekildi",    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    approved:     { label: "Onaylandı",  cls: "bg-emerald-100 text-emerald-700" },
    paid:         { label: "Ödendi",     cls: "bg-emerald-100 text-emerald-700" },
    rejected:     { label: "Reddedildi", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
}

export default function Wallet() {
  const { toast } = useToast();
  const { userId, email, balance, isRegistering, register, buyRaffleTickets } = usePoints();
  const [emailInput, setEmailInput] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const [tournament, setTournament] = useState<TournamentInfo | null>(null);
  const [pool, setPool] = useState<PoolInfo | null>(null);
  const [earnings, setEarnings] = useState<EarningsDashboard | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<"iban" | "papara">("papara");
  const [withdrawAccountInfo, setWithdrawAccountInfo] = useState("");
  const [withdrawAccountName, setWithdrawAccountName] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [myProducts, setMyProducts] = useState<Array<{ id: number; name: string; store: string; affiliateClickCount: number }>>([]);
  const [activeTab, setActiveTab] = useState<"puan" | "nakit">("nakit");

  useEffect(() => {
    fetch(`${BASE}api/points/tournament`).then(r => r.json()).then(setTournament).catch(() => {});
    fetch(`${BASE}api/earnings/pool`).then(r => r.json()).then(setPool).catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`${BASE}api/earnings/dashboard/${userId}`).then(r => r.json()).then(setEarnings).catch(() => {});
    fetch(`${BASE}api/earnings/withdrawals/${userId}`).then(r => r.json()).then(setWithdrawals).catch(() => {});
    fetch(`${BASE}api/points/my-products/${userId}`)
      .then(r => r.json()).then(d => setMyProducts(d.products || [])).catch(() => {});
  }, [userId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(emailInput);
    if (ok) toast({ title: "Hoş geldin! 🎉", description: "Puan kazanmaya başlayabilirsin." });
    else toast({ title: "Hata", description: "Kayıt olunamadı. Tekrar dene.", variant: "destructive" });
  };

  const handleBuyTickets = async () => {
    setIsBuying(true);
    const result = await buyRaffleTickets(ticketCount);
    setIsBuying(false);
    if (result?.success) toast({ title: `${ticketCount} bilet alındı! 🎟️`, description: `Yeni bakiye: ${result.newTotal} puan` });
    else toast({ title: "Hata", description: result?.error || "Bilet alınamadı.", variant: "destructive" });
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    try {
      const r = await fetch(`${BASE}api/earnings/withdraw`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, method: withdrawMethod, accountInfo: withdrawAccountInfo, accountName: withdrawAccountName }),
      });
      const data = await r.json();
      if (r.ok) {
        toast({ title: "Çekim talebi alındı! ✅", description: `${data.amount} TL talebiniz 3-5 iş günü içinde işleme alınacak.` });
        setShowWithdrawForm(false);
        fetch(`${BASE}api/earnings/dashboard/${userId}`).then(r => r.json()).then(setEarnings).catch(() => {});
        fetch(`${BASE}api/earnings/withdrawals/${userId}`).then(r => r.json()).then(setWithdrawals).catch(() => {});
      } else {
        toast({ title: "Hata", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Bağlantı hatası.", variant: "destructive" });
    }
    setIsWithdrawing(false);
  };

  const cost = ticketCount * 100;
  const canAfford = (balance?.totalPoints ?? 0) >= cost;
  const canWithdraw = (earnings?.totalWithdrawable ?? 0) >= 50 && !earnings?.hasPendingWithdrawal;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      <Helmet>
        <title>Cüzdanım — Fiyat Dedektifi</title>
        <meta name="description" content="Nakit kazancını ve dedektif puanlarını yönet." />
      </Helmet>

      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <WalletIcon className="w-6 h-6 text-emerald-500" />
          <h1 className="text-2xl font-display font-black">Cüzdanım</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-muted/40 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab("nakit")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "nakit" ? "bg-background shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"}`}
        >
          <CircleDollarSign className="w-4 h-4" /> Nakit Kazanç
        </button>
        <button
          onClick={() => setActiveTab("puan")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "puan" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Coins className="w-4 h-4" /> Dedektif Puanı
        </button>
      </div>

      {!userId ? (
        /* Not registered */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-3xl p-8 mb-6 text-center shadow-sm"
        >
          <div className="text-5xl mb-4">💰</div>
          <h2 className="text-xl font-display font-black mb-2">Ürün Ekle, Gerçek Para Kazan</h2>
          <p className="text-muted-foreground text-sm mb-3">
            Aylık reklam gelirinin <strong>%30'u</strong> ürün ekleyenlere tıklama oranında dağıtılır.<br />
            Minimum <strong>50 TL</strong> olunca IBAN veya Papara'na çekebilirsin.
          </p>
          {pool && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-3 mb-5 text-sm">
              <div className="font-bold text-emerald-700 dark:text-emerald-400">Bu ay havuzda: <span className="text-lg">{pool.poolAmount} TL</span></div>
              <div className="text-xs text-muted-foreground mt-1">{pool.totalUniqueClicks.toLocaleString()} tıklama · tıklama başı ≈ {pool.pricePerClick > 0 ? pool.pricePerClick.toFixed(2) : "—"} TL</div>
            </div>
          )}
          <form onSubmit={handleRegister} className="flex gap-2 max-w-sm mx-auto">
            <input type="email" required value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)); }}
              placeholder="e-posta@adresin.com"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background"
            />
            <Button type="submit" disabled={isRegistering || !isEmailValid} className="gap-1.5 font-bold rounded-xl">
              {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Başla"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">Şifre gerekmez. Spam yok.</p>
        </motion.div>
      ) : activeTab === "nakit" ? (
        /* === NAKIT KAZANÇ TAB === */
        <>
          {/* Current Month Earnings Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm opacity-80 mb-1">Bu Ay Tahmini Kazancın</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-display font-black">
                    {earnings?.currentMonth.estimatedTL.toFixed(2) ?? "0.00"}
                  </span>
                  <span className="text-xl opacity-70">TL</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70 mb-1">{earnings?.currentMonth.yearMonth ? formatYM(earnings.currentMonth.yearMonth) : ""}</div>
                <div className="text-2xl font-black">{earnings?.currentMonth.myClicks ?? 0}</div>
                <div className="text-xs opacity-70">tıklama</div>
              </div>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="opacity-80">Havuz toplamı</span>
                <span className="font-bold">{earnings?.currentMonth.poolAmount ?? 0} TL</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="opacity-80">Toplam platform tıklaması</span>
                <span className="font-bold">{(earnings?.currentMonth.totalPoolClicks ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="opacity-80">Tıklama başı ≈</span>
                <span className="font-bold">{(earnings?.currentMonth.pricePerClick ?? 0).toFixed(4)} TL</span>
              </div>
            </div>
          </motion.div>

          {/* Withdrawable Balance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border/60 rounded-3xl p-6 mb-6 shadow-sm"
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-emerald-500" />
              Çekilebilir Bakiye
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-display font-black text-emerald-600">
                  {(earnings?.totalWithdrawable ?? 0).toFixed(2)} TL
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {canWithdraw
                    ? "✅ Çekim yapabilirsin"
                    : earnings?.hasPendingWithdrawal
                    ? "⏳ Bekleyen çekim talebiniz var"
                    : `Minimum 50 TL gerekli (${(50 - (earnings?.totalWithdrawable ?? 0)).toFixed(2)} TL eksik)`
                  }
                </div>
              </div>
              <Button
                disabled={!canWithdraw}
                onClick={() => setShowWithdrawForm(v => !v)}
                className="gap-2 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Banknote className="w-4 h-4" /> Para Çek
              </Button>
            </div>

            {showWithdrawForm && (
              <form onSubmit={handleWithdraw} className="border-t border-border/40 pt-4 space-y-3">
                <div className="flex gap-2">
                  {(["papara", "iban"] as const).map(m => (
                    <button key={m} type="button" onClick={() => setWithdrawMethod(m)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${withdrawMethod === m ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "border-border/60 text-muted-foreground"}`}
                    >
                      {m === "papara" ? "Papara" : "IBAN"}
                    </button>
                  ))}
                </div>
                <input required value={withdrawAccountName} onChange={e => setWithdrawAccountName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm bg-background"
                />
                <input required value={withdrawAccountInfo} onChange={e => setWithdrawAccountInfo(e.target.value)}
                  placeholder={withdrawMethod === "iban" ? "TR00 0000 0000 0000 0000 0000 00" : "Papara hesap numarası / telefon"}
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm bg-background"
                />
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-3">
                  Talepler 3-5 iş günü içinde işleme alınır. Bilgilerinizin doğruluğundan emin olun.
                </div>
                <Button type="submit" disabled={isWithdrawing} className="w-full gap-2 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
                  {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> {(earnings?.totalWithdrawable ?? 0).toFixed(2)} TL Çekme Talebinde Bulun</>}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Withdrawal History */}
          {withdrawals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border/60 rounded-3xl p-6 mb-6 shadow-sm"
            >
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Çekim Geçmişi
              </h3>
              <div className="space-y-3">
                {withdrawals.map(w => (
                  <div key={w.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <div className="text-sm font-semibold">{w.amount.toFixed(2)} TL</div>
                      <div className="text-xs text-muted-foreground">{w.method === "iban" ? "IBAN" : "Papara"} · {new Date(w.requestedAt).toLocaleDateString("tr-TR")}</div>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Past Month Earnings */}
          {(earnings?.pastEarnings?.length ?? 0) > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card border border-border/60 rounded-3xl p-6 mb-6 shadow-sm"
            >
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                Geçmiş Aylar
              </h3>
              <div className="space-y-2">
                {earnings!.pastEarnings.map(e => (
                  <div key={e.yearMonth} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <div className="text-sm font-semibold">{formatYM(e.yearMonth)}</div>
                      <div className="text-xs text-muted-foreground">{e.totalClicks} tıklama</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{e.earningsAmount.toFixed(2)} TL</span>
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* My Products */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border/60 rounded-3xl p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-emerald-500" />
                Ürünlerim
              </h3>
              <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">{myProducts.length} ürün</span>
            </div>

            {myProducts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <LinkIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold mb-1">Henüz ürün eklemediniz</p>
                <p className="text-xs mb-4">Ürün URL'si ekleyin — her tıklama kazanç havuzunuza sayılır.</p>
                <Link href="/"><Button size="sm" variant="outline" className="gap-1.5 font-bold rounded-xl"><Package className="w-4 h-4" /> Ürün Ekle</Button></Link>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Eklediğiniz ürünlere her benzersiz tıklama aylık havuzdan payınızı artırır.
                </p>
                <div className="space-y-2">
                  {myProducts.map(p => (
                    <Link key={p.id} href={`/product/${p.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.store}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                            <MousePointerClick className="w-3.5 h-3.5" />{p.affiliateClickCount}
                          </div>
                          <div className="text-xs text-muted-foreground">tıklama</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/"><Button size="sm" variant="outline" className="w-full mt-3 gap-1.5 font-bold rounded-xl"><Package className="w-4 h-4" /> Yeni Ürün Ekle</Button></Link>
              </>
            )}
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-3xl p-6 shadow-sm"
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              Nasıl Çalışır?
            </h3>
            <div className="space-y-4 text-sm">
              {[
                { step: "1", title: "Ürün URL'si Ekle", desc: "Herhangi bir mağazadan ürün linki ekle." },
                { step: "2", title: "Tıklama Al", desc: "Kullanıcılar ürününe bakıp mağazaya gittiğinde tıklama sayacın artar." },
                { step: "3", title: "Havuzdan Pay Al", desc: "Ay sonunda platform gelirinin %30'u tüm katkıcılara tıklama oranında dağıtılır." },
                { step: "4", title: "Para Çek", desc: "50 TL birikince IBAN veya Papara'na çekebilirsin. 3-5 iş günü." },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{s.step}</div>
                  <div>
                    <div className="font-bold">{s.title}</div>
                    <div className="text-muted-foreground text-xs">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <strong>Formül:</strong> Kazancın = (Ürünlerine Gelen Tıklama ÷ Toplam Platform Tıklaması) × Aylık Havuz
            </div>
          </motion.div>
        </>
      ) : (
        /* === PUAN TAB === */
        <>
          {/* Tournament Banner */}
          {tournament && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-amber-200 dark:shadow-amber-900/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1"><Crown className="w-5 h-5" /><span className="text-sm font-bold opacity-90">Bu Haftanın Ödülü</span></div>
                  <h2 className="text-2xl font-display font-black mb-1">{tournament.prize}</h2>
                  <p className="text-sm opacity-80">{tournament.sponsor} sponsorluğunda</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs opacity-70 mb-1">Kalan süre</div>
                  <div className="text-sm font-bold"><Countdown endDate={tournament.endDate} /></div>
                  <div className="text-xs opacity-70 mt-1">{tournament.totalTickets} bilet satıldı</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Balance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-primary/20"
          >
            <p className="text-sm opacity-80 mb-1">Mevcut Bakiye</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-display font-black">{balance?.totalPoints ?? 0}</span>
              <span className="text-lg opacity-70">puan</span>
            </div>
            <div className="flex gap-4 text-sm">
              <div><div className="opacity-70">Bu hafta</div><div className="font-bold">+{balance?.weeklyPoints ?? 0} puan</div></div>
              <div><div className="opacity-70">Çekiliş bileti</div><div className="font-bold">{balance?.weeklyTickets ?? 0} bilet</div></div>
              <div className="ml-auto text-right"><div className="opacity-70 text-xs">Hesap</div><div className="font-semibold text-xs truncate max-w-[120px]">{email}</div></div>
            </div>
          </motion.div>

          {/* Raffle */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border/60 rounded-3xl p-6 mb-6 shadow-sm"
          >
            <h3 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-500" /> Çekilişe Katıl
            </h3>
            <p className="text-sm text-muted-foreground mb-4">1 bilet = 100 puan. Bilet sayısı arttıkça kazanma ihtimalin artar.</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-muted/30 rounded-xl p-1">
                <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="w-8 h-8 rounded-lg bg-background border border-border/60 font-bold hover:bg-muted transition-colors">-</button>
                <span className="w-8 text-center font-bold">{ticketCount}</span>
                <button onClick={() => setTicketCount(Math.min(10, ticketCount + 1))} className="w-8 h-8 rounded-lg bg-background border border-border/60 font-bold hover:bg-muted transition-colors">+</button>
              </div>
              <div className="text-sm text-muted-foreground">= <span className="font-bold text-foreground">{cost} puan</span></div>
              <Button onClick={handleBuyTickets} disabled={!canAfford || isBuying} className="ml-auto gap-2 font-bold rounded-xl">
                {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Ticket className="w-4 h-4" /> Bilet Al</>}
              </Button>
            </div>
            {!canAfford && <p className="text-xs text-red-500">Yetersiz puan. {cost - (balance?.totalPoints ?? 0)} puan daha kazanman gerekiyor.</p>}
          </motion.div>

          {/* Recent Activity */}
          {balance?.recentEvents && balance.recentEvents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card border border-border/60 rounded-3xl p-6 mb-6 shadow-sm"
            >
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" /> Son İşlemler
              </h3>
              <div className="space-y-3">
                {balance.recentEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm">{ev.description}</span>
                    <span className={`text-sm font-bold ${ev.points > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {ev.points > 0 ? "+" : ""}{ev.points} puan
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Leaderboard */}
          {tournament && tournament.topEarners.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-card border border-border/60 rounded-3xl p-6 mb-6 shadow-sm"
            >
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Bu Haftanın Liderleri
              </h3>
              <div className="space-y-2">
                {tournament.topEarners.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-muted">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{e.email}</span>
                    <span className="text-sm font-bold text-primary">{e.weeklyPoints} puan</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* How to earn */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm"
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Nasıl Puan Kazanılır?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EARN_WAYS.map((w) => (
                <div key={w.label} className={`flex items-center gap-3 p-3 rounded-2xl ${w.color.split(" ").slice(1).join(" ")}`}>
                  <w.icon className={`w-5 h-5 shrink-0 ${w.color.split(" ")[0]}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{w.label}</div>
                    <div className="text-xs text-muted-foreground">{w.pts} · {w.max}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
