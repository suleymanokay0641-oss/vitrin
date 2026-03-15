import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Star, MessageSquare, Send, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  tag: string | null;
  createdAt: string;
}

interface ReviewData {
  reviews: Review[];
  total: number;
  avgRating: number;
  ratingDist: { star: number; count: number }[];
}

const TAGS = [
  "Aldım, Gerçekti",
  "Aldım, Sorunlu Çıktı",
  "Fiyat Manipülasyonu Gördüm",
  "Güvenilir Satıcı",
  "Şüpheli Satıcı",
  "Harika Fırsat",
];

const TAG_COLORS: Record<string, string> = {
  "Aldım, Gerçekti": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  "Aldım, Sorunlu Çıktı": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  "Fiyat Manipülasyonu Gördüm": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  "Güvenilir Satıcı": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  "Şüpheli Satıcı": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Harika Fırsat": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn("transition-transform", !readonly && "hover:scale-110 cursor-pointer")}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
        >
          <Star
            className={cn(
              sz,
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

const BASE = import.meta.env.BASE_URL;
const INITIAL_SHOW = 3;

export function ReviewSection({ productId }: { productId: number }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}api/products/${productId}/reviews`);
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || comment.trim().length < 10) {
      toast({ title: "Eksik bilgi", description: "İsim, puan ve en az 10 karakter yorum gerekli.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: name, rating, comment, tag: selectedTag }),
      });
      if (res.ok) {
        toast({ title: "Yorum gönderildi!", description: "Tecrübenizi paylaştığınız için teşekkürler." });
        setName(""); setRating(0); setComment(""); setSelectedTag(null);
        setShowForm(false);
        fetchReviews();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Hata", description: err.error || "Yorum gönderilemedi.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const visibleReviews = showAll ? (data?.reviews || []) : (data?.reviews || []).slice(0, INITIAL_SHOW);

  return (
    <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold">Kullanıcı Yorumları</h3>
              {data && data.total > 0 ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating value={Math.round(data.avgRating)} readonly size="sm" />
                  <span className="text-sm font-bold text-foreground">{data.avgRating}</span>
                  <span className="text-xs text-muted-foreground">({data.total} yorum)</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">İlk yorumu sen yaz</p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            className="font-bold rounded-xl"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "İptal" : "Yorum Yaz"}
          </Button>
        </div>

        {/* Rating distribution */}
        {data && data.total > 0 && (
          <div className="mt-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const dist = data.ratingDist.find((r) => r.star === star);
              const count = dist?.count || 0;
              const pct = data.total > 0 ? (count / data.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4 text-right">{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-5">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 bg-muted/20 border-b border-border/40 space-y-4">
          <h4 className="font-bold text-base">Deneyiminizi paylaşın</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1.5">İsminiz</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız veya takma adınız"
                className="rounded-xl"
                maxLength={50}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1.5">Puanınız</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1.5">Hızlı Etiket (isteğe bağlı)</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    selectedTag === tag
                      ? `${TAG_COLORS[tag]} border-transparent`
                      : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1.5">Yorumunuz</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bu ürün hakkındaki deneyiminizi paylaşın... (en az 10 karakter)"
              className="w-full min-h-[100px] p-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{comment.length}/1000</p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="font-bold rounded-xl gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gönder
            </Button>
            <p className="text-xs text-muted-foreground self-center">
              Yorumunuz ürün deneyimlerine dayalı olmalıdır.
            </p>
          </div>
        </form>
      )}

      {/* Reviews list */}
      <div className="divide-y divide-border/40">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Yorumlar yükleniyor...</div>
        ) : visibleReviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Henüz yorum yok</p>
            <p className="text-xs text-muted-foreground mt-1">İlk yorumu yapan siz olun!</p>
          </div>
        ) : (
          visibleReviews.map((review) => (
            <div key={review.id} className="p-5 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm">{review.authorName}</span>
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.tag && (
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", TAG_COLORS[review.tag] || "bg-muted text-muted-foreground")}>
                      {review.tag}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pl-10">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Show more */}
      {data && data.total > INITIAL_SHOW && (
        <div className="p-4 border-t border-border/40">
          <Button
            variant="outline"
            className="w-full font-semibold rounded-xl gap-2"
            onClick={() => setShowAll(!showAll)}
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", showAll && "rotate-180")} />
            {showAll ? "Daha Az Göster" : `Tüm Yorumları Gör (${data.total - INITIAL_SHOW} yorum daha)`}
          </Button>
        </div>
      )}
    </div>
  );
}
