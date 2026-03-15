import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Trash2, Plus, Mail, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL;

interface Alarm {
  id: number;
  targetPrice: number;
  email: string;
  token: string;
}

interface PriceAlarmProps {
  productId: number;
  currentPrice: number;
  lowestPrice: number;
}

const STORAGE_KEY = (id: number) => `fd-alarm-${id}`;

function getStoredAlarms(productId: number): Alarm[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(productId)) || "[]");
  } catch {
    return [];
  }
}

function saveStoredAlarms(productId: number, alarms: Alarm[]) {
  localStorage.setItem(STORAGE_KEY(productId), JSON.stringify(alarms));
}

export function PriceAlarm({ productId, currentPrice, lowestPrice }: PriceAlarmProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeRatio, setActiveRatio] = useState<number | null>(null);

  useEffect(() => {
    setAlarms(getStoredAlarms(productId));
  }, [productId]);

  // Önerilen hedef fiyat: en düşük fiyatın %5 altı veya mevcut fiyatın %10 altı
  const suggestedPrice = Math.floor(Math.min(currentPrice * 0.9, lowestPrice * 0.95));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const price = parseFloat(targetPrice.replace(",", "."));
    if (isNaN(price) || price <= 0) {
      setError("Geçerli bir fiyat girin");
      return;
    }
    if (!email.includes("@")) {
      setError("Geçerli bir e-posta adresi girin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/products/${productId}/alarms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, targetPrice: price }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Alarm kurulamadı");
      }

      const data = await res.json();
      const newAlarm: Alarm = { id: data.id, targetPrice: price, email, token: data.token };

      // Mevcut listede varsa güncelle, yoksa ekle
      const updated = [newAlarm, ...alarms.filter((a) => a.email !== email)];
      setAlarms(updated);
      saveStoredAlarms(productId, updated);

      setSuccess(true);
      setShowForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Alarm kurulamadı");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(alarm: Alarm) {
    try {
      await fetch(`${BASE}api/alarms/${alarm.id}?token=${alarm.token}`, {
        method: "DELETE",
      });
    } catch {
      // Silme başarısız olsa da local'den kaldır
    }
    const updated = alarms.filter((a) => a.id !== alarm.id);
    setAlarms(updated);
    saveStoredAlarms(productId, updated);
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Başlık */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/40">
            <Bell className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">Fiyat Alarmı</p>
            <p className="text-xs text-muted-foreground">Fiyat düşünce e-posta al</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Alarm Kur
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Aktif alarmlar */}
        {alarms.length > 0 && (
          <div className="space-y-2">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="flex items-center justify-between p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-violet-100 dark:bg-violet-900/50">
                    <Bell className="w-3.5 h-3.5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      ₺{alarm.targetPrice.toLocaleString("tr-TR")} altına düşünce
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {alarm.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(alarm)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Alarmı iptal et"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Başarı mesajı */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400"
            >
              <Check className="w-4 h-4 shrink-0" />
              <p className="text-sm font-medium">Alarm kuruldu! Fiyat düşünce e-posta gönderilecek.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <form onSubmit={handleCreate} className="space-y-3">
              {/* Hedef fiyat */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Hedef Fiyat (₺)
                </label>
                <div className="relative">
                  <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetPrice}
                    onChange={(e) => {
                      setTargetPrice(e.target.value);
                      setActiveRatio(null);
                    }}
                    placeholder={suggestedPrice.toLocaleString("tr-TR")}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                  />
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {[0.95, 0.9, 0.85, 0.8].map((ratio) => {
                    const suggested = Math.floor(currentPrice * ratio);
                    const pct = Math.round((1 - ratio) * 100);
                    const isActive = activeRatio === ratio;
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => {
                          setTargetPrice(suggested.toString());
                          setActiveRatio(ratio);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                          isActive
                            ? "bg-violet-600 text-white shadow-sm"
                            : "bg-muted hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300"
                        }`}
                      >
                        -%{pct}
                        <span className="ml-1 opacity-70">
                          ₺{suggested.toLocaleString("tr-TR")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  E-posta Adresiniz
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  {loading ? "Kuruluyor..." : "Alarm Kur"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="px-4 py-2.5 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  İptal
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                🔒 E-postanız yalnızca fiyat bildirimi için kullanılır, üçüncü taraflarla paylaşılmaz.
              </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alarm yoksa ve form kapalıysa boş durum */}
        {alarms.length === 0 && !showForm && !success && (
          <div className="text-center py-4">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-muted">
                <BellOff className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Henüz alarm kurulmamış.<br />
              Fiyat düşünce anında haberdar ol!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
            >
              <Bell className="w-4 h-4" />
              İlk Alarmı Kur
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
