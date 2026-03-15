import { useState, useCallback, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { formatTRY } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Gamepad2,
  Trophy,
  RefreshCw,
  Share2,
  ArrowLeft,
  Target,
  Flame,
  ThumbsUp,
  Smile,
  Frown,
  ChevronRight,
  Loader2,
  Medal,
  Crown,
  User,
  Coins,
} from "lucide-react";
import { usePoints } from "@/hooks/use-points";

interface LeaderboardEntry {
  playerName: string;
  bestScore: number;
  totalRounds: number;
  avgScore?: number;
}
interface Leaderboard {
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  totalGames: number;
  weeklyReward?: string | null;
  weeklySponsor?: string | null;
}

const BASE = import.meta.env.BASE_URL;

interface Round {
  id: number;
  name: string;
  brand: string;
  category: string;
  imageUrl: string | null;
  hintRange: { low: number; high: number };
}

interface GuessResult {
  actualPrice: number;
  productName: string;
  score: number;
  accuracy: number;
  percentOff: number;
  level: "perfect" | "great" | "good" | "close" | "miss";
  guessedPrice: number;
}

const LEVEL_CONFIG = {
  perfect: {
    emoji: "🎯",
    label: "Mükemmel!",
    sublabel: "Akıllı alışverişçisin!",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800/50",
    icon: Target,
  },
  great: {
    emoji: "🔥",
    label: "Harika!",
    sublabel: "Piyasayı çok iyi takip ediyorsun!",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50",
    icon: Flame,
  },
  good: {
    emoji: "👍",
    label: "İyi!",
    sublabel: "Fena değil, devam et!",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50",
    icon: ThumbsUp,
  },
  close: {
    emoji: "😅",
    label: "Yaklaştın!",
    sublabel: "Biraz daha pratik yap.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50",
    icon: Smile,
  },
  miss: {
    emoji: "😬",
    label: "Uzak kaldın!",
    sublabel: "Fiyatları takip etmeye devam et.",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50",
    icon: Frown,
  },
};

function imgProxy(url: string | null | undefined): string | null {
  if (!url) return null;
  return `${BASE}api/img-proxy?url=${encodeURIComponent(url)}`;
}

function formatScore(score: number) {
  if (score >= 95) return "🎯";
  if (score >= 80) return "🔥";
  if (score >= 60) return "👍";
  if (score >= 40) return "😅";
  return "😬";
}

