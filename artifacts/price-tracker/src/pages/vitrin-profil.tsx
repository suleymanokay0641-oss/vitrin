import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useState, useCallback, useMemo } from "react";
import {
  Crown, Star, Flame, Users, Package, FolderOpen, ChevronRight,
  ExternalLink, UserPlus, UserCheck, Zap, Shield, Trash2, Loader2, Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VitrinData {
  user: {
    id: number; email: string; displayName: string | null; username: string;
    totalPoints: number; isChampion: boolean; loyaltyMonths: number; championMultiplier: number; createdAt: string;
  };
  isOwner: boolean;
  isFollowing: boolean;
  stats: {
    totalProducts: number; followerCount: number; followingCount: number;
    currentStreak: number; longestStreak: number;
    monthPoints: number; monthClickPoints: number; monthActivityPoints: number;
  };
  addedProducts: Array<{ id: number; name: string; brand: string | null; imageUrl: string | null; store: string | null; storeUrl: string | null; originalPrice?: number | null; displayPrice?: number | null; category: string | null; createdAt: string }>;
  collections: Array<{ id: number; title: string; slug: string; description: string | null; viewCount: number; updatedAt: string }>;
  champHistory: Array<{ id: number; yearMonth: string; finalRank: number; earnings: number }>;
}

export default function VitrinProfil({ username }: { username: string }) {
  const { user, getAuthHeader, accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Sayfa dışarıdan mı açıldı? (sosyal medya, arama motoru vb.)
  const isExternalVisitor = useMemo(() => {
    try {
      const ref = document.referrer;
      if (!ref) return false;
      const refHost = new URL(ref).hostname;
      return refHost !== window.location.hostname;
    } catch { return false; }
  }, []);

  const recordClick = useCallback((id: number) => {
    fetch(getApiUrl(`products/${id}/affiliate-click`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isExternal: isExternalVisitor }),
    }).catch(() => {});
  }, [isExternalVisitor]);

  const handleDelete = useCallback(async (id: number, name: string) => {
    if (!accessToken) { toast({ title: "Giriş gerekli", variant: "destructive" }); return; }
    if (!confirm(`"${name}" ürününü vitrininden kaldırmak istediğine emin misin?`)) return;
    setDeletingId(id);
    try {
      const apiBase = import.meta.env.BASE_URL;
      const r = await fetch(`${apiBase}api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || "Silinemedi"); }
      toast({ title: "Ürün silindi" });
      qc.invalidateQueries({ queryKey: ["vitrin", username] });
    } catch (err: any) {
      toast({ title: "Hata", description: err.message || "Silinemedi", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }, [accessToken, toast, qc, username]);

  const { data, isLoading, error } = useQuery<VitrinData>({
    queryKey: ["vitrin", username, user?.id],
    staleTime: 0,
    queryFn: async () => {
      const r = await fetch(getApiUrl(`vitrin/${username}`), { headers: getAuthHeader() });
      if (!r.ok) throw new Error("Vitrin bulunamadı");
      return r.json();
    },
  });

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const text = `${data?.user?.displayName || username} vitrinine bak!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Vitrin", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Bağlantı kopyalandı!", description: "Vitrin linki panoya kopyalandı." });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Bağlantı kopyalandı!" });
      } catch {
        toast({ title: "Kopyalanamadı", description: "Linki manuel kopyalayın: " + url, variant: "destructive" });
      }
    }
  }, [data, username, toast]);

  const followMut = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const isFollowing = data.isFollowing;
      const url = getApiUrl(`follows/${data.user.id}`);
      await fetch(url, { method: isFollowing ? "DELETE" : "POST", headers: { ...getAuthHeader(), "Content-Type": "application/json" } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vitrin", username] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-40 bg-muted rounded-2xl mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black mb-2">Vitrin Bulunamadı</h1>
        <p className="text-muted-foreground mb-6">@{username} kullanıcı adıyla bir vitrin yok</p>
        <Link href="/" className="text-primary font-bold hover:underline">Ana sayfaya dön</Link>
      </div>
    );
  }

  const { stats } = data;
  const loyaltyBonus = Math.min(data.user.loyaltyMonths * 2, 20);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Profil kartı */}
      <div className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-4xl font-black text-primary shrink-0">
            {(data.user.displayName || data.user.username).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black">{data.user.displayName || data.user.username}</h1>
              {data.user.isChampion && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-300 dark:border-amber-700">
                  <Crown className="w-3 h-3" /> Şampiyon
                </span>
              )}
              {loyaltyBonus > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  <Zap className="w-3 h-3" /> +{loyaltyBonus}% Sadakat
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-3">@{data.user.username}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span><strong>{stats.followerCount}</strong> takipçi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span><strong>{stats.followingCount}</strong> takip</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span><strong>{stats.currentStreak}</strong> günlük seri</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {!data.isOwner && user && (
              <button
                onClick={() => followMut.mutate()}
                disabled={followMut.isPending}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  data.isFollowing
                    ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {data.isFollowing ? <><UserCheck className="w-4 h-4" />Takiptesin</> : <><UserPlus className="w-4 h-4" />Takip Et</>}
              </button>
            )}
            {data.isOwner && (
              <Link href="/cuzdan" className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-muted hover:bg-muted/80 transition-colors">
                <Shield className="w-4 h-4" /> Cüzdanım
              </Link>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-muted hover:bg-muted/80 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Paylaş
            </button>
          </div>
        </div>
      </div>

      {/* Bu ay istatistikleri */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Aylık Puan", value: stats.monthPoints.toLocaleString("tr"), icon: Star, color: "text-primary" },
          { label: "Tıklama Puanı", value: stats.monthClickPoints.toLocaleString("tr"), icon: ExternalLink, color: "text-blue-500" },
          { label: "Aktivite Puanı", value: stats.monthActivityPoints.toLocaleString("tr"), icon: Zap, color: "text-amber-500" },
          { label: "Toplam Ürün", value: stats.totalProducts.toString(), icon: Package, color: "text-green-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
            <p className="text-xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Koleksiyonlar */}
      {data.collections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2"><FolderOpen className="w-5 h-5 text-primary" />Koleksiyonlar</h2>
            <Link href={`/koleksiyonlar/${data.user.username}`} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
              Tümü <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.collections.map(col => (
              <Link key={col.id} href={`/koleksiyon/${col.slug}`} className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{col.title}</h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
                {col.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{col.description}</p>}
                <p className="text-xs text-muted-foreground">{col.viewCount} görüntülenme</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Eklenen ürünler */}
      {data.addedProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Vitrine Eklenen Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {data.addedProducts.slice(0, 8).map(p => {
              const price = p.displayPrice ?? (p.originalPrice && p.originalPrice > 0 ? p.originalPrice : null);
              return (
                <div key={p.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all relative flex flex-col">
                  <a
                    href={p.storeUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => p.storeUrl && recordClick(p.id)}
                    className="block flex-1"
                    tabIndex={p.storeUrl ? 0 : -1}
                  >
                    {p.imageUrl ? (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted flex items-center justify-center text-3xl">🛍️</div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{p.name}</p>
                      {p.brand && <p className="text-xs text-muted-foreground mt-1">{p.brand}</p>}
                      {price && (
                        <p className="text-sm font-black text-primary mt-1">{price.toLocaleString("tr-TR")} ₺</p>
                      )}
                    </div>
                  </a>
                  {p.storeUrl && (
                    <a
                      href={p.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordClick(p.id)}
                      className="mx-3 mb-3 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Siteye Git
                    </a>
                  )}
                  {data.isOwner && (
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deletingId === p.id}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/40 transition-all opacity-0 group-hover:opacity-100"
                      title="Sil"
                    >
                      {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" /> : <Trash2 className="w-3.5 h-3.5 text-destructive" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Şampiyon geçmişi */}
      {data.champHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" />Şampiyon Geçmişi</h2>
          <div className="space-y-2">
            {data.champHistory.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className="font-bold">{h.yearMonth}</span>
                  <span className="text-muted-foreground text-sm">#{h.finalRank}. sıra</span>
                </div>
                <span className="font-black text-amber-700 dark:text-amber-400">{h.earnings.toFixed(2)} ₺</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.addedProducts.length === 0 && data.collections.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="font-semibold">Bu vitrin henüz boş</p>
          {data.isOwner && <Link href="/" className="text-primary font-bold hover:underline mt-2 block">İlk ürününü ekle</Link>}
        </div>
      )}
    </div>
  );
}
