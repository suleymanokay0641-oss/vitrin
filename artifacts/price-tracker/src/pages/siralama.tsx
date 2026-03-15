import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Trophy, Crown, Medal, TrendingUp, Clock, Users, Zap, Info, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL;
const REFRESH_MS = 5000;

interface RankEntry {
  rank: number;
  displayName: string;
  totalPoints: number;
  clickPoints: number;
  activityPoints: number;
  bonusPoints: number;
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
  topPoolShare: number;
  restPoolShare: number;
}

interface MyRank {
  rank: number | null;
  totalPoints: number;
  clickPoints: number;
  activityPoints: number;
  estimatedEarnings: number;
  inPool: boolean;
  inSecondPool: boolean;
  pointsToNextRank: number | null;
  nextRank: number | null;
  poolAmount: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
}

function rowBg(rank: number, isMe: boolean) {
  if (isMe) return "bg-primary/10 border-l-4 border-l-primary";
  if (rank <= 3) return "bg-amber-50/50 dark:bg-amber-950/20";
  if (rank <= 10) return "bg-green-50/30 dark:bg-green-950/10";
  return "";
}

export default function Siralama() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [userId] = useState(() => localStorage.getItem("fd-user-id"));
  const [page, setPage] = useState(1);
  const LIMIT = 100;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [listRes, myRes] = await Promise.all([
          fetch(`${BASE}api/rankings/live?limit=1000`).then(r => r.json()),
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

  const paged = entries.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages = Math.ceil(entries.length / LIMIT);

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Canlı Sıralama – Vitrin</title></Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Canlı Sıralama</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Her {REFRESH_MS / 1000} saniyede güncellenir
            </div>
          </div>
        </div>

        {meta && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Trophy, label: "Toplam Havuz", val: `${meta.poolAmount.toFixed(0)} TL`, color: "text-amber-500" },
              { icon: Users, label: "Katılımcı", val: meta.totalParticipants, color: "text-blue-500" },
              { icon: Clock, label: "Kalan Gün", val: meta.daysRemaining, color: "text-green-500" },
              { icon: Zap, label: "İlk 1000 Pay", val: `%${(meta.topPoolShare * 100).toFixed(0)}`, color: "text-purple-500" },
            ].map((s, i) => (
              <Card key={i} className="p-3 text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <div className="text-lg font-black">{s.val}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </Card>
            ))}
          </div>
        )}

        <Card className="mb-4 p-4 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 text-sm">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-muted-foreground">
              Sıralama <strong className="text-foreground">toplam puana</strong> göre belirlenir: tıklama puanı + aktivite puanı + bonus.{" "}
              <strong className="text-foreground">İlk 1000</strong> orantılı olarak %50'yi, <strong className="text-foreground">1001+</strong> eşit olarak %40'ı paylaşır.
            </div>
          </div>
        </Card>

        {myRank && (
          myRank.rank ? (
            <Card className={`mb-4 p-4 ${myRank.inPool ? "border-green-400 bg-green-50/60 dark:bg-green-950/20" : myRank.inSecondPool ? "border-blue-400 bg-blue-50/60 dark:bg-blue-950/20" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-black">Senin Sıran: #{myRank.rank}</div>
                  <div className="text-sm text-muted-foreground">{myRank.totalPoints} puan bu ay</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                    <span>🖱️ {myRank.clickPoints} tıklama</span>
                    <span>⚡ {myRank.activityPoints} aktivite</span>
                  </div>
                </div>
                <div className="text-right">
                  {myRank.inPool ? (
                    <>
                      <div className="text-green-700 dark:text-green-400 font-black text-xl">≈{myRank.estimatedEarnings.toFixed(2)} TL</div>
                      <div className="text-xs text-green-600">Ana havuzdasın ✓</div>
                    </>
                  ) : myRank.inSecondPool ? (
                    <>
                      <div className="text-blue-700 dark:text-blue-400 font-black text-xl">≈{myRank.estimatedEarnings.toFixed(2)} TL</div>
                      <div className="text-xs text-blue-600">Yedek havuzdasın</div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {myRank.pointsToNextRank ? `${myRank.pointsToNextRank} puan → #${myRank.nextRank}` : ""}
                    </div>
                  )}
                </div>
              </div>
              {myRank.pointsToNextRank && (
                <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {myRank.pointsToNextRank} puan daha kazan → #{myRank.nextRank}'e çık (ürün ekle, görev tamamla)
                </div>
              )}
            </Card>
          ) : (
            <Card className="mb-4 p-4 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                <div>
                  <div className="font-black">Henüz sıralamada değilsin</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Ürün ekle, vitrinini paylaş, günlük görevleri tamamla — her aktivite puan kazandırır!
                  </div>
                </div>
              </div>
            </Card>
          )
        )}

        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="divide-y divide-border/40">
            {paged.map((entry, i) => {
              const isMe = myRank?.rank === entry.rank;
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`flex items-center gap-3 px-4 py-3 ${rowBg(entry.rank, isMe)}`}
                >
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <RankBadge rank={entry.rank} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {entry.displayName}
                      {isMe && <span className="ml-1 text-xs text-primary font-bold">(sen)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>{entry.totalPoints} puan</span>
                      {entry.activityPoints > 0 && (
                        <span className="text-purple-500 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5" />{entry.activityPoints} aktivite
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {entry.inPool ? (
                      <div className="text-sm font-bold text-green-700 dark:text-green-400">≈{entry.estimatedEarnings.toFixed(2)} TL</div>
                    ) : entry.inSecondPool ? (
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Yedek havuz</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                    {entry.rank <= 1000 && <div className="text-[10px] text-green-500">Ana havuz</div>}
                    {entry.rank > 1000 && <div className="text-[10px] text-blue-400">Yedek havuz</div>}
                  </div>
                </motion.div>
              );
            })}

            {entries.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <div className="font-semibold">Henüz sıralama yok</div>
                <div className="text-sm mt-1">Ürün ekle, tıklama al, görev tamamla — puan kazan!</div>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
