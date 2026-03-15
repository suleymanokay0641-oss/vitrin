import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Megaphone, Plus, PauseCircle, PlayCircle, TrendingUp, Wallet, AlertCircle, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL;

const CATEGORIES = ["Elektronik", "Moda", "Giyim", "Ev & Yaşam", "Kitap", "Spor", "Kozmetik", "Oyuncak", "Gıda", "Otomobil", "Diğer"];

interface Balance {
  balance: number;
  totalSpent: number;
  totalLoaded: number;
  topups: { id: number; amount: number; method: string; accountName: string; status: string; requestedAt: string }[];
}

interface Campaign {
  id: number;
  name: string;
  title: string;
  description?: string;
  destinationUrl: string;
  status: string;
  budgetTotal: number;
  budgetRemaining: number;
  dailyBudget: number;
  costPerClick: number;
  totalClicks: number;
  totalImpressions: number;
  targetCategories: string[];
  targetKeywords: string[];
  createdAt: string;
}

export default function ReklamVer() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tab, setTab] = useState<"campaigns" | "new" | "topup">("campaigns");
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [form, setForm] = useState({ name: "", title: "", description: "", imageUrl: "", destinationUrl: "", budgetTotal: "", dailyBudget: "", costPerClick: "2", targetKeywords: "", placement: "all" });
  const [topupForm, setTopupForm] = useState({ amount: "", method: "papara", accountName: "" });

  const loadData = async (uid: string) => {
    const [bal, cams] = await Promise.all([
      fetch(`${BASE}api/ads/balance/${uid}`).then(r => r.json()),
      fetch(`${BASE}api/ads/campaigns/${uid}`).then(r => r.json()),
    ]);
    setBalance(bal);
    setCampaigns(Array.isArray(cams) ? cams : []);
  };

  useEffect(() => {
    const uid = localStorage.getItem("fd-user-id");
    setUserId(uid);
    if (uid) loadData(uid);
  }, []);

  const handleTopup = async () => {
    if (!userId) return toast({ title: "Giriş yapmalısınız", variant: "destructive" });
    if (!topupForm.amount || !topupForm.accountName) return toast({ title: "Tüm alanları doldurun", variant: "destructive" });
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/ads/topup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parseInt(userId), amount: parseFloat(topupForm.amount), method: topupForm.method, accountName: topupForm.accountName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Bakiye talebi alındı!", description: "Ödemeniz onaylandıktan sonra hesabınıza yüklenir." });
      setTopupForm({ amount: "", method: "papara", accountName: "" });
      loadData(userId);
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!userId) return toast({ title: "Giriş yapmalısınız", variant: "destructive" });
    if (!form.name || !form.title || !form.destinationUrl || !form.budgetTotal || !form.dailyBudget) {
      return toast({ title: "Zorunlu alanları doldurun", variant: "destructive" });
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/ads/campaigns`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId: parseInt(userId),
          name: form.name, title: form.title,
          description: form.description || undefined,
          imageUrl: form.imageUrl || undefined,
          destinationUrl: form.destinationUrl,
          budgetTotal: parseFloat(form.budgetTotal),
          dailyBudget: parseFloat(form.dailyBudget),
          costPerClick: parseFloat(form.costPerClick),
          targetCategories: selectedCategories,
          targetKeywords: form.targetKeywords.split(",").map(k => k.trim()).filter(Boolean),
          placement: form.placement,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Kampanya oluşturuldu!", description: "Reklamınız hemen yayınlanmaya başladı." });
      setForm({ name: "", title: "", description: "", imageUrl: "", destinationUrl: "", budgetTotal: "", dailyBudget: "", costPerClick: "2", targetKeywords: "", placement: "all" });
      setSelectedCategories([]);
      setTab("campaigns");
      loadData(userId);
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async (campaign: Campaign) => {
    if (!userId) return;
    await fetch(`${BASE}api/ads/campaigns/${campaign.id}/pause`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advertiserId: parseInt(userId) }),
    });
    loadData(userId);
  };

  const statusLabel = (s: string) => ({ active: "Yayında", paused: "Durduruldu", exhausted: "Bütçe Bitti", pending: "Beklemede" }[s] || s);
  const statusColor = (s: string) => ({ active: "bg-green-100 text-green-700", paused: "bg-yellow-100 text-yellow-700", exhausted: "bg-red-100 text-red-700", pending: "bg-gray-100 text-gray-700" }[s] || "bg-gray-100 text-gray-700");

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Giriş Yapmalısınız</h2>
          <p className="text-muted-foreground">Reklam paneline erişmek için hesabınıza giriş yapın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Reklam Ver – Fiyat Dedektifi</title></Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Reklam Paneli</h1>
            <p className="text-sm text-muted-foreground">Kendi kampanyanı kur, yönet, izle</p>
          </div>
        </div>

        {balance && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-black text-green-600">{balance.balance.toFixed(2)} TL</div>
              <div className="text-xs text-muted-foreground mt-1">Mevcut Bakiye</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-black text-blue-600">{balance.totalSpent.toFixed(2)} TL</div>
              <div className="text-xs text-muted-foreground mt-1">Toplam Harcama</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-black text-amber-600">{campaigns.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Kampanya Sayısı</div>
            </Card>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b pb-2">
          {[
            { key: "campaigns", label: "Kampanyalarım", icon: BarChart2 },
            { key: "new", label: "Yeni Kampanya", icon: Plus },
            { key: "topup", label: "Bakiye Yükle", icon: Wallet },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "campaigns" && (
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <div className="font-semibold mb-2">Henüz kampanyanız yok</div>
                <div className="text-sm mb-4">İlk kampanyanızı oluşturun ve hedef kitlenize ulaşın</div>
                <Button onClick={() => setTab("new")} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="w-4 h-4 mr-2" /> İlk Kampanyayı Oluştur
                </Button>
              </Card>
            ) : campaigns.map(c => (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold truncate">{c.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>{statusLabel(c.status)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{c.title}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 truncate mt-0.5">{c.destinationUrl}</div>

                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {[
                        { label: "Kalan Bütçe", val: `${c.budgetRemaining.toFixed(2)} TL` },
                        { label: "Tıklama", val: c.totalClicks },
                        { label: "Gösterim", val: c.totalImpressions },
                        { label: "TBM", val: `${c.costPerClick} TL` },
                      ].map((s, i) => (
                        <div key={i} className="bg-muted rounded-lg p-2 text-center">
                          <div className="font-bold text-sm">{s.val}</div>
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Bütçe kullanımı</span>
                        <span>{((c.budgetTotal - c.budgetRemaining) / c.budgetTotal * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((c.budgetTotal - c.budgetRemaining) / c.budgetTotal * 100)}%` }} />
                      </div>
                    </div>

                    {c.targetCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {c.targetCategories.map(cat => <span key={cat} className="text-xs bg-muted px-2 py-0.5 rounded-full">{cat}</span>)}
                      </div>
                    )}
                  </div>
                  {c.status !== "exhausted" && (
                    <Button variant="ghost" size="sm" onClick={() => handleTogglePause(c)} className="shrink-0">
                      {c.status === "active" ? <PauseCircle className="w-5 h-5 text-yellow-500" /> : <PlayCircle className="w-5 h-5 text-green-500" />}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "new" && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Yeni Kampanya Oluştur</h2>
            {balance && balance.balance < 100 && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Bakiyeniz yetersiz (min. 100 TL kampanya bütçesi gerekli). Önce bakiye yükleyin.
              </div>
            )}
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Kampanya adı *</Label>
                  <Input placeholder="Ör: Yaz Sezonu Kampanyası" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Reklam başlığı *</Label>
                  <Input placeholder="Kullanıcıların göreceği başlık" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Reklam açıklaması</Label>
                <Input placeholder="Kısa açıklama (opsiyonel)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Görsel URL (opsiyonel)</Label>
                  <Input placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Hedef URL *</Label>
                  <Input placeholder="https://siteniz.com" value={form.destinationUrl} onChange={e => setForm({ ...form, destinationUrl: e.target.value })} className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Hedef kategoriler</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${selectedCategories.includes(cat) ? "bg-blue-500 text-white border-blue-500" : "border-border hover:border-blue-400"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Anahtar kelimeler (virgülle ayırın)</Label>
                <Input placeholder="telefon, samsung, indirim" value={form.targetKeywords} onChange={e => setForm({ ...form, targetKeywords: e.target.value })} className="mt-1" />
              </div>

              <div>
                <Label className="mb-2 block">Yerleşim</Label>
                <RadioGroup value={form.placement} onValueChange={v => setForm({ ...form, placement: v })} className="flex gap-3 flex-wrap">
                  {[
                    { value: "all", label: "Her yer" },
                    { value: "search", label: "Arama sonuçları" },
                    { value: "product", label: "Ürün sayfaları" },
                    { value: "home", label: "Ana sayfa" },
                  ].map(p => (
                    <div key={p.value} className="flex items-center gap-2 border rounded-xl px-3 py-2">
                      <RadioGroupItem value={p.value} id={p.value} />
                      <Label htmlFor={p.value} className="cursor-pointer text-sm">{p.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Toplam bütçe (TL) *</Label>
                  <Input type="number" min="100" placeholder="500" value={form.budgetTotal} onChange={e => setForm({ ...form, budgetTotal: e.target.value })} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Min. 100 TL</p>
                </div>
                <div>
                  <Label>Günlük bütçe (TL) *</Label>
                  <Input type="number" min="10" placeholder="50" value={form.dailyBudget} onChange={e => setForm({ ...form, dailyBudget: e.target.value })} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Min. 10 TL</p>
                </div>
                <div>
                  <Label>Tıklama başı ücret (TL)</Label>
                  <Input type="number" min="0.5" step="0.5" placeholder="2" value={form.costPerClick} onChange={e => setForm({ ...form, costPerClick: e.target.value })} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Min. 0.5 TL</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-sm">
                <TrendingUp className="w-4 h-4 inline mr-2 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-400">Daha yüksek TBM, reklamınızın öne çıkma olasılığını artırır. Bakiyenizden anında düşülür.</span>
              </div>

              <Button onClick={handleCreateCampaign} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 text-base">
                {loading ? "Oluşturuluyor..." : "Kampanyayı Başlat"}
              </Button>
            </div>
          </Card>
        )}

        {tab === "topup" && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-2">Reklam Bakiyesi Yükle</h2>
            <p className="text-sm text-muted-foreground mb-6">Minimum yükleme 100 TL. Ödemeniz onaylandıktan sonra bakiyenize eklenir.</p>

            <div className="space-y-5">
              <div>
                <Label className="mb-3 block">Ödeme yöntemi</Label>
                <RadioGroup value={topupForm.method} onValueChange={v => setTopupForm({ ...topupForm, method: v })} className="flex gap-4">
                  {[{ value: "papara", label: "Papara" }, { value: "iban", label: "IBAN" }].map(m => (
                    <div key={m.value} className="flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer flex-1 hover:border-blue-400 transition-colors" onClick={() => setTopupForm({ ...topupForm, method: m.value })}>
                      <RadioGroupItem value={m.value} id={`t-${m.value}`} />
                      <Label htmlFor={`t-${m.value}`} className="cursor-pointer">{m.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-sm">
                <div className="font-semibold mb-2">Ödeme yapılacak hesap</div>
                {topupForm.method === "papara" ? (
                  <div className="space-y-1 text-muted-foreground">
                    <div>Papara: <span className="font-mono font-bold text-foreground">1234567890</span></div>
                    <div>Ad: <span className="font-bold text-foreground">Fiyat Dedektifi</span></div>
                    <div className="text-xs mt-1 text-blue-600">Açıklama: "Reklam bakiyesi – [e-postanız]"</div>
                  </div>
                ) : (
                  <div className="space-y-1 text-muted-foreground">
                    <div>IBAN: <span className="font-mono font-bold text-foreground">TR00 0000 0000 0000 0000 0000 00</span></div>
                    <div>Ad: <span className="font-bold text-foreground">Fiyat Dedektifi A.Ş.</span></div>
                    <div className="text-xs mt-1 text-blue-600">Açıklama: "Reklam bakiyesi – [e-postanız]"</div>
                  </div>
                )}
              </div>

              <div>
                <Label>Yüklenecek tutar (TL)</Label>
                <Input type="number" min="100" placeholder="500" value={topupForm.amount} onChange={e => setTopupForm({ ...topupForm, amount: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Gönderici hesap adı</Label>
                <Input placeholder="Ad Soyad / Şirket adı" value={topupForm.accountName} onChange={e => setTopupForm({ ...topupForm, accountName: e.target.value })} className="mt-1" />
              </div>

              <Button onClick={handleTopup} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold">
                {loading ? "Gönderiliyor..." : "Bakiye Talebini Gönder"}
              </Button>

              {balance && balance.topups.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mt-4 mb-2">Son talepler</div>
                  <div className="space-y-2">
                    {balance.topups.map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 bg-muted rounded-xl text-sm">
                        <span>{t.amount} TL – {t.accountName}</span>
                        <Badge variant={t.status === "approved" ? "default" : "secondary"}>
                          {t.status === "approved" ? "Onaylandı" : t.status === "pending" ? "Bekliyor" : "Reddedildi"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
