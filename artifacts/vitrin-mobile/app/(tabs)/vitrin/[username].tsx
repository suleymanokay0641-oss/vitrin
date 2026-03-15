import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, Pressable,
  ActivityIndicator, useColorScheme, Linking, Share, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

function recordClick(productId: number, accessToken: string | null, isExternal = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  // Fire-and-forget — URL açmayı BEKLEME
  fetch(`${API_BASE}/products/${productId}/affiliate-click`, {
    method: "POST", headers, body: JSON.stringify({ isExternal }),
  }).catch(() => {});
}

function openUrl(url: string) {
  if (Platform.OS === "web") {
    // Yeni sekmede aç (senkron çağrı — popup blocker yok)
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

function getRankLabel(rank: number | null): { label: string; color: string; bg: string; icon: string } {
  if (!rank) return { label: "Sıralamaya girmemiş", color: "#999", bg: "#88880F", icon: "clock" };
  if (rank === 1) return { label: "🥇 1. Sıra", color: "#92400E", bg: "#FEF3C7", icon: "award" };
  if (rank === 2) return { label: "🥈 2. Sıra", color: "#374151", bg: "#F3F4F6", icon: "award" };
  if (rank === 3) return { label: "🥉 3. Sıra", color: "#7C3AED", bg: "#EDE9FE", icon: "award" };
  if (rank <= 10) return { label: `⭐ ${rank}. Sıra — Top 10`, color: Colors.primary, bg: Colors.primary + "15", icon: "star" };
  if (rank <= 100) return { label: `${rank}. Sıra — Top 100`, color: Colors.primary, bg: Colors.primary + "10", icon: "trending-up" };
  if (rank <= 1000) return { label: `${rank}. Sıra — Kazanç Havuzunda`, color: "#059669", bg: "#ECFDF5", icon: "check-circle" };
  return { label: `${rank}. Sıra`, color: "#6B7280", bg: "#F9FAFB", icon: "user" };
}

export default function VitrinProfile() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user, accessToken } = useAuth();
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const [clickingId, setClickingId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vitrin", username],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const r = await fetch(`${API_BASE}/vitrin/${username}`, { headers });
      if (!r.ok) throw new Error("Vitrin bulunamadı");
      return r.json();
    },
    enabled: !!username,
  });

  const followMut = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const isFollowing = data.isFollowing;
      await fetch(`${API_BASE}/follows/${data.user.id}`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      });
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["vitrin", username] });
    },
  });

  const handleShare = async () => {
    if (!data) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const username = data.user.username || data.user.displayName || "kullanici";
    const url = `https://vitrin-profil.replit.app/@${username}`;
    const message = `${data.user.displayName || username} vitrinini keşfet 🛍️\n${url}`;
    try {
      if (Platform.OS === "web") {
        try {
          if (typeof navigator !== "undefined" && navigator.share) {
            await navigator.share({ title: "Vitrin", text: message, url });
          } else if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            alert("Vitrin linki kopyalandı!");
          }
        } catch {
          alert(`Vitrin linki:\n${url}`);
        }
      } else {
        await Share.share({ message, url });
      }
    } catch {
      // Kullanıcı iptal etti veya desteklenmiyor — sessizce geç
    }
  };

  const handleProductClick = (product: any) => {
    if (!product.storeUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Tıklamayı arka planda kaydet, URL'i hemen aç
    recordClick(product.id, accessToken);
    openUrl(product.storeUrl);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.center, { backgroundColor: C.background, paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={40} color={C.textSecondary} />
        <Text style={[styles.emptyTitle, { color: C.text }]}>Vitrin Bulunamadı</Text>
        <Pressable style={[styles.backBtn, { backgroundColor: C.surface }]} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: C.text }]}>Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  const { stats } = data;
  const rankInfo = getRankLabel(stats?.monthlyRank ?? null);
  const hasRank = !!stats?.monthlyRank;
  const inTop1000 = hasRank && stats.monthlyRank <= 1000;
  const isMe = data.isOwner;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>@{data.user.username}</Text>
        <Pressable onPress={handleShare} style={styles.iconBtn}>
          <Feather name="share" size={20} color={C.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Profil bölümü */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={[styles.avatarWrap, { backgroundColor: Colors.primary + "20" }]}>
            <Text style={[styles.avatarText, { color: Colors.primary }]}>
              {(data.user.displayName || data.user.username).charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* İsim */}
          <Text style={[styles.displayName, { color: C.text }]}>
            {data.user.displayName || data.user.username}
          </Text>

          {/* Rozet satırı */}
          <View style={styles.badgeRow}>
            {data.user.isChampion && (
              <View style={styles.champBadge}>
                <Feather name="award" size={12} color="#F59E0B" />
                <Text style={styles.champText}>Şampiyon</Text>
              </View>
            )}
            {(stats?.currentStreak ?? 0) > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: "#F59E0B20" }]}>
                <Text style={styles.streakText}>🔥 {stats.currentStreak} Gün Seri</Text>
              </View>
            )}
            {data.user.loyaltyMonths > 0 && (
              <View style={[styles.loyalBadge, { backgroundColor: Colors.primary + "15" }]}>
                <Feather name="calendar" size={11} color={Colors.primary} />
                <Text style={[styles.loyalText, { color: Colors.primary }]}>{data.user.loyaltyMonths}. ay</Text>
              </View>
            )}
          </View>

          {/* Platform performans metrikleri */}
          <View style={[styles.metricsRow, { borderColor: C.border }]}>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, {
                color: hasRank ? (inTop1000 ? "#059669" : C.text) : C.textSecondary,
                fontSize: hasRank ? 20 : 16,
              }]}>
                {hasRank ? `#${stats.monthlyRank}` : "—"}
              </Text>
              <Text style={[styles.metricLabel, { color: C.textSecondary }]}>Bu Ay Sıra</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: C.border }]} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: C.text }]}>
                {(stats?.monthlyClicks ?? 0).toLocaleString("tr-TR")}
              </Text>
              <Text style={[styles.metricLabel, { color: C.textSecondary }]}>Aylık Tıklama</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: C.border }]} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: C.text }]}>
                {stats?.totalProducts ?? 0}
              </Text>
              <Text style={[styles.metricLabel, { color: C.textSecondary }]}>Ürün</Text>
            </View>
          </View>

          {/* Performans bandı */}
          {hasRank ? (
            <View style={[styles.rankBanner, { backgroundColor: isDark ? rankInfo.bg + "30" : rankInfo.bg, borderColor: rankInfo.color + "30" }]}>
              <Feather name={rankInfo.icon as any} size={14} color={rankInfo.color} />
              <Text style={[styles.rankBannerText, { color: rankInfo.color }]}>{rankInfo.label}</Text>
              {inTop1000 && (
                <View style={[styles.inPoolTag, { backgroundColor: "#059669" }]}>
                  <Text style={styles.inPoolTagText}>Kazanç Havuzu ✓</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.rankBanner, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="clock" size={14} color={C.textSecondary} />
              <Text style={[styles.rankBannerText, { color: C.textSecondary }]}>
                Henüz tıklama yok · Ürün paylaşılınca sıralamaya girer
              </Text>
            </View>
          )}

          {/* Eylem butonları */}
          {!isMe && (
            <View style={styles.actionRow}>
              {user && (
                <Pressable
                  style={[styles.actionBtn, {
                    backgroundColor: data.isFollowing ? C.surface : Colors.primary,
                    borderColor: data.isFollowing ? C.border : Colors.primary,
                    flex: 1,
                  }]}
                  onPress={() => followMut.mutate()}
                  disabled={followMut.isPending}
                >
                  <Feather
                    name={data.isFollowing ? "user-check" : "user-plus"}
                    size={15}
                    color={data.isFollowing ? C.text : "#fff"}
                  />
                  <Text style={[styles.actionBtnText, { color: data.isFollowing ? C.text : "#fff" }]}>
                    {data.isFollowing ? "Takiptesin" : "Takip Et"}
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.actionBtn, { backgroundColor: C.surface, borderColor: C.border, flex: user ? 0 : 1 }]}
                onPress={handleShare}
              >
                <Feather name="share-2" size={15} color={C.text} />
                <Text style={[styles.actionBtnText, { color: C.text }]}>Paylaş</Text>
              </Pressable>
            </View>
          )}

          {/* Takipçi bilgisi (küçük, ikincil) */}
          {(stats?.followerCount > 0 || stats?.followingCount > 0) && (
            <Text style={[styles.followMeta, { color: C.textSecondary }]}>
              {stats.followerCount} takipçi · {stats.followingCount} takip
            </Text>
          )}
        </View>

        {/* Puan detayı (varsa) */}
        {stats?.monthPoints > 0 && (
          <View style={[styles.pointsCard, { backgroundColor: Colors.primary + "10", borderColor: Colors.primary + "25", marginHorizontal: 16, marginBottom: 16 }]}>
            <View style={styles.pointsRow}>
              <View style={styles.pointItem}>
                <Text style={[styles.pointValue, { color: Colors.primary }]}>{stats.monthPoints}</Text>
                <Text style={[styles.pointLabel, { color: C.textSecondary }]}>Toplam Puan</Text>
              </View>
              <View style={[styles.pointDiv, { backgroundColor: Colors.primary + "30" }]} />
              <View style={styles.pointItem}>
                <Text style={[styles.pointValue, { color: Colors.primary }]}>{stats.monthClickPoints}</Text>
                <Text style={[styles.pointLabel, { color: C.textSecondary }]}>Tıklama Puanı</Text>
              </View>
              <View style={[styles.pointDiv, { backgroundColor: Colors.primary + "30" }]} />
              <View style={styles.pointItem}>
                <Text style={[styles.pointValue, { color: Colors.primary }]}>{stats.monthActivityPoints}</Text>
                <Text style={[styles.pointLabel, { color: C.textSecondary }]}>Aktivite Puanı</Text>
              </View>
            </View>
          </View>
        )}

        {/* Ürünler */}
        {data.addedProducts?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="shopping-bag" size={16} color={C.text} />
              <Text style={[styles.sectionTitle, { color: C.text }]}>Vitrindeki Ürünler</Text>
              <View style={[styles.countBadge, { backgroundColor: Colors.primary + "20" }]}>
                <Text style={[styles.countText, { color: Colors.primary }]}>{data.addedProducts.length}</Text>
              </View>
            </View>
            <Text style={[styles.sectionHint, { color: C.textSecondary }]}>
              Tıkla → mağazaya git · Her tıklama sahibine puan kazandırır
            </Text>
            <View style={styles.productsGrid}>
              {data.addedProducts.map((p: any) => (
                <View key={p.id} style={[styles.productCard, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => handleProductClick(p)}
                    disabled={!p.storeUrl}
                  >
                    {p.imageUrl ? (
                      <Image source={{ uri: p.imageUrl }} style={styles.productImg} resizeMode="cover" />
                    ) : (
                      <View style={[styles.productImg, { backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }]}>
                        <Feather name="shopping-bag" size={24} color={C.textSecondary} />
                      </View>
                    )}
                    <View style={styles.productBottom}>
                      <Text style={[styles.productName, { color: C.text }]} numberOfLines={2}>{p.name}</Text>
                      {p.store && (
                        <View style={[styles.storePill, { backgroundColor: Colors.primary + "15" }]}>
                          <Feather name="external-link" size={10} color={Colors.primary} />
                          <Text style={[styles.storeText, { color: Colors.primary }]}>{p.store}</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                  {/* Detay/Yorum butonu */}
                  <Pressable
                    style={[styles.detailBtn, { borderTopColor: C.border }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: "/urun/[id]", params: { id: p.id } });
                    }}
                  >
                    <Feather name="message-square" size={12} color={C.textSecondary} />
                    <Text style={[styles.detailBtnText, { color: C.textSecondary }]}>Yorum & Oy</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Koleksiyonlar */}
        {data.collections?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="folder" size={16} color={C.text} />
              <Text style={[styles.sectionTitle, { color: C.text }]}>Koleksiyonlar</Text>
            </View>
            {data.collections.map((col: any) => (
              <Pressable
                key={col.id}
                style={[styles.collRow, { backgroundColor: C.card, borderColor: C.border }]}
                onPress={() => router.push({ pathname: "/koleksiyon/[slug]", params: { slug: col.slug } })}
              >
                <Feather name="folder" size={18} color={Colors.primary} />
                <Text style={[styles.collTitle, { color: C.text }]}>{col.title}</Text>
                <Text style={[styles.collViews, { color: C.textSecondary }]}>{col.viewCount} görüntülenme</Text>
                <Feather name="chevron-right" size={16} color={C.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Boş vitrin */}
        {data.addedProducts?.length === 0 && (
          <View style={[styles.emptyState, { borderColor: C.border }]}>
            <Feather name="shopping-bag" size={32} color={C.textSecondary} />
            <Text style={[styles.emptyStateText, { color: C.textSecondary }]}>Bu vitrine henüz ürün eklenmemiş</Text>
            {isMe && (
              <Pressable
                style={[styles.addProductBtn, { backgroundColor: Colors.primary }]}
                onPress={() => router.push("/(tabs)/pano")}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.addProductBtnText}>İlk Ürünü Ekle</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  backText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 8, paddingBottom: 12, borderBottomWidth: 1,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  profileSection: { alignItems: "center", paddingTop: 28, paddingBottom: 8, paddingHorizontal: 20 },
  avatarWrap: { width: 88, height: 88, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarText: { fontSize: 40, fontFamily: "Inter_700Bold" },
  displayName: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 10, textAlign: "center" },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 },
  champBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F59E0B20", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: "#F59E0B40",
  },
  champText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#F59E0B" },
  streakBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  streakText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#F59E0B" },
  loyalBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  loyalText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  metricsRow: {
    flexDirection: "row", alignItems: "center", width: "100%",
    borderWidth: 1, borderRadius: 18, overflow: "hidden", marginBottom: 12,
  },
  metric: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6 },
  metricValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3, textAlign: "center" },
  metricDivider: { width: 1, height: 40 },
  rankBanner: {
    flexDirection: "row", alignItems: "center", gap: 8, width: "100%",
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1,
    marginBottom: 16,
  },
  rankBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inPoolTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  inPoolTagText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  actionRow: { flexDirection: "row", gap: 10, width: "100%", marginBottom: 12 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 12, paddingHorizontal: 18,
    borderRadius: 14, borderWidth: 1, minWidth: 100,
  },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  followMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  pointsCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
  pointsRow: { flexDirection: "row", alignItems: "center" },
  pointItem: { flex: 1, alignItems: "center" },
  pointValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  pointLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
  pointDiv: { width: 1, height: 32 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sectionTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold" },
  countBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  sectionHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12, lineHeight: 18 },
  productsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  productCard: { width: "47%", borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  productImg: { width: "100%", height: 120 },
  loadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, height: 120,
    backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center",
  },
  productBottom: { padding: 10, gap: 5 },
  productName: { fontSize: 12, fontFamily: "Inter_600SemiBold", lineHeight: 17 },
  storePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  storeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  collRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  collTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  collViews: { fontSize: 12, fontFamily: "Inter_400Regular" },
  emptyState: { margin: 20, borderRadius: 16, borderWidth: 1, borderStyle: "dashed", padding: 32, alignItems: "center", gap: 12 },
  emptyStateText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  addProductBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  addProductBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  detailBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 7, borderTopWidth: StyleSheet.hairlineWidth },
  detailBtnText: { fontSize: 10, fontFamily: "Inter_500Medium" },
});
