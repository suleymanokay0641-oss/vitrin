import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, useColorScheme, TextInput, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

type AdminTab = "dashboard" | "users" | "withdrawals" | "pool";

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [poolInput, setPoolInput] = useState("");
  const [poolYearMonth, setPoolYearMonth] = useState(
    new Date().toISOString().slice(0, 7).replace("-", "")
  );

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` };

  const adminFetch = async (path: string) => {
    const r = await fetch(`${API_BASE}/admin/${path}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!r.ok) throw new Error("Admin erişim hatası");
    return r.json();
  };

  const { data: dash, isLoading: dashLoading, refetch: refetchDash, isRefetching: dashRefetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminFetch("dashboard"),
    enabled: !!accessToken,
  });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["admin-users", userSearch],
    queryFn: () => adminFetch(`users?search=${encodeURIComponent(userSearch)}`),
    enabled: !!accessToken && activeTab === "users",
  });

  const { data: withdrawalsData, isLoading: wdLoading, refetch: refetchWd } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: () => adminFetch("withdrawals"),
    enabled: !!accessToken && activeTab === "withdrawals",
  });

  const { data: poolData, refetch: refetchPool } = useQuery({
    queryKey: ["admin-pool"],
    queryFn: () => adminFetch("pool"),
    enabled: !!accessToken && activeTab === "pool",
  });

  const banMut = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "ban" | "unban" }) => {
      const r = await fetch(`${API_BASE}/admin/users/${id}/${action === "ban" ? "ban" : "unban"}`, {
        method: "POST", headers,
      });
      if (!r.ok) throw new Error("İşlem başarısız");
    },
    onSuccess: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });

  const wdMut = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      const r = await fetch(`${API_BASE}/admin/withdrawals/${id}/${action}`, { method: "POST", headers });
      if (!r.ok) throw new Error("İşlem başarısız");
    },
    onSuccess: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }); },
  });

  const poolMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/admin/pool/set`, {
        method: "POST", headers,
        body: JSON.stringify({ yearMonth: poolYearMonth, poolAmount: parseFloat(poolInput) }),
      });
      if (!r.ok) throw new Error("Havuz güncellenemedi");
    },
    onSuccess: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); refetchPool(); setPoolInput(""); },
  });

  if (!user || user.role !== "admin") {
    return (
      <View style={[styles.center, { backgroundColor: C.background, paddingTop: insets.top }]}>
        <Feather name="lock" size={48} color={C.textSecondary} />
        <Text style={[styles.emptyTitle, { color: C.text }]}>Erişim Yok</Text>
        <Text style={[styles.emptySub, { color: C.textSecondary }]}>Bu alan sadece yöneticilere açıktır.</Text>
        <Pressable style={[styles.backBtn, { backgroundColor: C.surface }]} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: C.text }]}>Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtnHeader}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: C.text }]}>Yönetim Paneli</Text>
          <Text style={[styles.headerSub, { color: Colors.primary }]}>@{user.displayName}</Text>
        </View>
        <View style={[styles.adminBadge, { backgroundColor: Colors.primary + "20" }]}>
          <Feather name="shield" size={14} color={Colors.primary} />
          <Text style={[styles.adminBadgeText, { color: Colors.primary }]}>Admin</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabBar, { borderBottomColor: C.border }]}>
        {([
          { key: "dashboard", label: "Özet", icon: "bar-chart-2" },
          { key: "users", label: "Kullanıcılar", icon: "users" },
          { key: "withdrawals", label: "Para Çekme", icon: "dollar-sign" },
          { key: "pool", label: "Havuz", icon: "layers" },
        ] as { key: AdminTab; label: string; icon: any }[]).map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tabItem, activeTab === t.key && { borderBottomColor: Colors.primary, borderBottomWidth: 2 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(t.key); }}
          >
            <Feather name={t.icon} size={15} color={activeTab === t.key ? Colors.primary : C.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === t.key ? Colors.primary : C.textSecondary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* İçerik */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={dashRefetching}
            onRefresh={() => { refetchDash(); refetchUsers(); refetchWd(); refetchPool(); }}
            tintColor={Colors.primary}
          />
        }
      >

        {/* ---- DASHBOARD ---- */}
        {activeTab === "dashboard" && (
          dashLoading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} size="large" /> : (
            <>
              <View style={styles.statsGrid}>
                {[
                  { label: "Toplam Kullanıcı", value: dash?.stats?.totalUsers, icon: "users", color: Colors.primary },
                  { label: "Toplam Ürün", value: dash?.stats?.totalProducts, icon: "package", color: "#3B82F6" },
                  { label: "Aktif Abonelik", value: dash?.stats?.activeSubs, icon: "star", color: "#F59E0B" },
                  { label: "Bekleyen Para Çekme", value: dash?.stats?.pendingWithdrawals, icon: "clock", color: "#EF4444" },
                  { label: "Bekleyen Şikayet", value: dash?.stats?.pendingComplaints, icon: "alert-triangle", color: "#F97316" },
                  { label: "Toplam Havuz (₺)", value: (dash?.stats?.totalRevenue || 0).toLocaleString("tr"), icon: "layers", color: "#10B981" },
                ].map(({ label, value, icon, color }) => (
                  <View key={label} style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
                    <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
                      <Feather name={icon as any} size={18} color={color} />
                    </View>
                    <Text style={[styles.statValue, { color: C.text }]}>{value ?? "—"}</Text>
                    <Text style={[styles.statLabel, { color: C.textSecondary }]}>{label}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { color: C.text, marginTop: 20 }]}>Son Kayıt Olan Kullanıcılar</Text>
              {dash?.recentUsers?.map((u: any) => (
                <View key={u.id} style={[styles.userRow, { backgroundColor: C.card, borderColor: C.border }]}>
                  <View style={[styles.userAvatar, { backgroundColor: Colors.primary + "20" }]}>
                    <Text style={[styles.avatarText, { color: Colors.primary }]}>
                      {(u.displayName || u.email || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: C.text }]}>{u.displayName || "—"}</Text>
                    <Text style={[styles.userEmail, { color: C.textSecondary }]}>{u.email}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: u.role === "admin" ? Colors.primary + "20" : C.surface }]}>
                    <Text style={[styles.roleText, { color: u.role === "admin" ? Colors.primary : C.textSecondary }]}>
                      {u.role}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )
        )}

        {/* ---- KULLANICILAR ---- */}
        {activeTab === "users" && (
          <>
            <View style={[styles.searchRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="search" size={16} color={C.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: C.text }]}
                placeholder="Email veya isim ara..."
                placeholderTextColor={C.textSecondary}
                value={userSearch}
                onChangeText={setUserSearch}
                returnKeyType="search"
                onSubmitEditing={() => refetchUsers()}
              />
              {userSearch.length > 0 && (
                <Pressable onPress={() => setUserSearch("")}>
                  <Feather name="x" size={16} color={C.textSecondary} />
                </Pressable>
              )}
            </View>

            {usersLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} size="large" />
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: C.text, marginBottom: 8 }]}>
                  {usersData?.total || 0} kullanıcı
                </Text>
                {usersData?.users?.map((u: any) => (
                  <View key={u.id} style={[styles.userRow, { backgroundColor: C.card, borderColor: C.border }]}>
                    <View style={[styles.userAvatar, { backgroundColor: Colors.primary + "20" }]}>
                      <Text style={[styles.avatarText, { color: Colors.primary }]}>
                        {(u.displayName || u.email || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.userName, { color: C.text }]}>{u.displayName || u.email}</Text>
                      <Text style={[styles.userEmail, { color: C.textSecondary }]}>
                        #{u.id} · {u.loyaltyMonths || 0} ay
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                      <View style={[styles.roleBadge, {
                        backgroundColor: u.role === "admin" ? Colors.primary + "20" : u.role === "banned" ? "#EF444420" : C.surface
                      }]}>
                        <Text style={[styles.roleText, {
                          color: u.role === "admin" ? Colors.primary : u.role === "banned" ? "#EF4444" : C.textSecondary
                        }]}>{u.role}</Text>
                      </View>
                      {u.role !== "admin" && (
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: u.role === "banned" ? "#10B98120" : "#EF444420" }]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            banMut.mutate({ id: u.id, action: u.role === "banned" ? "unban" : "ban" });
                          }}
                          disabled={banMut.isPending}
                        >
                          <Feather name={u.role === "banned" ? "unlock" : "slash"} size={13}
                            color={u.role === "banned" ? "#10B981" : "#EF4444"} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ---- PARA ÇEKME ---- */}
        {activeTab === "withdrawals" && (
          wdLoading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} size="large" /> : (
            <>
              <Text style={[styles.sectionTitle, { color: C.text, marginBottom: 8 }]}>
                Para Çekme Talepleri ({withdrawalsData?.withdrawals?.filter((w: any) => w.status === "pending").length || 0} bekliyor)
              </Text>
              {withdrawalsData?.withdrawals?.length === 0 && (
                <View style={styles.emptyState}>
                  <Feather name="check-circle" size={40} color={C.textSecondary} />
                  <Text style={[styles.emptySub, { color: C.textSecondary }]}>Bekleyen talep yok</Text>
                </View>
              )}
              {withdrawalsData?.withdrawals?.map((w: any) => (
                <View key={w.id} style={[styles.wdCard, { backgroundColor: C.card, borderColor: C.border }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={[styles.wdUser, { color: C.text }]}>{w.displayName || w.email}</Text>
                    <View style={[styles.roleBadge, {
                      backgroundColor: w.status === "pending" ? "#F59E0B20" : w.status === "approved" ? "#10B98120" : "#EF444420"
                    }]}>
                      <Text style={[styles.roleText, {
                        color: w.status === "pending" ? "#F59E0B" : w.status === "approved" ? "#10B981" : "#EF4444"
                      }]}>{w.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.wdAmount, { color: Colors.primary }]}>
                    ₺{Number(w.amount).toLocaleString("tr")}
                  </Text>
                  <Text style={[styles.wdMeta, { color: C.textSecondary }]}>
                    {w.method} · {w.accountInfo}
                  </Text>
                  {w.status === "pending" && (
                    <View style={styles.wdActions}>
                      <Pressable
                        style={[styles.wdBtn, { backgroundColor: "#10B98120", borderColor: "#10B98140" }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); wdMut.mutate({ id: w.id, action: "approve" }); }}
                        disabled={wdMut.isPending}
                      >
                        <Feather name="check" size={14} color="#10B981" />
                        <Text style={[styles.wdBtnText, { color: "#10B981" }]}>Onayla</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.wdBtn, { backgroundColor: "#EF444420", borderColor: "#EF444440" }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); wdMut.mutate({ id: w.id, action: "reject" }); }}
                        disabled={wdMut.isPending}
                      >
                        <Feather name="x" size={14} color="#EF4444" />
                        <Text style={[styles.wdBtnText, { color: "#EF4444" }]}>Reddet</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </>
          )
        )}

        {/* ---- HAVUZ ---- */}
        {activeTab === "pool" && (
          <>
            <Text style={[styles.sectionTitle, { color: C.text, marginBottom: 12 }]}>Aylık Kazanç Havuzu</Text>

            <View style={[styles.poolForm, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.poolLabel, { color: C.textSecondary }]}>Yıl-Ay (örn: 202603)</Text>
              <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Feather name="calendar" size={16} color={C.textSecondary} />
                <TextInput
                  style={[styles.poolInput, { color: C.text }]}
                  value={poolYearMonth}
                  onChangeText={setPoolYearMonth}
                  placeholder="202603"
                  placeholderTextColor={C.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <Text style={[styles.poolLabel, { color: C.textSecondary, marginTop: 10 }]}>Havuz Miktarı (₺)</Text>
              <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Feather name="layers" size={16} color={C.textSecondary} />
                <TextInput
                  style={[styles.poolInput, { color: C.text }]}
                  value={poolInput}
                  onChangeText={setPoolInput}
                  placeholder="10000"
                  placeholderTextColor={C.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <Pressable
                style={[styles.poolBtn, { backgroundColor: Colors.primary, opacity: poolMut.isPending || !poolInput ? 0.6 : 1 }]}
                onPress={() => poolMut.mutate()}
                disabled={poolMut.isPending || !poolInput}
              >
                {poolMut.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <><Feather name="save" size={16} color="#fff" /><Text style={styles.poolBtnText}>Havuzu Güncelle</Text></>
                }
              </Pressable>
              {poolMut.isSuccess && (
                <Text style={{ color: "#10B981", textAlign: "center", marginTop: 8, fontFamily: "Inter_500Medium" }}>
                  ✓ Havuz güncellendi
                </Text>
              )}
            </View>

            <Text style={[styles.sectionTitle, { color: C.text, marginTop: 20, marginBottom: 8 }]}>Geçmiş Havuzlar</Text>
            {poolData?.pools?.map((p: any) => (
              <View key={p.yearMonth} style={[styles.userRow, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={[styles.statIcon, { backgroundColor: Colors.primary + "15" }]}>
                  <Feather name="layers" size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.userName, { color: C.text }]}>
                    {String(p.yearMonth).slice(0, 4)}/{String(p.yearMonth).slice(4)}
                  </Text>
                  <Text style={[styles.userEmail, { color: C.textSecondary }]}>
                    %{p.poolPercent} dağıtım oranı
                  </Text>
                </View>
                <Text style={[styles.statValue, { color: Colors.primary }]}>
                  ₺{Number(p.poolAmount).toLocaleString("tr")}
                </Text>
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  backText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtnHeader: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 11, fontFamily: "Inter_500Medium" },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  adminBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  tabBar: { borderBottomWidth: 1, maxHeight: 50 },
  tabItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 14 },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  userAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  userName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  userEmail: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  actionBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  wdCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 4 },
  wdUser: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  wdAmount: { fontSize: 22, fontFamily: "Inter_700Bold" },
  wdMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  wdActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  wdBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10 },
  wdBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  poolForm: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  poolLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, marginTop: 4 },
  poolInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  poolBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, padding: 14, marginTop: 14 },
  poolBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 40 },
});
