import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
  useColorScheme, Alert, TextInput, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

interface EarningsDashboard {
  userId: number;
  currentMonth: {
    yearMonth: string;
    myClicks: number;
    estimatedTL: number;
    poolAmount: number;
    totalPoolClicks: number;
    pricePerClick: number;
  };
  totalWithdrawable: number;
  hasPendingWithdrawal: boolean;
  pastEarnings: Array<{
    yearMonth: string;
    totalClicks: number;
    earningsAmount: number;
    status: string;
  }>;
  myProductCount: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Hesaplanıyor", color: "#F59E0B" },
  calculated: { label: "Hazır", color: "#3B82F6" },
  withdrawable: { label: "Çekilebilir", color: "#22C55E" },
  withdrawn: { label: "Çekildi", color: "#6B6B6B" },
};

export default function CuzdanScreen() {
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const qc = useQueryClient();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<"iban" | "papara">("iban");
  const [accountInfo, setAccountInfo] = useState("");
  const [accountName, setAccountName] = useState("");

  const { data, isLoading, refetch } = useQuery<EarningsDashboard>({
    queryKey: ["earnings-dashboard", user?.id],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/earnings/dashboard/${user!.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error("Veri alınamadı");
      return r.json();
    },
    enabled: !!user && !!accessToken,
  });

  const withdrawMut = useMutation({
    mutationFn: async () => {
      if (!accountInfo.trim() || !accountName.trim()) throw new Error("Tüm alanları doldur");
      const r = await fetch(`${API_BASE}/earnings/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ userId: user!.id, method: withdrawMethod, accountInfo: accountInfo.trim(), accountName: accountName.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "İşlem başarısız");
      return d;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowWithdrawModal(false);
      setAccountInfo("");
      setAccountName("");
      qc.invalidateQueries({ queryKey: ["earnings-dashboard"] });
      Alert.alert("Talep Alındı", "Para çekme talebiniz alındı. En geç 3 iş günü içinde hesabınıza aktarılır.");
    },
    onError: (e: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", e.message);
    },
  });

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: C.background, paddingTop: insets.top }]}>
        <Feather name="lock" size={40} color={C.textSecondary} />
        <Text style={[styles.emptyTitle, { color: C.text }]}>Giriş Gerekli</Text>
        <Pressable style={[styles.loginBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push("/auth")}>
          <Text style={styles.loginBtnText}>Giriş Yap</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Cüzdanım</Text>
        <Pressable onPress={() => refetch()} style={styles.backBtn}>
          <Feather name="refresh-cw" size={18} color={C.textSecondary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

          {/* Çekilebilir Bakiye */}
          <View style={[styles.balanceCard, { backgroundColor: Colors.primary }]}>
            <Text style={styles.balanceLabel}>Çekilebilir Bakiye</Text>
            <Text style={styles.balanceAmount}>
              {(data?.totalWithdrawable || 0).toFixed(2)} ₺
            </Text>
            <Text style={styles.balanceSub}>
              {data?.hasPendingWithdrawal ? "Bekleyen talep var" : "Hesabına çekebilirsin"}
            </Text>
            <Pressable
              style={[
                styles.withdrawBtn,
                { opacity: (data?.totalWithdrawable || 0) <= 0 || data?.hasPendingWithdrawal ? 0.5 : 1 },
              ]}
              onPress={() => setShowWithdrawModal(true)}
              disabled={(data?.totalWithdrawable || 0) <= 0 || data?.hasPendingWithdrawal}
            >
              <Feather name="arrow-up-circle" size={18} color={Colors.primary} />
              <Text style={[styles.withdrawBtnText, { color: Colors.primary }]}>
                {data?.hasPendingWithdrawal ? "Talep Beklemede" : "Para Çek"}
              </Text>
            </Pressable>
          </View>

          {/* Bu Ay İstatistikleri */}
          {data?.currentMonth && (
            <View style={[styles.monthCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Bu Ay ({data.currentMonth.yearMonth})</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Feather name="mouse-pointer" size={20} color={Colors.primary} />
                  <Text style={[styles.statNum, { color: C.text }]}>{data.currentMonth.myClicks.toLocaleString("tr")}</Text>
                  <Text style={[styles.statLbl, { color: C.textSecondary }]}>Tıklama</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Feather name="trending-up" size={20} color={Colors.light.green} />
                  <Text style={[styles.statNum, { color: C.text }]}>{data.currentMonth.estimatedTL.toFixed(2)} ₺</Text>
                  <Text style={[styles.statLbl, { color: C.textSecondary }]}>Tahmini Kazanç</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Feather name="package" size={20} color={Colors.light.blue} />
                  <Text style={[styles.statNum, { color: C.text }]}>{data.myProductCount}</Text>
                  <Text style={[styles.statLbl, { color: C.textSecondary }]}>Eklenen Ürün</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Feather name="dollar-sign" size={20} color={Colors.light.amber} />
                  <Text style={[styles.statNum, { color: C.text }]}>{data.currentMonth.poolAmount.toLocaleString("tr")} ₺</Text>
                  <Text style={[styles.statLbl, { color: C.textSecondary }]}>Havuz Büyüklüğü</Text>
                </View>
              </View>

              {/* Tıklama başına ücret */}
              {data.currentMonth.pricePerClick > 0 && (
                <View style={[styles.cpcRow, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Feather name="info" size={14} color={C.textSecondary} />
                  <Text style={[styles.cpcText, { color: C.textSecondary }]}>
                    Bu ay tıklama başına ≈ {data.currentMonth.pricePerClick.toFixed(4)} ₺
                    · Havuzda {data.currentMonth.totalPoolClicks.toLocaleString("tr")} toplam tıklama
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Nasıl Çalışır */}
          <View style={[styles.howCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Kazanç Modeli</Text>
            {[
              { icon: "mouse-pointer", label: "Tıklama Bazlı (%50)", desc: "Ürünlerine gelen tıklamalar orantılı havuz payı getirir" },
              { icon: "star", label: "Aktivite Bazlı (%50)", desc: "Günlük görevler + streak + koleksiyonlar puan kazandırır" },
              { icon: "zap", label: "Dış Trafik 2x", desc: "Sosyal medyadan gelen tıklamalar 2x puan değerindedir" },
              { icon: "award", label: "Şampiyon Bonusu", desc: "Top-1000'e giren ay şampiyonu, ertesi ay 2x çarpan kazanır" },
            ].map(({ icon, label, desc }) => (
              <View key={label} style={styles.howRow}>
                <View style={[styles.howIcon, { backgroundColor: Colors.primary + "20" }]}>
                  <Feather name={icon as any} size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.howLabel, { color: C.text }]}>{label}</Text>
                  <Text style={[styles.howDesc, { color: C.textSecondary }]}>{desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Geçmiş Kazançlar */}
          {data?.pastEarnings && data.pastEarnings.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Geçmiş Kazançlar</Text>
              {data.pastEarnings.map((e) => {
                const st = STATUS_LABELS[e.status] || { label: e.status, color: C.textSecondary };
                return (
                  <View key={e.yearMonth} style={[styles.earningRow, { backgroundColor: C.card, borderColor: C.border }]}>
                    <View>
                      <Text style={[styles.earningMonth, { color: C.text }]}>{e.yearMonth}</Text>
                      <Text style={[styles.earningClicks, { color: C.textSecondary }]}>{e.totalClicks} tıklama</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <Text style={[styles.earningAmount, { color: C.text }]}>{e.earningsAmount.toFixed(2)} ₺</Text>
                      <View style={[styles.statusBadge, { backgroundColor: st.color + "20" }]}>
                        <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {(!data?.pastEarnings || data.pastEarnings.length === 0) && data?.currentMonth?.myClicks === 0 && (
            <View style={[styles.emptyCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="inbox" size={32} color={C.textSecondary} />
              <Text style={[styles.emptyTitle, { color: C.text }]}>Henüz Kazancın Yok</Text>
              <Text style={[styles.emptySub, { color: C.textSecondary }]}>
                Ürün URL'leri ekle, vitrinini paylaş ve tıklanma puanı kazan!
              </Text>
              <Pressable
                style={[styles.addUrlBtn, { backgroundColor: Colors.primary }]}
                onPress={() => router.push("/url-ekle")}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.addUrlBtnText}>İlk URL'ni Ekle</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* Para Çekme Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowWithdrawModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: C.background }]}>
          <View style={[styles.modalHandle, { backgroundColor: C.border }]} />
          <Text style={[styles.modalTitle, { color: C.text }]}>Para Çek</Text>
          <Text style={[styles.modalSub, { color: C.textSecondary }]}>
            Çekilebilir bakiye: <Text style={{ color: Colors.primary, fontFamily: "Inter_700Bold" }}>{data?.totalWithdrawable?.toFixed(2)} ₺</Text>
          </Text>

          {/* Yöntem Seçimi */}
          <View style={[styles.methodToggle, { backgroundColor: C.surface, borderColor: C.border }]}>
            {(["iban", "papara"] as const).map(m => (
              <Pressable
                key={m}
                style={[styles.methodBtn, withdrawMethod === m && { backgroundColor: Colors.primary }]}
                onPress={() => setWithdrawMethod(m)}
              >
                <Text style={[styles.methodBtnText, { color: withdrawMethod === m ? "#fff" : C.textSecondary }]}>
                  {m === "iban" ? "IBAN / Banka" : "Papara"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.inputWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TextInput
              style={[styles.textInput, { color: C.text }]}
              placeholder={withdrawMethod === "iban" ? "IBAN (TR...)" : "Papara numarası"}
              placeholderTextColor={C.textSecondary}
              value={accountInfo}
              onChangeText={setAccountInfo}
              autoCapitalize="characters"
            />
          </View>
          <View style={[styles.inputWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TextInput
              style={[styles.textInput, { color: C.text }]}
              placeholder="Ad Soyad"
              placeholderTextColor={C.textSecondary}
              value={accountName}
              onChangeText={setAccountName}
            />
          </View>

          <Pressable
            style={[styles.confirmBtn, { backgroundColor: Colors.primary, opacity: withdrawMut.isPending ? 0.7 : 1 }]}
            onPress={() => withdrawMut.mutate()}
            disabled={withdrawMut.isPending}
          >
            {withdrawMut.isPending ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.confirmBtnText}>Talebi Gönder</Text>
            )}
          </Pressable>
          <Pressable style={styles.cancelModalBtn} onPress={() => setShowWithdrawModal(false)}>
            <Text style={[styles.cancelModalText, { color: C.textSecondary }]}>İptal</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  loginBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  balanceCard: { borderRadius: 24, padding: 24, marginBottom: 16, alignItems: "center" },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 6 },
  balanceAmount: { color: "#fff", fontSize: 48, fontFamily: "Inter_700Bold", marginBottom: 4 },
  balanceSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  withdrawBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  withdrawBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },

  monthCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  statBox: { flex: 1, minWidth: "44%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  cpcRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, borderWidth: 1, padding: 10 },
  cpcText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  howCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  howRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  howIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  howLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  howDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  section: { marginBottom: 16 },
  earningRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  earningMonth: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  earningClicks: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  earningAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  emptyCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  addUrlBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 8 },
  addUrlBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  modalContainer: { flex: 1, padding: 24 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  methodToggle: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 16, gap: 4 },
  methodBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  methodBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputWrap: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 },
  textInput: { fontSize: 15, fontFamily: "Inter_400Regular" },
  confirmBtn: { borderRadius: 16, padding: 18, alignItems: "center", marginTop: 8 },
  confirmBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  cancelModalBtn: { alignItems: "center", padding: 16 },
  cancelModalText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
