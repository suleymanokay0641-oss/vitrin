import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, BarChart3, Bell, ShieldCheck, TrendingDown,
  CheckCircle, Building2, Loader2, Mail, Phone, Globe,
  Package, MessageSquare, ChevronRight, Zap, Users, Star
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Rakip Fiyat Takibi",
    desc: "Rakiplerinizin ürün fiyatları düştüğünde anında haberdar olun. Fiyat savaşında hep bir adım önde olun.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  {
    icon: Bell,
    title: "Anlık Bildirimler",
    desc: "E-posta veya webhook ile anında bildirim alın. Fiyat değişimlerini kaçırmayın.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: BarChart3,
    title: "Detaylı Raporlar",
    desc: "Haftalık ve aylık fiyat trend raporları. Hangi ürünlerde ne kadar kaybettiğinizi görün.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: ShieldCheck,
    title: "Pazar Analizi",
    desc: "Kategorinizdeki ortalama fiyat trendlerini takip edin. Doğru fiyatlama stratejisi kurun.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
];

const PLANS = [
  {
    name: "Başlangıç",
    price: "₺499",
    period: "/ay",
    features: ["50 ürün takibi", "E-posta bildirimleri", "Haftalık rapor", "5 rakip mağaza"],
    cta: "Başla",
    highlight: false,
  },
  {
    name: "Profesyonel",
    price: "₺1.499",
    period: "/ay",
    features: ["500 ürün takibi", "Anlık bildirimler", "Günlük rapor", "Sınırsız rakip", "Webhook entegrasyonu", "API erişimi"],
    cta: "En Popüler",
    highlight: true,
  },
  {
    name: "Kurumsal",
    price: "Özel",
    period: "fiyat",
    features: ["Sınırsız ürün", "Özel entegrasyon", "Dedicated destek", "SLA garantisi", "Özel raporlama", "Eğitim dahil"],
    cta: "Teklif Al",
    highlight: false,
  },
];

export default function Isletme() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    productCount: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}api/business/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hata oluştu");
      setSubmitted(true);
      toast({ title: "Talebiniz alındı!", description: "En kısa sürede size ulaşacağız." });
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Helmet>
        <title>İşletmeler İçin Fiyat Takibi — Fiyat Dedektifi</title>
        <meta name="description" content="Rakip fiyatlarını otomatik takip edin. Türkiye'nin en büyük e-ticaret sitelerindeki fiyat değişimlerini anında öğrenin." />
      </Helmet>

      {/* Hero */}
      <section className="w-full bg-gradient-to-br from-primary/5 via-background to-blue-500/5 border-b border-border/40 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20"
          >
            <Building2 className="w-4 h-4" />
            İşletmeler İçin
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-display font-black tracking-tight mb-4 leading-[1.1]"
          >
            Rakiplerinizi<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              her zaman takipte tutun.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Trendyol, Hepsiburada, Amazon TR ve diğer platformlardaki rakip fiyat değişimlerini otomatik takip edin. Fiyat savaşında asla geç kalmayın.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-10"
          >
            {[
              { icon: Users, text: "500+ aktif işletme" },
              { icon: Zap, text: "Anlık bildirim" },
              { icon: Star, text: "4.9/5 memnuniyet" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-semibold">{text}</span>
              </div>
            ))}
          </motion.div>

          <motion.a
            href="#form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl gap-2">
              Ücretsiz Demo Talep Et <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.a>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-black mb-3">Neler sunuyoruz?</h2>
          <p className="text-muted-foreground">İşletmenizin ihtiyaç duyduğu tüm fiyat istihbarat araçları</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/60 rounded-3xl p-7 flex gap-5"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center shrink-0 ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full bg-muted/20 border-y border-border/40 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-black mb-3">Fiyatlandırma</h2>
            <p className="text-muted-foreground">İşletmenizin büyüklüğüne uygun plan seçin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card rounded-3xl border-2 p-8 flex flex-col ${
                  plan.highlight
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border/60"
                }`}
              >
                {plan.highlight && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
                    En Popüler
                  </div>
                )}
                <h3 className="font-display font-black text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#form">
                  <Button
                    className="w-full font-bold rounded-xl"
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta === "En Popüler" ? "Hemen Başla" : plan.cta}
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="form" className="w-full max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-black mb-3">Demo Talep Et</h2>
          <p className="text-muted-foreground">Formu doldurun, size özel demo ayarlayalım. 24 saat içinde dönüş yapıyoruz.</p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border-2 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50 rounded-3xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-display font-black text-emerald-700 dark:text-emerald-300 mb-2">Talebiniz Alındı!</h3>
            <p className="text-emerald-600 dark:text-emerald-400">En kısa sürede ekibimiz sizi arayacak.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border/60 rounded-3xl p-8 space-y-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Şirket Adı <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="Şirketinizin adı"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Yetkili Adı <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                    placeholder="Ad Soyad"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                E-posta <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="ornek@sirket.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+90 5xx xxx xx xx"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Web Sitesi</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://sirketiniz.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Kaç ürün takip etmek istiyorsunuz?</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={form.productCount}
                  onChange={(e) => setForm((f) => ({ ...f, productCount: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background appearance-none"
                >
                  <option value="">Seçiniz</option>
                  <option value="1-50">1-50 ürün</option>
                  <option value="50-200">50-200 ürün</option>
                  <option value="200-1000">200-1.000 ürün</option>
                  <option value="1000+">1.000+ ürün</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Mesajınız</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Özel ihtiyaçlarınız veya sorularınız..."
                  rows={4}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-background resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-13 text-base font-bold rounded-2xl gap-2"
              disabled={isLoading || !form.companyName || !form.contactName || !form.email}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Demo Talep Et <ChevronRight className="w-5 h-5" /></>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Bilgileriniz üçüncü şahıslarla paylaşılmaz. 24 saat içinde dönüş yapılır.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
