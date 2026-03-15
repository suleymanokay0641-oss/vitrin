import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield, Gift } from "lucide-react";
import { Link } from "wouter";

type Stage = "register" | "otp";

export default function Kayit() {
  const { register, verifyEmail } = useAuth();
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>("register");
  const [userId, setUserId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({ email: "", password: "", displayName: "", phone: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Şifre en az 8 karakter olmalı"); return; }
    setLoading(true);
    const result = await register({ email: form.email, password: form.password, displayName: form.displayName || undefined, phone: form.phone || undefined });
    setLoading(false);
    if (result.error) { setError(result.error); }
    else { setUserId(result.userId!); setStage("otp"); }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError("");
    setLoading(true);
    const result = await verifyEmail(userId, otp);
    setLoading(false);
    if (result.error) { setError(result.error); }
    else { setLocation("/"); }
  };

  if (stage === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-center mb-2">E-postanı Doğrula</h1>
            <p className="text-muted-foreground text-center text-sm mb-2">
              <strong>{form.email}</strong> adresine 6 haneli kod gönderdik
            </p>
            <p className="text-center text-xs text-muted-foreground mb-6">Gelen kutunu ve spam klasörünü kontrol et</p>
            <form onSubmit={handleOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center text-3xl font-mono font-black tracking-[0.5em] py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors bg-muted/20"
                autoFocus
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Doğrulanıyor..." : <><ArrowRight className="w-4 h-4" />Hesabı Etkinleştir</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <Gift className="w-4 h-4" />
            Kayıt ödülü: aylık havuzdan pay kazan!
          </div>
          <h1 className="text-3xl font-black mb-2">Vitrin'e Katıl</h1>
          <p className="text-muted-foreground">URL ekle, vitrinini büyüt, gelir kazan</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">İsim (Vitrin adın)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.displayName}
                  onChange={set("displayName")}
                  placeholder="Vitrin Kullanıcısı"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">E-posta <span className="text-destructive">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="ornek@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Telefon (isteğe bağlı)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+90 555 123 45 67"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Şifre <span className="text-destructive">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="En az 8 karakter"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${form.password.length > i * 3 ? i < 2 ? "bg-destructive" : i < 3 ? "bg-amber-500" : "bg-green-500" : "bg-muted"}`} />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? "Hesap oluşturuluyor..." : <><ArrowRight className="w-4 h-4" />Kayıt Ol — Ücretsiz</>}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Kayıt olarak{" "}
              <a href="#" className="underline">Kullanım Koşullarını</a>{" "}
              ve{" "}
              <a href="#" className="underline">Gizlilik Politikasını</a>{" "}
              kabul etmiş olursun.
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Zaten üye misin?{" "}
              <Link href="/giris" className="text-primary font-bold hover:underline">Giriş Yap</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
