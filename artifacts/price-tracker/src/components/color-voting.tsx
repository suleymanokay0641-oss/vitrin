import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getSessionId } from "@/lib/session";
import { Loader2, Users } from "lucide-react";

interface VoteSummary {
  total: number;
  green: number;
  yellow: number;
  red: number;
  greenPct: number;
  yellowPct: number;
  redPct: number;
}

const COLORS = [
  {
    key: "green" as const,
    emoji: "🟢",
    label: "Güvenilir",
    sublabel: "Ürün ve indirim güvenilir görünüyor",
    activeClass: "ring-4 ring-emerald-500/50 scale-110",
    bg: "bg-emerald-500",
    lightBg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-400",
    barColor: "bg-emerald-500",
  },
  {
    key: "yellow" as const,
    emoji: "🟡",
    label: "Şüpheli",
    sublabel: "Bazı göstergeler dikkat çekiyor",
    activeClass: "ring-4 ring-amber-400/50 scale-110",
    bg: "bg-amber-400",
    lightBg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-400",
    barColor: "bg-amber-400",
  },
  {
    key: "red" as const,
    emoji: "🔴",
    label: "Sorunlu",
    sublabel: "Sahte indirim veya ürün riski yüksek",
    activeClass: "ring-4 ring-red-500/50 scale-110",
    bg: "bg-red-500",
    lightBg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-400",
    barColor: "bg-red-500",
  },
];

const BASE = import.meta.env.BASE_URL;

export function ColorVoting({ productId }: { productId: number }) {
  const [votes, setVotes] = useState<VoteSummary | null>(null);
  const [myVote, setMyVote] = useState<"green" | "yellow" | "red" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const sessionId = getSessionId();
  const storageKey = `vote_${productId}`;

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}api/products/${productId}/votes`);
      if (res.ok) setVotes(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    // Restore previous vote from localStorage
    const saved = localStorage.getItem(storageKey) as typeof myVote;
    if (saved) setMyVote(saved);
    fetchVotes();
  }, [productId, fetchVotes]);

  const handleVote = async (color: "green" | "yellow" | "red") => {
    if (submitting) return;
    const prev = myVote;
    setMyVote(color);
    localStorage.setItem(storageKey, color);
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}api/products/${productId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color, sessionId }),
      });
      if (!res.ok) {
        setMyVote(prev);
        localStorage.removeItem(storageKey);
      } else {
        await fetchVotes();
      }
    } catch {
      setMyVote(prev);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold">Topluluk Değerlendirmesi</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? "Yükleniyor..." : votes ? `${votes.total} oy kullanıldı` : "Henüz oy yok"}
            </p>
          </div>
        </div>
        {submitting && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Color buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {COLORS.map((c) => {
          const isSelected = myVote === c.key;
          const count = votes ? votes[c.key] : 0;
          const pct = votes ? votes[`${c.key}Pct` as keyof VoteSummary] as number : 0;

          return (
            <button
              key={c.key}
              onClick={() => handleVote(c.key)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group",
                isSelected
                  ? `${c.lightBg} border-current ${c.text} ${c.activeClass}`
                  : "border-border/60 hover:border-border bg-muted/30 hover:bg-muted/60"
              )}
            >
              <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
                {c.emoji}
              </span>
              <span className={cn("text-sm font-bold", isSelected ? c.text : "text-foreground")}>
                {c.label}
              </span>
              {votes && (
                <span className={cn("text-xs font-semibold", isSelected ? c.text : "text-muted-foreground")}>
                  {count} oy · %{pct}
                </span>
              )}
              {isSelected && (
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", c.lightBg, c.text)}>
                  Oyunuz ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Vote bar */}
      {votes && votes.total > 0 && (
        <div className="space-y-2">
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {COLORS.map((c) => {
              const pct = votes[`${c.key}Pct` as keyof VoteSummary] as number;
              return pct > 0 ? (
                <div
                  key={c.key}
                  className={cn("h-full transition-all duration-500", c.barColor)}
                  style={{ width: `${pct}%` }}
                  title={`${c.label}: %${pct}`}
                />
              ) : null;
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {COLORS.map((c) => (
              <span key={c.key} className="flex items-center gap-1">
                <span>{c.emoji}</span>
                <span>%{votes[`${c.key}Pct` as keyof VoteSummary]}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!myVote && (
        <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-border/40">
          Bu ürün hakkındaki düşüncenizi renk seçerek paylaşın
        </p>
      )}
    </div>
  );
}