export default function Game() {
  const { toast } = useToast();
  const { userId, earnPoints } = usePoints();
  const [earnedThisRound, setEarnedThisRound] = useState<number>(0);
  const [round, setRound] = useState<Round | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [guess, setGuess] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>(() => localStorage.getItem("fd-game-player") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuessing, setIsGuessing] = useState(false);
  const [phase, setPhase] = useState<"start" | "playing" | "result">("start");
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [imgError, setImgError] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [lbTab, setLbTab] = useState<"weekly" | "allTime">("weekly");
  const playedIds = useRef<number[]>([]);

  useEffect(() => {
    fetch(`${BASE}api/game/leaderboard`)
      .then((r) => r.json())
      .then((d) => setLeaderboard(d))
      .catch(() => {});
  }, [phase]);

  const fetchRound = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    setGuess("");
    setImgError(false);
    try {
      const excludeParam = playedIds.current.join(",");
      const res = await fetch(`${BASE}api/game/round${excludeParam ? `?exclude=${excludeParam}` : ""}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ürün yüklenemedi");
      }
      const data: Round = await res.json();
      setRound(data);
      setPhase("playing");
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Ürün yüklenemedi",
        variant: "destructive",
      });
      setPhase("start");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const submitGuess = async () => {
    if (!round || !guess || parseFloat(guess) <= 0) return;
    const guessedPrice = parseFloat(guess.replace(/[^0-9.]/g, ""));
    if (isNaN(guessedPrice) || guessedPrice <= 0) return;

    setIsGuessing(true);
    try {
      if (playerName.trim()) {
        localStorage.setItem("fd-game-player", playerName.trim());
      }
      const res = await fetch(`${BASE}api/game/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: round.id, guessedPrice, playerName: playerName.trim() || "Anonim" }),
      });
      if (!res.ok) throw new Error("Tahmin gönderilemedi");
      const data: GuessResult = await res.json();
      setResult(data);
      setPhase("result");
      playedIds.current.push(round.id);
      setSessionScores((prev) => [...prev, data.score]);
      setEarnedThisRound(0);
      if (userId) {
        const pts = Math.max(1, Math.round(data.score / 10));
        const earned = await earnPoints("game", `game-${round.id}-${Date.now()}`, pts);
        if (earned.success) setEarnedThisRound(earned.pointsEarned);
      }
    } catch {
      toast({ title: "Hata", description: "Tahmin gönderilemedi", variant: "destructive" });
    } finally {
      setIsGuessing(false);
    }
  };

  const playAgain = () => {
    setRound(null);
    fetchRound();
  };

  const shareResult = () => {
    if (!result) return;
    const avg = sessionScores.length > 0
      ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
      : result.score;
    const text = `Fiyat Dedektifi'nde ${result.productName} için ${result.score}/100 puan aldım! ${formatScore(result.score)}\nOrtalam: ${avg}/100 (${sessionScores.length} tur)\nSen de dene 👉 fiyatdedektifi.com/oyun`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() =>
        toast({ title: "Panoya kopyalandı!", description: "Arkadaşlarınla paylaş." })
      );
    }
  };

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      <Helmet>
        <title>Fiyat Bilen Misin? — Fiyat Dedektifi</title>
        <meta name="description" content="Ürünün fiyatını tahmin et, piyasa bilgini test et!" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-black">Fiyat Bilen Misin?</h1>
        </div>
        {sessionScores.length > 0 && (
          <div className="ml-auto flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold">{avgScore}/100</span>
            <span className="text-xs text-muted-foreground">({sessionScores.length} tur)</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* START SCREEN */}
        {phase === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-3xl font-display font-black mb-3">Piyasayı Ne Kadar Biliyorsun?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Sana bir ürün göstereceğiz. Sen de mağazadaki güncel fiyatını tahmin edeceksin.
              Ne kadar yakın olursan o kadar çok puan!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto text-center">
              {[
                { emoji: "🎯", label: "95-100", desc: "Mükemmel" },
                { emoji: "🔥", label: "80-94", desc: "Harika" },
                { emoji: "👍", label: "60-79", desc: "İyi" },
              ].map((s) => (
                <div key={s.label} className="bg-muted/40 rounded-2xl p-3">
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Player name */}
            <div className="w-full max-w-xs mb-6">
              <label className="block text-sm font-semibold mb-2 text-muted-foreground">Liderlik tablosunda görünecek ismin</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Anonim"
                  maxLength={30}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background text-center"
                />
              </div>
            </div>

            <Button
              size="lg"
              className="gap-2 text-base font-bold px-8 h-14 rounded-2xl"
              onClick={fetchRound}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Gamepad2 className="w-5 h-5" />
              )}
              Oyunu Başlat
            </Button>

            {/* Leaderboard */}
            {leaderboard && (leaderboard.weekly.length > 0 || leaderboard.allTime.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md mt-10 bg-card border border-border/60 rounded-3xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Liderlik Tablosu
                  </h3>
                  {leaderboard.totalGames > 0 && (
                    <span className="text-xs text-muted-foreground">{leaderboard.totalGames} oyun oynandı</span>
                  )}
                </div>

                {/* Reward banner */}
                {leaderboard.weeklyReward && (
                  <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 rounded-2xl p-3 mb-4 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="text-sm">
                      <span className="font-bold text-amber-700 dark:text-amber-300">Bu hafta ödül:</span>
                      <span className="text-amber-600 dark:text-amber-400 ml-1">{leaderboard.weeklyReward}</span>
                      {leaderboard.weeklySponsor && (
                        <span className="text-amber-500 ml-1">— {leaderboard.weeklySponsor} sponsorluğunda</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-muted/30 p-1 rounded-xl">
                  {(["weekly", "allTime"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setLbTab(tab)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        lbTab === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {tab === "weekly" ? "Bu Hafta" : "Tüm Zamanlar"}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {(lbTab === "weekly" ? leaderboard.weekly : leaderboard.allTime).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        i === 0 ? "bg-amber-100 text-amber-700" :
                        i === 1 ? "bg-slate-100 text-slate-600" :
                        i === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold truncate">{entry.playerName}</span>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-primary">{entry.bestScore}/100</div>
                        <div className="text-xs text-muted-foreground">{entry.totalRounds} tur</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* PLAYING */}
        {phase === "playing" && round && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
          >
            {/* Product card */}
            <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
              {/* Image */}
              <div className="aspect-video bg-muted/20 flex items-center justify-center relative">
                {round.imageUrl && !imgError ? (
                  <img
                    src={imgProxy(round.imageUrl) ?? ""}
                    alt={round.name}
                    className="w-full h-full object-contain p-8"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="text-7xl">🛍️</div>
                )}
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold border border-border/60">
                  {round.category}
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold text-primary mb-1">{round.brand}</p>
                <h2 className="text-xl font-display font-black mb-4 leading-tight">{round.name}</h2>

                {/* Hint range */}
                <div className="bg-muted/30 rounded-xl p-3 mb-6 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">💡 İpucu: Fiyat aralığı</span>
                  <span className="font-bold text-sm ml-auto">
                    {formatTRY(round.hintRange.low)} — {formatTRY(round.hintRange.high)}
                  </span>
                </div>

                {/* Guess input */}
                <label className="block text-sm font-semibold mb-2">Fiyat Tahminin (₺)</label>
                <div className="relative mb-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">₺</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                    placeholder="örn: 12500"
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-border/60 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-background"
                    autoFocus
                  />
                </div>

                {/* Quick pick buttons */}
                <div className="flex gap-2 flex-wrap mb-6">
                  {[
                    round.hintRange.low,
                    Math.round((round.hintRange.low + round.hintRange.high) / 2 / 100) * 100,
                    round.hintRange.high,
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() => setGuess(String(v))}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border/60 hover:border-primary hover:text-primary transition-colors font-semibold"
                    >
                      {formatTRY(v)}
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full h-14 text-base font-bold rounded-2xl gap-2"
                  onClick={submitGuess}
                  disabled={!guess || parseFloat(guess) <= 0 || isGuessing}
                >
                  {isGuessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Tahminim Bu! <ChevronRight className="w-5 h-5" /></>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {phase === "result" && result && round && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {(() => {
              const cfg = LEVEL_CONFIG[result.level];
              return (
                <>
                  {/* Score card */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-3xl border-2 p-8 text-center ${cfg.bg}`}
                  >
                    <div className="text-7xl mb-3">{cfg.emoji}</div>
                    <h2 className={`text-3xl font-display font-black mb-1 ${cfg.color}`}>
                      {cfg.label}
                    </h2>
                    <p className="text-muted-foreground mb-6">{cfg.sublabel}</p>

                    {/* Big score */}
                    <div className="flex items-baseline justify-center gap-1 mb-6">
                      <motion.span
                        className={`text-7xl font-display font-black ${cfg.color}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      >
                        {result.score}
                      </motion.span>
                      <span className="text-2xl text-muted-foreground font-bold">/100</span>
                    </div>

                    {/* Score bar */}
                    <div className="h-3 bg-muted/50 rounded-full overflow-hidden mb-2">
                      <motion.div
                        className={`h-full rounded-full ${
                          result.score >= 80 ? "bg-emerald-500" :
                          result.score >= 60 ? "bg-blue-500" :
                          result.score >= 40 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gerçek fiyattan %{result.percentOff} {result.guessedPrice > result.actualPrice ? "yüksek" : "düşük"} tahmin ettin
                    </p>

                    {earnedThisRound > 0 && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="flex items-center justify-center gap-2 mt-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50"
                      >
                        <Coins className="w-5 h-5 text-amber-500" />
                        <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">
                          +{earnedThisRound} Dedektif Puanı kazandın!
                        </span>
                      </motion.div>
                    )}
                    {userId && earnedThisRound === 0 && (
                      <p className="text-xs text-center text-muted-foreground mt-2">Bu tur için puan zaten alındı.</p>
                    )}
                    {!userId && (
                      <Link href="/cuzdan">
                        <div className="flex items-center justify-center gap-2 mt-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                          <Coins className="w-5 h-5 text-amber-500" />
                          <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">
                            Puan kazanmak için kaydol →
                          </span>
                        </div>
                      </Link>
                    )}
                  </motion.div>

                  {/* Price comparison */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card border border-border/60 rounded-3xl p-6 space-y-4"
                  >
                    <h3 className="font-display font-bold text-lg">Karşılaştırma</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🤔</span>
                          <span className="text-sm font-medium">Senin tahminin</span>
                        </div>
                        <span className="font-bold text-lg">{formatTRY(result.guessedPrice)}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏷️</span>
                          <span className="text-sm font-medium">Gerçek fiyat</span>
                        </div>
                        <span className="font-bold text-lg text-primary">{formatTRY(result.actualPrice)}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl">
                        <span className="text-sm text-muted-foreground">Fark</span>
                        <span className={`font-bold ${
                          result.percentOff <= 5 ? "text-emerald-600" :
                          result.percentOff <= 15 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {formatTRY(Math.abs(result.guessedPrice - result.actualPrice))}
                          {" "}(%{result.percentOff})
                        </span>
                      </div>
                    </div>

                    {/* Session scores */}
                    {sessionScores.length > 1 && (
                      <div className="pt-3 border-t border-border/40">
                        <p className="text-xs text-muted-foreground mb-2">Bu oturum skoların</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {sessionScores.map((s, i) => (
                            <span
                              key={i}
                              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                s >= 80 ? "bg-emerald-100 text-emerald-700" :
                                s >= 60 ? "bg-blue-100 text-blue-700" :
                                s >= 40 ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                              }`}
                            >
                              {formatScore(s)} {s}
                            </span>
                          ))}
                          {avgScore !== null && (
                            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary ml-1">
                              Ort: {avgScore}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Action buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Button
                      variant="outline"
                      className="h-14 gap-2 font-bold rounded-2xl"
                      onClick={shareResult}
                    >
                      <Share2 className="w-4 h-4" />
                      Paylaş
                    </Button>
                    <Button
                      className="h-14 gap-2 font-bold rounded-2xl"
                      onClick={playAgain}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Bir Daha Oyna
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {/* Product link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center"
                  >
                    <Link
                      href={`/product/${round.id}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                    >
                      Bu ürünün fiyat geçmişini incele →
                    </Link>
                  </motion.div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
