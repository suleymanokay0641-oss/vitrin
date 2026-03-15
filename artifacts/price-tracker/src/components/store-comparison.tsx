import { motion } from "framer-motion";
import { ShoppingCart, ExternalLink, TrendingDown, Trophy } from "lucide-react";

export interface StoreOffer {
  store: string;
  price: number;
  url: string;
}

interface StoreComparisonProps {
  offers: StoreOffer[];
}

const STORE_COLORS: Record<string, string> = {
  trendyol: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  hepsiburada: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  amazon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  mediamarkt: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  vatan: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  teknosa: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  n11: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

function getStoreColor(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(STORE_COLORS)) {
    if (lower.includes(key)) return STORE_COLORS[key];
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function getStoreInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function StoreComparison({ offers }: StoreComparisonProps) {
  if (!offers || offers.length === 0) return null;

  const sorted = [...offers].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const maxPrice = sorted[sorted.length - 1].price;
  const minPrice = sorted[0].price;
  const priceDiff = maxPrice - minPrice;

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-violet-50/60 to-transparent dark:from-violet-950/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <ShoppingCart className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Fiyat Karşılaştırma</h3>
            <p className="text-xs text-muted-foreground">{sorted.length} mağazada güncel fiyatlar</p>
          </div>
        </div>
        {priceDiff > 1 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>₺{priceDiff.toLocaleString("tr-TR")} fark</span>
          </div>
        )}
      </div>

      {/* Offers list */}
      <div className="divide-y">
        {sorted.map((offer, index) => {
          const isBest = index === 0;
          const barWidth = maxPrice > minPrice
            ? Math.max(20, 100 - ((offer.price - minPrice) / (maxPrice - minPrice)) * 60)
            : 100;

          return (
            <motion.div
              key={`${offer.store}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors group ${
                isBest ? "bg-emerald-50/50 dark:bg-emerald-950/10" : ""
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 text-center">
                {isBest ? (
                  <Trophy className="w-4 h-4 text-amber-500 mx-auto" />
                ) : (
                  <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                )}
              </div>

              {/* Store avatar */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${getStoreColor(offer.store)}`}
              >
                {getStoreInitial(offer.store)}
              </div>

              {/* Store info + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground truncate">{offer.store}</span>
                  {isBest && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex-shrink-0">
                      En Ucuz
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isBest ? "bg-emerald-500" : "bg-violet-400/70"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: index * 0.06 + 0.2, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Price + link */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-sm font-bold ${isBest ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                  ₺{offer.price.toLocaleString("tr-TR")}
                </span>
                {offer.url && (
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
                    title="Mağazada görüntüle"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer: best deal CTA */}
      {cheapest.url && (
        <div className="px-5 py-3 border-t bg-muted/20">
          <a
            href={cheapest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            En Ucuz Seçeneğe Git — ₺{cheapest.price.toLocaleString("tr-TR")}
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      )}
    </div>
  );
}
