import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { FolderOpen, Globe, Lock, Eye, ChevronLeft, Package, Trash2, ExternalLink } from "lucide-react";

interface CollectionDetail {
  id: number; title: string; slug: string; description: string | null;
  isPublic: boolean; viewCount: number; createdAt: string; updatedAt: string;
  owner: { id: number; displayName: string | null };
  items: Array<{
    id: number; sortOrder: number; addedAt: string;
    product: { id: number; name: string; brand: string | null; imageUrl: string | null; store: string | null; storeUrl: string | null };
  }>;
}

export default function KoleksiyonDetay({ slug }: { slug: string }) {
  const { user, getAuthHeader } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<CollectionDetail>({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const r = await fetch(getApiUrl(`collections/${slug}`), { headers: getAuthHeader() });
      if (!r.ok) throw new Error("Koleksiyon bulunamadı");
      return r.json();
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: number) => {
      if (!data) return;
      await fetch(getApiUrl(`collections/${data.id}/items/${itemId}`), { method: "DELETE", headers: getAuthHeader() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collection", slug] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h1 className="text-2xl font-black mb-2">Koleksiyon Bulunamadı</h1>
        <Link href="/" className="text-primary font-bold hover:underline">Ana sayfaya dön</Link>
      </div>
    );
  }

  const isOwner = user?.id === data.owner.id;
  const ownerName = data.owner.displayName || "Kullanıcı";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link href={isOwner ? "/koleksiyonlar" : "/"} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />
        {isOwner ? "Koleksiyonlarım" : "Geri dön"}
      </Link>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">{data.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {data.isPublic ? <><Globe className="w-3.5 h-3.5 text-green-500" />Herkese açık</> : <><Lock className="w-3.5 h-3.5" />Gizli</>}
                </span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{data.viewCount} görüntülenme</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{data.items.length} ürün</span>
              </div>
            </div>
          </div>
        </div>
        {data.description && <p className="mt-4 text-muted-foreground">{data.description}</p>}
        <p className="mt-2 text-sm text-muted-foreground">
          Oluşturan:{" "}
          <Link href={`/vitrin/${ownerName.toLowerCase()}`} className="text-primary font-bold hover:underline">@{ownerName}</Link>
        </p>
      </div>

      {data.items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-6xl mb-4">📦</div>
          <p className="font-semibold">Bu koleksiyonda henüz ürün yok</p>
          {isOwner && <p className="text-sm mt-1">Ürün sayfalarından bu koleksiyona ekleyebilirsin</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data.items.map(item => (
            <div key={item.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all">
              {item.product.imageUrl ? (
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {isOwner && (
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center text-4xl relative">
                  🛍️
                  {isOwner && (
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
              <div className="p-3">
                <Link href={`/product/${item.product.id}`} className="text-sm font-semibold line-clamp-2 leading-tight hover:text-primary transition-colors">
                  {item.product.name}
                </Link>
                {item.product.brand && <p className="text-xs text-muted-foreground mt-1">{item.product.brand}</p>}
                {item.product.storeUrl && (
                  <a href={item.product.storeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" />{item.product.store || "Mağaza"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
