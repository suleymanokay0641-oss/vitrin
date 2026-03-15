import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

interface AdData {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  destinationUrl: string;
  costPerClick: number;
}

interface AdSlotProps {
  placement?: string;
  keyword?: string;
  category?: string;
  className?: string;
}

export function AdSlot({ placement = "all", keyword, category, className = "" }: AdSlotProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [sessionId] = useState(() => localStorage.getItem("fd-session-id") || Math.random().toString(36).slice(2));

  useEffect(() => {
    const params = new URLSearchParams({ placement });
    if (keyword) params.set("keyword", keyword);
    if (category) params.set("category", category);
    fetch(`${BASE}api/ads/serve?${params}`)
      .then(r => r.json()).then(d => d && setAd(d)).catch(() => {});
  }, [placement, keyword, category]);

  if (!ad) return null;

  const handleClick = () => {
    fetch(`${BASE}api/ads/click/${ad.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
    window.open(ad.destinationUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer group border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 rounded-2xl overflow-hidden hover:border-amber-400 dark:hover:border-amber-600 transition-all ${className}`}
    >
      <div className="absolute top-2 right-2 z-10">
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
          Sponsorlu
        </span>
      </div>
      <div className="flex items-center gap-3 p-4">
        {ad.imageUrl && (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white flex items-center justify-center">
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">{ad.title}</div>
          {ad.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ad.description}</div>}
        </div>
        <ExternalLink className="w-4 h-4 text-amber-500 shrink-0" />
      </div>
    </div>
  );
}
