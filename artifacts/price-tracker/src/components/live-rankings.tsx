import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Trophy, TrendingUp, Crown, Medal, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL;
const REFRESH_MS = 6000;

interface RankEntry {
  rank: number;
  displayName: string;
  totalClicks: number;
  estimatedEarnings: number;
  inPool: boolean;
  inSecondPool: boolean;
}

interface Meta {
  yearMonth: string;
  poolAmount: number;
  totalParticipants: number;
  topPoolSlots: number;
  daysRemaining: number;
}

interface MyRank {
  rank: number | null;
  totalClicks: number;
  estimatedEarnings: number;
  inPool: boolean;
  inSecondPool: boolean;
  clicksToNextRank: number | null;
  nextRank: number | null;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
  return <span className="text-xs font-bold text-muted-foreground w-4 text-center">#{rank}</span>;
}

export function LiveRankings({ userId }: { userId: string | null }) {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [myRank, setMyRank] = useState<MyRank | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [listRes, myRes] = await Promise.all([
          fetch(`${BASE}api/rankings/live?limit=10`).then(r => r.json()),
          userId ? fetch(`${BASE}api/rankings/my/${userId}`).then(r => r.json()) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        if (listRes?.ranked) setEntries(listRes.ranked);
        if (listRes?.meta) setMeta(listRes.meta);
        if (myRes) setMyRank(myRes);
      } catch {}
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => { mounted = false; clearInterval(t); };
  }, [userId]);

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-sm">Canlı Sıralama</span>
          <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            canlı
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {meta && <span>{meta.daysRemaining} gün kaldı</span>}
          <Link href="/siralama" className="flex items-center gap-0.5 text-primary hover:underline font-medium">
            Tümü <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {myRank?.rank && (
        <div className={`px-4 py-2.5 border-b border-border/50 text-sm flex items-center justify-between ${myRank.inPool ? "bg-green-50/60 dark:bg-green-950/20" : myRank.inSecondPool ? "bg-blue-50/60 dark:bg-blue-950/20" : "bg-muted/30"}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${myRank.inPool ? "text-green-600" : myRank.inSecondPool ? "text-blue-600" : "text-muted-foreground"}`} />
            <span className="font-bold">Sen #{myRank.rank}</span>
            <span className="text-muted-foreground">• {myRank.totalClicks} tıklama</span>
          </div>
          <div className="text-right">
            {myRank.inPool ? (
              <span className="text-green-700 dark:text-green-400 font-bold text-xs">≈{myRank.estimatedEarnings.toFixed(2)} TL kazanıyorsun</span>
            ) : myRank.inSecondPool ? (
              <span className="text-blue-700 dark:text-blue-400 font-bold text-xs">Yedek havuzdasın</span>
            ) : myRank.clicksToNextRank ? (
              <span className="text-xs text-muted-foreground">{myRank.clicksToNextRank} tıklama → #{myRank.nextRank}</span>
            ) : null}
          </div>
        </div>
      )}

      <div className="divide-y divide-border/30">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.displayName}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
            >
              <div className="w-5 flex items-center justify-center shrink-0">
                <RankBadge rank={entry.rank} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{entry.displayName}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-foreground">{entry.totalClicks} tık</div>
                {entry.inPool && <div className="text-[10px] text-green-600 dark:text-green-400">≈{entry.estimatedEarnings.toFixed(1)} TL</div>}
                {entry.inSecondPool && <div className="text-[10px] text-blue-500">Yedek havuz</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {meta && (
        <div className="px-4 py-2 border-t border-border/50 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{meta.totalParticipants} katılımcı</span>
          <span>Havuz: <strong className="text-foreground">{meta.poolAmount.toFixed(0)} TL</strong></span>
        </div>
      )}
    </div>
  );
}
