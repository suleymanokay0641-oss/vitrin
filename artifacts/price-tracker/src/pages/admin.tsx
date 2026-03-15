import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  Users, Wallet, AlertTriangle, BarChart2, Megaphone, Settings,
  Check, X, Ban, RefreshCw, ChevronRight, TrendingUp, Package,
  Shield, Eye, Trash2, DollarSign, Search, ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/utils";
import { Link } from "wouter";

// ---- Types ----
interface AdminStats {
  totalUsers: number; totalProducts: number; pendingWithdrawals: number;
  pendingComplaints: number; totalRevenue: number; activeSubs: number; pendingCampaigns: number;
}
interface AdminUser {
  id: number; email: string; displayName: string | null; phone: string | null;
  role: string; emailVerified: boolean; loyaltyMonths: number; createdAt: string;
}
interface Withdrawal {
  id: number; userId: number; amount: number; method: string; accountInfo: string;
  accountName: string; status: string; createdAt: string; email: string; displayName: string;
}
interface Complaint {
  id: number; targetType: string; targetId: number; reason: string; description: string | null;
  status: string; createdAt: string; reporterEmail: string | null; reporterName: string | null;
  actionTaken: string | null;
}
interface Campaign {
  id: number; title: string; status: string; budget: number; spent: number;
  startDate: string; endDate: string; createdAt: string;
  advertiserEmail: string | null; advertiserName: string | null;
}

type Tab = "dashboard" | "users" | "withdrawals" | "complaints" | "campaigns" | "pool";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam", inappropriate: "Uygunsuz İçerik", fake: "Sahte/Yanıltıcı",
  copyright: "Telif Hakkı", other: "Diğer",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800",
  resolved: "bg-blue-100 text-blue-800", dismissed: "bg-gray-100 text-gray-600",
  banned: "bg-red-100 text-red-800", admin: "bg-purple-100 text-purple-800",
  user: "bg-gray-100 text-gray-600",
};

function apiFetch(path: string, token: string, opts?: RequestInit) {
  return fetch(getApiUrl(`admin${path}`), {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts?.headers || {}) },
  });
}

