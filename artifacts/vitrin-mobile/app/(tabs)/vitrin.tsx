import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image,
  ActivityIndicator, useColorScheme, RefreshControl, Modal, Clipboard, Linking, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { authedFetch, API_BASE } from "@/lib/api";

function openUrl(url: string) {
  if (Platform.OS === "web") {
    // Web'de aynı sekme — popup blocker yok
    window.location.href = url;
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

interface MyProduct {
  id: number;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  store: string | null;
  storeUrl: string | null;
  category: string | null;
  affiliateClickCount: number;
  pointsEarned: number;
  createdAt: string;
}

interface MeData {
  products: MyProduct[];
  summary: {
    totalProducts: number;
    totalClicks: number;
    monthPoints: number;
    monthClickPoints: number;
    monthActivityPoints: number;
    currentStreak: number;
    allTimePoints: number;
  };
  username: string;
}

export default function VitrinTab() {
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<MyProduct | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery<MeData>({
    queryKey: ["me-products"],
    queryFn: () => authedFetch("vitrin/me/products", accessToken!),
    enabled: !!accessToken,
  });

  useFocusEffect(useCallback(() => {
    if (accessToken) queryClient.invalidateQueries({ queryKey: ["me-products"] });
  }, [accessToken]));

  const deleteMut = useMutation({
    mutationFn: async (productId: number) => {
      const r = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Silinemedi");
      return d;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["me-products"] });
      setDeleteTarget(null);
    },
  });

  const handleShare = () => {
    if (!username) return;
    const link = `https://vitrin.app/@${username}`;
    Clipboard.setString(link);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: C.background, paddingTop: insets.top }]}>
        <View style={[styles.emptyIcon, { backgroundColor: Colors.primary + "15" }]}>
          <Feather name="shopping-bag" size={40} color={Colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: C.text }]}>Vitrinim</Text>
        <Text style={[styles.emptySub, { color: C.textSecondary }]}>
          Giriş yap, URL ekle ve kazanmaya başla
        </Text>
        <Pressable style={[styles.loginBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push("/auth")}>
          <Feather name="log-in" size={16} color="#fff" />
          <Text style={styles.loginBtnText}>Giriş Yap</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const s = data?.summary;
  const products = data?.products || [];
  const username = data?.username || user.displayName?.toLowerCase() || "";

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.background }]}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        <View style={{ paddingTop: insets.top + 16, paddingBottom: 120 }}>

          {/* Başlık */}
          <View style={styles.topRow}>
            <Text style={[styles.pageTitle, { color: C.text }]}>Vitrinim</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                style={[styles.iconBtn, { backgroundColor: C.surface, borderColor: C.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/bildirimler"); }}
              >
                <Feather name="bell" size={18} color={C.textSecondary} />
              </Pressable>
              <Pressable
                style={[styles.iconBtn, { backgroundColor: C.surface, borderColor: C.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/vitrin/[username]", params: { username } }); }}
              >
                <Feather name="eye" size={18} color={C.textSecondary} />
              </Pressable>
              <Pressable
                style={[styles.addBtn, { backgroundColor: Colors.primary }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/url-ekle"); }}
              >
                <Feather name="plus" size={18} color="#fff" />
                <Text style={styles.addBtnText}>URL Ekle</Text>
              </Pressable>
            </View>
          </View>

          {/* Özet Kartlar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            {[
              { label: "Toplam Ürün", value: s?.totalProducts || 0, icon: "shopping-bag", color: Colors.primary },
              { label: "Toplam Tıklama", value: s?.totalClicks || 0, icon: "mouse-pointer", color: "#3B82F6" },
              { label: "Aylık Puan", value: s?.monthPoints || 0, icon: "star", color: "#F59E0B" },
              { label: "Günlük Seri", value: s?.currentStreak || 0, icon: "zap", color: "#10B981" },
              { label: "Tüm Puan", value: s?.allTimePoints || 0, icon: "trending-up", color: "#8B5CF6" },
            ].map(({ label, value, icon, color }) => (
              <View key={label} style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
                  <Feather name={icon as any} size={18} color={color} />
                </View>
                <Text style={[styles.statValue, { color: C.text }]}>{value.toLocaleString("tr")}</Text>
                <Text style={[styles.statLabel, { color: C.textSecondary }]}>{label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Puan Detayı */}
          {(s?.monthPoints || 0) > 0 && (
            <View style={[styles.pointsCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Bu Ay Puan Dağılımı</Text>
              <View style={styles.pointBar}>
                <View style={[styles.pointBarFill, { flex: s!.monthClickPoints || 1, backgroundColor: Colors.primary }]} />
                <View style={[styles.pointBarFill, { flex: s!.monthActivityPoints || 0, backgroundColor: "#F59E0B" }]} />
              </View>
              <View style={styles.pointLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                  <Text style={[styles.legendText, { color: C.textSecondary }]}>Tıklama: {s!.monthClickPoints} puan</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
                  <Text style={[styles.legendText, { color: C.textSecondary }]}>Aktivite: {s!.monthActivityPoints} puan</Text>
                </View>
              </View>
            </View>
          )}

          {/* Vitrin Link Kopyala */}
          {username && (
            <Pressable
              style={[styles.shareCard, { backgroundColor: copied ? Colors.primary + "20" : C.surface, borderColor: copied ? Colors.primary : C.border }]}
              onPress={handleShare}
            >
              <Feather name={copied ? "check" : "link-2"} size={18} color={copied ? Colors.primary : C.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.shareCardTitle, { color: copied ? Colors.primary : C.text }]}>
                  {copied ? "Link kopyalandı!" : "Vitrin Linkini Paylaş"}
                </Text>
                <Text style={[styles.shareCardSub, { color: C.textSecondary }]}>vitrin.app/@{username}</Text>
              </View>
              <Feather name="copy" size={16} color={copied ? Colors.primary : C.textSecondary} />
            </Pressable>
          )}

          {/* Ürün Listesi */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>
                Eklediğim Ürünler {products.length > 0 ? `(${products.length})` : ""}
              </Text>
              {products.length > 0 && (
                <Pressable onPress={() => router.push("/bildirimler")}>
                  <Text style={[styles.seeAll, { color: Colors.primary }]}>Geçmiş →</Text>
                </Pressable>
              )}
            </View>

            {products.length === 0 ? (
              <View style={[styles.emptyProducts, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Feather name="inbox" size={36} color={C.textSecondary} />
                <Text style={[styles.emptyProductsTitle, { color: C.text }]}>Henüz ürün yok</Text>
                <Text style={[styles.emptyProductsSub, { color: C.textSecondary }]}>
                  Trendyol, Hepsiburada, Amazon gibi sitelerden ürün linki ekle, tıklanınca puan kazan
                </Text>
                <Pressable
                  style={[styles.emptyAddBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/url-ekle"); }}
                >
                  <Feather name="plus" size={16} color="#fff" />
                  <Text style={styles.emptyAddBtnText}>İlk Ürünü Ekle</Text>
                </Pressable>
              </View>
            ) : (
              products.map((product) => (
                <Pressable
                  key={product.id}
                  style={[styles.productRow, { backgroundColor: C.card, borderColor: C.border }]}
                  onPress={() => {
                    if (product.storeUrl) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Tıklamayı arka planda kaydet — URL açmayı BEKLEME
                      fetch(`${API_BASE}/products/${product.id}/affiliate-click`, { method: "POST" }).catch(() => {});
                      openUrl(product.storeUrl);
                    }
                  }}
                >
                  {/* Ürün Görseli */}
                  <View style={[styles.productThumb, { backgroundColor: C.surface }]}>
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.thumbImg} />
                    ) : (
                      <Feather name="shopping-bag" size={22} color={C.textSecondary} />
                    )}
                  </View>

                  {/* Ürün Bilgisi */}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: C.text }]} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.productMeta}>
                      {product.store && (
                        <View style={[styles.storeBadge, { backgroundColor: C.surface }]}>
                          <Feather name="external-link" size={10} color={C.textSecondary} style={{ marginRight: 3 }} />
                          <Text style={[styles.storeText, { color: C.textSecondary }]}>{product.store}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* İstatistikler + Sil */}
                  <View style={styles.productRight}>
                    <View style={styles.productStats}>
                      <View style={styles.statBadge}>
                        <Feather name="mouse-pointer" size={11} color="#3B82F6" />
                        <Text style={[styles.statBadgeText, { color: "#3B82F6" }]}>{product.affiliateClickCount || 0}</Text>
                      </View>
                      <View style={[styles.statBadge, { marginTop: 4 }]}>
                        <Feather name="star" size={11} color="#F59E0B" />
                        <Text style={[styles.statBadgeText, { color: "#F59E0B" }]}>{product.pointsEarned}</Text>
                      </View>
                    </View>
                    <Pressable
                      style={[styles.deleteBtn, { backgroundColor: "#EF444415" }]}
                      onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDeleteTarget(product); }}
                    >
                      <Feather name="trash-2" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Ürün Silme Onay Modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteTarget(null)}>
          <Pressable style={[styles.modalBox, { backgroundColor: C.card, borderColor: C.border }]} onPress={() => {}}>
            <View style={[styles.modalIcon, { backgroundColor: "#EF444420" }]}>
              <Feather name="trash-2" size={26} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: C.text }]}>Ürünü Sil</Text>
            <Text style={[styles.modalSub, { color: C.textSecondary }]} numberOfLines={3}>
              "{deleteTarget?.name}" ürününü vitrininden kaldırmak istediğine emin misin?
            </Text>
            <Pressable
              style={[styles.modalBtn, { backgroundColor: "#EF4444", opacity: deleteMut.isPending ? 0.7 : 1 }]}
              onPress={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalBtnText}>Evet, Sil</Text>
              }
            </Pressable>
            <Pressable style={[styles.modalCancelBtn, { borderColor: C.border }]} onPress={() => setDeleteTarget(null)}>
              <Text style={[styles.modalCancelText, { color: C.textSecondary }]}>İptal</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  emptyIcon: { width: 88, height: 88, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 16 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  statsRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 4, marginBottom: 16 },
  statCard: { width: 120, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  pointsCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  pointBar: { flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: "#e5e7eb" },
  pointBarFill: { height: "100%" },
  pointLegend: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  shareCard: { marginHorizontal: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  shareCardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  shareCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { paddingHorizontal: 16, gap: 10 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  emptyProducts: { borderRadius: 20, borderWidth: 1, padding: 32, alignItems: "center", gap: 12 },
  emptyProductsTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyProductsSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  emptyAddBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  emptyAddBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  productRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 12 },
  productThumb: { width: 60, height: 60, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbImg: { width: 60, height: 60 },
  productInfo: { flex: 1, gap: 4 },
  productName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  productMeta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  storeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  storeText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  productRight: { alignItems: "flex-end", gap: 8 },
  productStats: { alignItems: "flex-end" },
  statBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  statBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  deleteBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 32 },
  modalBox: { width: "100%", maxWidth: 340, borderRadius: 24, borderWidth: 1, padding: 28, alignItems: "center", gap: 10 },
  modalIcon: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 8 },
  modalBtn: { width: "100%", borderRadius: 14, padding: 16, alignItems: "center" },
  modalBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  modalCancelBtn: { width: "100%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", marginTop: 4 },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
