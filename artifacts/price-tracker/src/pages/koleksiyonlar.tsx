import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Plus, FolderOpen, ChevronRight, Lock, Globe, Trash2, Edit3, X, Check } from "lucide-react";

interface Collection {
  id: number; title: string; slug: string; description: string | null;
  isPublic: boolean; viewCount: number; createdAt: string; updatedAt: string;
}

export default function Koleksiyonlar() {
  const { user, getAuthHeader } = useAuth();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPublic, setNewPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ["my-collections"],
    queryFn: async () => {
      if (!user) return [];
      const r = await fetch(getApiUrl(`collections/user/${user.id}`), { headers: getAuthHeader() });
      return r.json();
    },
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(getApiUrl("collections"), {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDesc || null, isPublic: newPublic }),
      });
      if (!r.ok) throw new Error("Koleksiyon oluşturulamadı");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-collections"] });
      setShowNew(false); setNewTitle(""); setNewDesc(""); setNewPublic(true);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(getApiUrl(`collections/${id}`), { method: "DELETE", headers: getAuthHeader() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-collections"] }),
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h1 className="text-2xl font-black mb-2">Koleksiyonlarım</h1>
        <p className="text-muted-foreground mb-6">Koleksiyonlarını görmek için giriş yapman gerekiyor</p>
        <Link href="/giris" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-primary" /> Koleksiyonlarım
        </h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? "İptal" : "Yeni Koleksiyon"}
        </button>
      </div>

      {showNew && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg">Yeni Koleksiyon</h2>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Koleksiyon başlığı"
            className="w-full px-4 py-3 border border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Açıklama (isteğe bağlı)"
            rows={2}
            className="w-full px-4 py-3 border border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setNewPublic(!newPublic)}
              className={`w-10 h-6 rounded-full transition-colors relative ${newPublic ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${newPublic ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm font-medium">{newPublic ? <><Globe className="inline w-4 h-4 text-green-500 mr-1" />Herkese açık</> : <><Lock className="inline w-4 h-4 text-muted-foreground mr-1" />Gizli</>}</span>
          </label>
          <button
            onClick={() => { if (newTitle.trim()) createMut.mutate(); }}
            disabled={!newTitle.trim() || createMut.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Oluştur
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-6xl mb-4">📁</div>
          <p className="font-semibold mb-2">Henüz koleksiyon yok</p>
          <p className="text-sm">Beğendiğin ürünleri koleksiyonlara ayır ve vitrininde sergile</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collections.map(col => (
            <div key={col.id} className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <Link href={`/koleksiyon/${col.slug}`} className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{col.title}</h3>
                </Link>
                <div className="flex items-center gap-1 ml-2">
                  {col.isPublic
                    ? <Globe className="w-4 h-4 text-green-500" title="Herkese açık" />
                    : <Lock className="w-4 h-4 text-muted-foreground" title="Gizli" />
                  }
                  <button
                    onClick={() => { if (confirm("Bu koleksiyonu silmek istiyor musun?")) deleteMut.mutate(col.id); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {col.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{col.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{col.viewCount} görüntülenme</span>
                <Link href={`/koleksiyon/${col.slug}`} className="flex items-center gap-1 text-xs text-primary font-bold hover:underline">
                  Aç <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