// ---- Stat Card ----
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [complaintFilter, setComplaintFilter] = useState("pending");
  const [rejectNote, setRejectNote] = useState<Record<number, string>>({});

  const isAdmin = user?.role === "admin";
  const token = accessToken || "";

  // ---- Queries ----
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => { const r = await apiFetch("/dashboard", token); return r.json(); },
    enabled: isAdmin && tab === "dashboard",
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", userPage, userSearch],
    queryFn: async () => {
      const r = await apiFetch(`/users?page=${userPage}&search=${encodeURIComponent(userSearch)}`, token);
      return r.json();
    },
    enabled: isAdmin && tab === "users",
  });

  const { data: withdrawalsData } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => { const r = await apiFetch("/withdrawals", token); return r.json(); },
    enabled: isAdmin && tab === "withdrawals",
  });

  const { data: complaintsData } = useQuery({
    queryKey: ["admin-complaints", complaintFilter],
    queryFn: async () => { const r = await apiFetch(`/complaints?status=${complaintFilter}`, token); return r.json(); },
    enabled: isAdmin && tab === "complaints",
  });

  const { data: campaignsData } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => { const r = await apiFetch("/campaigns", token); return r.json(); },
    enabled: isAdmin && tab === "campaigns",
  });

  const { data: poolData } = useQuery({
    queryKey: ["admin-pool"],
    queryFn: async () => { const r = await apiFetch("/pool", token); return r.json(); },
    enabled: isAdmin && tab === "pool",
  });

  // ---- Mutations ----
  const mutation = (path: string, method = "POST", key: string[]) => useMutation({
    mutationFn: async (body?: any) => {
      const r = await apiFetch(path, token, { method, body: body ? JSON.stringify(body) : undefined });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || "İşlem başarısız"); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Başarılı" }); },
    onError: (e: Error) => toast({ title: "Hata", description: e.message, variant: "destructive" }),
  });

  const banUser = mutation("", "POST", ["admin-users"]);
  const approveW = mutation("", "POST", ["admin-withdrawals"]);
  const rejectW = mutation("", "POST", ["admin-withdrawals"]);
  const resolveC = mutation("", "POST", ["admin-complaints", complaintFilter]);
  const dismissC = mutation("", "POST", ["admin-complaints", complaintFilter]);
  const approveCamp = mutation("", "POST", ["admin-campaigns"]);
  const rejectCamp = mutation("", "POST", ["admin-campaigns"]);

  // ---- Not Logged In / Not Admin ----
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Shield size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Giriş yapman gerekiyor.</p>
        <Link href="/giris"><Button className="mt-4">Giriş Yap</Button></Link>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Ban size={48} className="mx-auto text-red-300 mb-4" />
        <p className="text-gray-500 font-semibold">Erişim Reddedildi</p>
        <p className="text-sm text-gray-400 mt-1">Bu sayfa yalnızca yöneticilere açıktır.</p>
      </div>
    </div>
  );

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "users", label: "Kullanıcılar", icon: Users, badge: null },
    { id: "withdrawals", label: "Para Çekme", icon: Wallet, badge: dashboard?.stats?.pendingWithdrawals },
    { id: "complaints", label: "Şikayetler", icon: AlertTriangle, badge: dashboard?.stats?.pendingComplaints },
    { id: "campaigns", label: "Kampanyalar", icon: Megaphone, badge: dashboard?.stats?.pendingCampaigns },
    { id: "pool", label: "Havuz", icon: DollarSign },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Admin Paneli — Vitrin</title></Helmet>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-white border-r border-gray-100 p-4 flex flex-col gap-1 sticky top-0">
          <div className="flex items-center gap-2 px-3 py-3 mb-4">
            <Shield size={20} className="text-violet-600" />
            <span className="font-bold text-gray-800">Admin Panel</span>
          </div>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? "bg-violet-50 text-violet-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-2.5"><Icon size={16} />{label}</span>
              {badge ? <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span> : null}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 max-w-5xl">

          {/* ---- DASHBOARD ---- */}
          {tab === "dashboard" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard icon={Users} label="Toplam Kullanıcı" value={dashboard?.stats?.totalUsers ?? "—"} color="bg-violet-500" />
                <StatCard icon={Package} label="Toplam Ürün" value={dashboard?.stats?.totalProducts ?? "—"} color="bg-blue-500" />
                <StatCard icon={Wallet} label="Bekleyen Çekim" value={dashboard?.stats?.pendingWithdrawals ?? "—"} color="bg-amber-500" />
                <StatCard icon={AlertTriangle} label="Bekleyen Şikayet" value={dashboard?.stats?.pendingComplaints ?? "—"} color="bg-red-500" />
                <StatCard icon={TrendingUp} label="Pro Abonelik" value={dashboard?.stats?.activeSubs ?? "—"} color="bg-green-500" />
                <StatCard icon={Megaphone} label="Bekleyen Kampanya" value={dashboard?.stats?.pendingCampaigns ?? "—"} color="bg-pink-500" />
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-3">Son Kayıt Olan Kullanıcılar</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {dashboard?.recentUsers?.map((u: AdminUser) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{u.displayName || u.email}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                      <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString("tr")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- USERS ---- */}
          {tab === "users" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Kullanıcılar</h1>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="E-posta veya isim ara..." className="pl-9" value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {usersLoading ? <p className="text-center py-8 text-gray-400">Yükleniyor...</p> : usersData?.users?.map((u: AdminUser) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0 hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{u.displayName || "—"}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                      {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[u.role] || "bg-gray-100"}`}>{u.role}</span>
                      {!u.emailVerified && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">doğrulanmadı</span>}
                      {u.role !== "banned" ? (
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-8 px-2" title="Ban"
                          onClick={() => { if (confirm("Bu kullanıcıyı banla?")) apiFetch(`/users/${u.id}/ban`, token, { method: "POST" }).then(() => qc.invalidateQueries({ queryKey: ["admin-users"] })); }}>
                          <Ban size={15} />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-800 h-8 px-2" title="Ban Kaldır"
                          onClick={() => apiFetch(`/users/${u.id}/unban`, token, { method: "POST" }).then(() => qc.invalidateQueries({ queryKey: ["admin-users"] }))}>
                          <Check size={15} />
                        </Button>
                      )}
                      {u.role !== "admin" && (
                        <Button size="sm" variant="ghost" className="text-violet-600 h-8 px-2" title="Admin Yap"
                          onClick={() => { if (confirm("Bu kullanıcıyı admin yap?")) apiFetch(`/users/${u.id}/role`, token, { method: "POST", body: JSON.stringify({ role: "admin" }) }).then(() => qc.invalidateQueries({ queryKey: ["admin-users"] })); }}>
                          <Shield size={15} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {usersData && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">Toplam {usersData.total} kullanıcı · Sayfa {usersData.page}/{usersData.pages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}><ChevronLeft size={16} /></Button>
                    <Button variant="outline" size="sm" disabled={userPage >= usersData.pages} onClick={() => setUserPage(p => p + 1)}><ChevronRight size={16} /></Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- WITHDRAWALS ---- */}
          {tab === "withdrawals" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Para Çekme Talepleri</h1>
              <div className="space-y-3">
                {withdrawalsData?.withdrawals?.length === 0 && <p className="text-gray-400 text-center py-8">Talep yok</p>}
                {withdrawalsData?.withdrawals?.map((w: Withdrawal) => (
                  <div key={w.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{w.accountName}</p>
                        <p className="text-xs text-gray-500">{w.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {w.method.toUpperCase()}: <span className="font-mono">{w.accountInfo}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{w.amount?.toFixed(2)} ₺</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[w.status] || "bg-gray-100"}`}>{w.status}</span>
                      </div>
                    </div>
                    {w.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Input placeholder="Not (opsiyonel)" className="text-sm h-8" value={rejectNote[w.id] || ""}
                          onChange={e => setRejectNote(p => ({ ...p, [w.id]: e.target.value }))} />
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => apiFetch(`/withdrawals/${w.id}/approve`, token, { method: "POST", body: JSON.stringify({ note: rejectNote[w.id] }) }).then(() => qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }))}>
                          <Check size={14} className="mr-1" />Onayla
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => apiFetch(`/withdrawals/${w.id}/reject`, token, { method: "POST", body: JSON.stringify({ note: rejectNote[w.id] }) }).then(() => qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }))}>
                          <X size={14} className="mr-1" />Reddet
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{new Date(w.createdAt).toLocaleString("tr")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- COMPLAINTS ---- */}
          {tab === "complaints" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Şikayetler</h1>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  {["pending", "resolved", "dismissed"].map(s => (
                    <button key={s} onClick={() => setComplaintFilter(s)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${complaintFilter === s ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}>
                      {s === "pending" ? "Bekleyen" : s === "resolved" ? "Çözülen" : "Geçilen"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {complaintsData?.complaints?.length === 0 && <p className="text-gray-400 text-center py-8">Şikayet yok</p>}
                {complaintsData?.complaints?.map((c: Complaint) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">{c.targetType}</span>
                        <span className="text-xs text-gray-500">#{c.targetId}</span>
                        <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full">{REASON_LABELS[c.reason] || c.reason}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    </div>
                    {c.description && <p className="text-sm text-gray-700 mb-2 bg-gray-50 rounded-lg px-3 py-2">"{c.description}"</p>}
                    <p className="text-xs text-gray-400">
                      Şikayet eden: {c.reporterName || c.reporterEmail || "Anonim"} · {new Date(c.createdAt).toLocaleString("tr")}
                    </p>

                    {c.status === "pending" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-8"
                          onClick={() => apiFetch(`/complaints/${c.id}/resolve`, token, { method: "POST", body: JSON.stringify({ actionTaken: "none" }) }).then(() => qc.invalidateQueries({ queryKey: ["admin-complaints", complaintFilter] }))}>
                          <Check size={13} className="mr-1" />Çöz (Eylem Yok)
                        </Button>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white h-8"
                          onClick={() => apiFetch(`/complaints/${c.id}/resolve`, token, { method: "POST", body: JSON.stringify({ actionTaken: "removed" }) }).then(() => qc.invalidateQueries({ queryKey: ["admin-complaints", complaintFilter] }))}>
                          <Trash2 size={13} className="mr-1" />İçeriği Kaldır
                        </Button>
                        {c.targetType === "user" && (
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 h-8"
                            onClick={() => apiFetch(`/complaints/${c.id}/resolve`, token, { method: "POST", body: JSON.stringify({ actionTaken: "banned" }) }).then(() => qc.invalidateQueries({ queryKey: ["admin-complaints", complaintFilter] }))}>
                            <Ban size={13} className="mr-1" />Kullanıcıyı Banla
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-gray-500 h-8"
                          onClick={() => apiFetch(`/complaints/${c.id}/dismiss`, token, { method: "POST" }).then(() => qc.invalidateQueries({ queryKey: ["admin-complaints", complaintFilter] }))}>
                          <X size={13} className="mr-1" />Geç
                        </Button>
                      </div>
                    )}
                    {c.status !== "pending" && c.actionTaken && (
                      <p className="text-xs text-gray-400 mt-2">Eylem: <span className="font-medium">{c.actionTaken}</span></p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- CAMPAIGNS ---- */}
          {tab === "campaigns" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Reklam Kampanyaları</h1>
              <div className="space-y-3">
                {campaignsData?.campaigns?.length === 0 && <p className="text-gray-400 text-center py-8">Kampanya yok</p>}
                {campaignsData?.campaigns?.map((c: Campaign) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{c.title}</p>
                        <p className="text-xs text-gray-500">{c.advertiserName || c.advertiserEmail}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] || "bg-gray-100"}`}>{c.status}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 mb-3">
                      <span>Bütçe: <strong className="text-gray-700">{c.budget} ₺</strong></span>
                      <span>Harcanan: <strong className="text-gray-700">{c.spent} ₺</strong></span>
                      <span>{new Date(c.startDate).toLocaleDateString("tr")} → {new Date(c.endDate).toLocaleDateString("tr")}</span>
                    </div>
                    {c.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => apiFetch(`/campaigns/${c.id}/approve`, token, { method: "POST" }).then(() => qc.invalidateQueries({ queryKey: ["admin-campaigns"] }))}>
                          <Check size={14} className="mr-1" />Onayla
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600"
                          onClick={() => apiFetch(`/campaigns/${c.id}/reject`, token, { method: "POST" }).then(() => qc.invalidateQueries({ queryKey: ["admin-campaigns"] }))}>
                          <X size={14} className="mr-1" />Reddet
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- POOL ---- */}
          {tab === "pool" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Kazanç Havuzu</h1>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                <p className="font-bold text-gray-700 mb-3">Havuz Miktarı Güncelle</p>
                <form className="flex gap-3" onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as HTMLFormElement);
                  const r = await apiFetch("/pool/set", token, { method: "POST", body: JSON.stringify({ yearMonth: fd.get("ym"), poolAmount: fd.get("amount") }) });
                  if (r.ok) { qc.invalidateQueries({ queryKey: ["admin-pool"] }); toast({ title: "Havuz güncellendi" }); }
                }}>
                  <Input name="ym" placeholder="YYYY-MM (ör: 2026-03)" className="w-44" required />
                  <Input name="amount" type="number" placeholder="Tutar (₺)" className="w-32" required />
                  <Button type="submit">Kaydet</Button>
                </form>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 px-5 py-3 border-b bg-gray-50">
                  <span>Ay</span><span>Havuz</span><span>Yüzde</span>
                </div>
                {poolData?.pools?.map((p: any) => (
                  <div key={p.yearMonth} className="grid grid-cols-3 px-5 py-3 border-b last:border-0 text-sm">
                    <span className="font-medium text-gray-800">{p.yearMonth}</span>
                    <span className="text-gray-700">{p.poolAmount?.toLocaleString("tr")} ₺</span>
                    <span className="text-gray-500">%{p.poolPercent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
