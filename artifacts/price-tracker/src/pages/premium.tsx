import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Check, Crown, Zap, TrendingUp, Bell, Star, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL;

interface SubStatus {
  hasSub: boolean;
  plan: string;
  status: string;
  isPro: boolean;
  endDate: string | null;
  requestedAt: string | null;
}

export default function Premium() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [method, setMethod] = useState<"iban" | "papara">("papara");
  const [accountInfo, setAccountInfo] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const uid = localStorage.getItem("fd-user-id");
    setUserId(uid);
    if (uid) {
      fetch(`${BASE}api/subscriptions/my/${uid}`)
        .then(r => r.json()).then(setSubStatus).catch(() => {});
    }
  }, []);

  const handleSubscribe = async () => {
    if (!userId) {
      toast({ title: "Giriş yapmalısınız", variant: "destructive" });
      return;
    }
    if (!accountInfo.trim() || !accountName.trim()) {
      toast({ title: "Tüm alanları doldurun", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/subscriptions/request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parseInt(userId), paymentMethod: method, accountInfo: accountInfo.trim(), accountName: accountName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Talebiniz alındı!", description: data.message });
      setFormOpen(false);
      fetch(`${BASE}api/subscriptions/my/${userId}`).then(r => r.json()).then(setSubStatus);
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const proFeatures = [
    { icon: TrendingUp, text: "Sınırsız URL ekle ve aylık havuzdan pay al" },
    { icon: Bell, text: "Fiyat alarmları: sınırsız (ücretsizde 3)" },
    { icon: Star, text: "Vitrin sayfasında öne çıkan rozet" },
    { icon: Zap, text: "Fiyat güncelleme önceliği (2 saatte bir)" },
    { icon: Crown, text: "Reklam paneline erişim: kendi kampanyanı yönet" },
    { icon: Check, text: "Aylık kazanç raporları ve detaylı istatistik" },
  ];

  const freeFeatures = [
    { text: "10 URL ekle", ok: true },
    { text: "3 fiyat alarmı", ok: true },
    { text: "Havuzdan pay", ok: false },
    { text: "Vitrin sayfası", ok: false },
    { text: "Reklam paneli", ok: false },
    { text: "Öncelikli güncelleme", ok: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Pro Üyelik – Fiyat Dedektifi</title></Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="w-4 h-4" /> Pro Üyelik
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">URL ekle, aylık kazan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Platform reklam ve abonelik gelirinin yarısı, sayfa görüntülenmenize oranla havuzdan size dağıtılır.
          </p>
        </div>

        {subStatus?.isPro && (
          <div className="mb-8 p-6 rounded-2xl border-2 border-green-500 bg-green-50 dark:bg-green-950/20 text-center">
            <Crown className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-700 dark:text-green-400">Pro üyesiniz!</div>
            <div className="text-sm text-muted-foreground mt-1">
              Aboneliğiniz {subStatus.endDate ? new Date(subStatus.endDate).toLocaleDateString("tr-TR") : "süresiz"} tarihine kadar geçerli.
            </div>
          </div>
        )}

        {subStatus?.status === "pending" && (
          <div className="mb-8 p-6 rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-center">
            <div className="text-lg font-bold text-amber-700 dark:text-amber-400">Talebiniz inceleniyor</div>
            <div className="text-sm text-muted-foreground mt-1">
              Ödemeniz onaylandıktan sonra hesabınız aktive edilir (max 1 iş günü).
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 border-2 border-border">
            <div className="text-lg font-bold mb-1">Ücretsiz</div>
            <div className="text-3xl font-black mb-6">0 TL<span className="text-base font-normal text-muted-foreground">/ay</span></div>
            <div className="space-y-3">
              {freeFeatures.map((f, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm ${f.ok ? "" : "text-muted-foreground line-through"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${f.ok ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    {f.ok ? <Check className="w-3 h-3" /> : "×"}
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-amber-400 shadow-lg shadow-amber-100 dark:shadow-amber-900/20 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white">En Popüler</Badge>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-lg font-bold">Pro</div>
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black mb-6">49 TL<span className="text-base font-normal text-muted-foreground">/ay</span></div>
            <div className="space-y-3 mb-6">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <f.icon className="w-3 h-3" />
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
            {!subStatus?.isPro && subStatus?.status !== "pending" && (
              <Button onClick={() => setFormOpen(!formOpen)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                Pro'ya Geç – 49 TL/ay
              </Button>
            )}
          </Card>
        </div>

        {formOpen && (
          <Card className="p-6 border-2 border-amber-300 dark:border-amber-700">
            <h3 className="text-lg font-bold mb-1">Abonelik Talebi</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ödeme gönderdiniz mi? Bilgilerinizi girin, ekibimiz 1 iş günü içinde hesabınızı aktif eder.
            </p>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-semibold mb-3 block">Ödeme yöntemi</Label>
                <RadioGroup value={method} onValueChange={(v) => setMethod(v as any)} className="flex gap-4">
                  <div className="flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer flex-1 hover:border-amber-400 transition-colors" onClick={() => setMethod("papara")}>
                    <RadioGroupItem value="papara" id="papara" />
                    <Label htmlFor="papara" className="cursor-pointer flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-500" /> Papara
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer flex-1 hover:border-amber-400 transition-colors" onClick={() => setMethod("iban")}>
                    <RadioGroupItem value="iban" id="iban" />
                    <Label htmlFor="iban" className="cursor-pointer flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" /> IBAN
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-sm">
                <div className="font-semibold mb-2">Ödeme bilgileri</div>
                {method === "papara" ? (
                  <div className="space-y-1 text-muted-foreground">
                    <div>Papara Hesabı: <span className="font-mono font-bold text-foreground">1234567890</span></div>
                    <div>Ad: <span className="font-bold text-foreground">Fiyat Dedektifi</span></div>
                    <div>Tutar: <span className="font-bold text-foreground">49,00 TL</span></div>
                    <div className="text-xs mt-2 text-amber-600">Açıklama kısmına e-postanızı yazın</div>
                  </div>
                ) : (
                  <div className="space-y-1 text-muted-foreground">
                    <div>IBAN: <span className="font-mono font-bold text-foreground">TR00 0000 0000 0000 0000 0000 00</span></div>
                    <div>Ad: <span className="font-bold text-foreground">Fiyat Dedektifi A.Ş.</span></div>
                    <div>Tutar: <span className="font-bold text-foreground">49,00 TL</span></div>
                    <div className="text-xs mt-2 text-amber-600">Açıklama kısmına e-postanızı yazın</div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="accountName">Gönderici adı (ödeme yaptığınız hesap adı)</Label>
                <Input id="accountName" placeholder="Ad Soyad" value={accountName} onChange={e => setAccountName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="accountInfo">{method === "papara" ? "Papara numaranız veya e-postanız" : "IBAN'ınız"}</Label>
                <Input id="accountInfo" placeholder={method === "papara" ? "12345678 veya ornek@email.com" : "TR00 ..."} value={accountInfo} onChange={e => setAccountInfo(e.target.value)} className="mt-1" />
              </div>

              <Button onClick={handleSubscribe} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                {loading ? "Gönderiliyor..." : "Talebi Gönder"}
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Sorularınız için: <span className="font-semibold text-foreground">destek@fiyatdedektifi.com</span></p>
        </div>
      </div>
    </div>
  );
}
