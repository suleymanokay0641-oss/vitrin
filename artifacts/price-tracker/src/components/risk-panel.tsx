import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, ShieldAlert, TrendingUp, Clock, BarChart3 } from "lucide-react";

interface PriceEntry {
  price: number;
  recordedAt: string | Date;
  note?: string | null;
}

interface RiskPanelProps {
  currentPrice: number;
  originalPrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceHistory: PriceEntry[];
  store: string;
  discountPercent: number;
}

type RiskLevel = "low" | "medium" | "high";

interface RiskIndicator {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function daysBetween(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

export function RiskPanel({
  currentPrice,
  originalPrice,
  lowestPrice,
  highestPrice,
  priceHistory,
  store,
  discountPercent,
}: RiskPanelProps) {
  const indicators = useMemo<RiskIndicator[]>(() => {
    const now = new Date();
    const sorted = [...priceHistory].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
    const result: RiskIndicator[] = [];

    // --- 1. Fiyat şişirme tespiti ---
    if (sorted.length >= 3) {
      const last30 = sorted.filter((p) => daysBetween(new Date(p.recordedAt), now) <= 30);
      if (last30.length >= 2) {
        const maxLast30 = Math.max(...last30.map((p) => p.price));
        const priceBeforeDrop = last30.find((p) => p.price === maxLast30);
        const dropAfter = last30.filter(
          (p) =>
            new Date(p.recordedAt) > new Date(priceBeforeDrop!.recordedAt) &&
            p.price < maxLast30 * 0.95
        );
        if (dropAfter.length > 0 && maxLast30 > currentPrice * 1.05) {
          result.push({
            id: "price_inflation",
            level: "high",
            title: "Kampanya Öncesi Fiyat Artışı Tespit Edildi",
            description: `Son 30 gün içinde fiyat önce ₺${maxLast30.toLocaleString("tr-TR")} seviyesine çıkmış, ardından düşürülmüş. Bu klasik bir sahte indirim yöntemidir.`,
            icon: <TrendingUp className="w-4 h-4" />,
          });
        }
      }
    }

    // --- 2. İndirim oranı anomalisi ---
    if (discountPercent > 50) {
      result.push({
        id: "extreme_discount",
        level: "high",
        title: `%${discountPercent.toFixed(0)} İndirim Çok Yüksek`,
        description:
          "Bu kadar yüksek indirim oranları genellikle yapay fiyat şişirmesinin göstergesidir. İlan edilen eski fiyat gerçek olmayabilir.",
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    } else if (discountPercent > 30) {
      result.push({
        id: "high_discount",
        level: "medium",
        title: `%${discountPercent.toFixed(0)} İndirim Dikkat Gerektiriyor`,
        description:
          "Yüksek indirimler bazen gerçek fırsatları temsil eder, bazen de şişirilmiş eski fiyat üzerinden hesaplanır.",
        icon: <Info className="w-4 h-4" />,
      });
    }

    // --- 3. Fiyat en düşük seviyede mi ---
    const isAtOrNearLowest = currentPrice <= lowestPrice * 1.03;
    if (isAtOrNearLowest && sorted.length >= 5) {
      result.push({
        id: "at_low",
        level: "low",
        title: "Tüm Zamanların En Düşük Fiyatına Yakın",
        description: `Mevcut fiyat (₺${currentPrice.toLocaleString("tr-TR")}) kayıtlardaki en düşük fiyata (₺${lowestPrice.toLocaleString("tr-TR")}) çok yakın. Bu gerçek bir fırsat işareti.`,
        icon: <CheckCircle className="w-4 h-4" />,
      });
    }

    // --- 4. İlan edilen eski fiyat hiç uygulandı mı ---
    if (sorted.length >= 3) {
      const timesAtOriginal = sorted.filter(
        (p) => Math.abs(p.price - originalPrice) / originalPrice < 0.02
      ).length;
      if (timesAtOriginal <= 1 && discountPercent > 10) {
        result.push({
          id: "fake_original",
          level: "medium",
          title: "İlan Edilen Eski Fiyat Nadiren Uygulandı",
          description: `"İndirimli öncesi" fiyat olan ₺${originalPrice.toLocaleString("tr-TR")}, fiyat geçmişinde yalnızca ${timesAtOriginal} kez görülmüş. Bu fiyatın yapay olduğunu düşündürebilir.`,
          icon: <ShieldAlert className="w-4 h-4" />,
        });
      }
    }

    // --- 5. Fiyat değişim sıklığı ---
    if (sorted.length >= 2) {
      const last14 = sorted.filter((p) => daysBetween(new Date(p.recordedAt), now) <= 14);
      if (last14.length >= 4) {
        result.push({
          id: "volatile",
          level: "medium",
          title: "Son 14 Günde Sık Fiyat Değişimi",
          description: `Son iki haftada ${last14.length} fiyat değişikliği tespit edildi. Sık değişimler genellikle dinamik fiyatlandırma veya stok manipülasyonu işareti olabilir.`,
          icon: <BarChart3 className="w-4 h-4" />,
        });
      }
    }

    // --- 6. Veri yetersizliği ---
    if (sorted.length < 5) {
      result.push({
        id: "insufficient_data",
        level: "medium",
        title: "Analiz İçin Yeterli Veri Yok",
        description: `Bu ürünün yalnızca ${sorted.length} fiyat kaydı var. Kesin yorum yapabilmek için daha fazla geçmişe ihtiyaç var. Ürünü takibe alın, veriler birikin.`,
        icon: <Clock className="w-4 h-4" />,
      });
    }

    return result;
  }, [currentPrice, originalPrice, lowestPrice, discountPercent, priceHistory]);

  const highCount = indicators.filter((i) => i.level === "high").length;
  const mediumCount = indicators.filter((i) => i.level === "medium").length;

  const overallLevel: RiskLevel =
    highCount >= 1 ? "high" : mediumCount >= 2 ? "medium" : "low";

  const overallConfig = {
    low: {
      label: "Düşük Risk",
      sublabel: "Ürün geçmişi güvenilir görünüyor",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    },
    medium: {
      label: "Orta Risk",
      sublabel: "Dikkatli inceleme önerilir",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    },
    high: {
      label: "Yüksek Risk",
      sublabel: "Şüpheli göstergeler tespit edildi",
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    },
  }[overallLevel];

  const levelConfig = {
    low: { icon: <CheckCircle className="w-3.5 h-3.5" />, bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400", label: "Olumlu" },
    medium: { icon: <Info className="w-3.5 h-3.5" />, bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400", label: "Dikkat" },
    high: { icon: <AlertTriangle className="w-3.5 h-3.5" />, bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400", label: "Risk" },
  };

  return (
    <div className={cn("rounded-3xl border-2 p-6", overallConfig.bg, overallConfig.border)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", overallConfig.badge)}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className={cn("absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900", overallConfig.dot)} />
          </div>
          <div>
            <h3 className={cn("text-lg font-display font-black", overallConfig.text)}>
              Risk Göstergeleri
            </h3>
            <p className="text-sm text-muted-foreground">{overallConfig.sublabel}</p>
          </div>
        </div>
        <div className={cn("px-4 py-2 rounded-2xl text-sm font-black", overallConfig.badge)}>
          {overallLevel === "low" ? "🟢" : overallLevel === "medium" ? "🟡" : "🔴"} {overallConfig.label}
        </div>
      </div>

      {/* Risk bar */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-emerald-500 h-full rounded-l-full transition-all"
          style={{ width: `${indicators.filter((i) => i.level === "low").length / Math.max(indicators.length, 1) * 100}%` }}
        />
        <div
          className="bg-amber-400 h-full transition-all"
          style={{ width: `${indicators.filter((i) => i.level === "medium").length / Math.max(indicators.length, 1) * 100}%` }}
        />
        <div
          className="bg-red-500 h-full rounded-r-full transition-all"
          style={{ width: `${indicators.filter((i) => i.level === "high").length / Math.max(indicators.length, 1) * 100}%` }}
        />
      </div>

      {/* Indicators list */}
      <div className="space-y-3">
        {indicators.map((ind) => {
          const cfg = levelConfig[ind.level];
          return (
            <div
              key={ind.id}
              className="flex gap-3 p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-white/80 dark:border-white/5 backdrop-blur-sm"
            >
              <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.bg, cfg.text)}>
                {ind.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-sm text-foreground">{ind.title}</p>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", cfg.bg, cfg.text)}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{ind.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal disclaimer */}
      <p className="text-xs text-muted-foreground/70 mt-4 pt-4 border-t border-border/30 leading-relaxed">
        ⚠️ Bu göstergeler otomatik algoritmalar tarafından üretilmektedir ve kesin bilgi içermez.
        Satın alma kararı vermeden önce resmi kanalları ve satıcı bilgilerini doğrulayın.
      </p>
    </div>
  );
}
