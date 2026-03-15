import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable, Image,
  TextInput, ActivityIndicator, RefreshControl, useColorScheme, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { apiFetch, API_BASE } from "@/lib/api";

function imgSrc(url: string | null): string | null {
  if (!url) return null;
  if (Platform.OS === "web") return `${API_BASE}/img-proxy?url=${encodeURIComponent(url)}`;
  return url;
}

interface PreviewProduct {
  name: string;
  imageUrl: string | null;
  store: string | null;
}

interface VitrinCard {
  rank: number | null;
  userId: number;
  displayName: string;
  username: string;
  totalClicks: number;
  totalPoints: number;
  estimatedEarnings: number;
  isChampion: boolean;
  productCount: number;
  previewProducts: PreviewProduct[];
}

interface DiscoverData {
  vitrins: VitrinCard[];
  yearMonth: string;
  poolAmount: number;
}

const RANK_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "#F59E0B", text: "#fff", label: "🥇 1." },
  2: { bg: "#94A3B8", text: "#fff", label: "🥈 2." },
  3: { bg: "#CD7C32", text: "#fff", label: "🥉 3." },
};

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null || rank === undefined) {
    return (
      <View style={[styles.rankBadge, { backgroundColor: "#8881" }]}>
        <Feather name="clock" size={10} color="#999" />
        <Text style={[styles.rankBadgeText, { color: "#999" }]}> Yeni</Text>
      </View>
    );
  }
  const top3 = RANK_COLORS[rank];
  if (top3) {
    return (
      <View style={[styles.rankBadge, { backgroundColor: top3.bg }]}>
        <Text style={[styles.rankBadgeText, { color: top3.text }]}>{top3.label}</Text>
      </View>
    );
  }
  if (rank <= 10) {
    return (
      <View style={[styles.rankBadge, { backgroundColor: Colors.primary + "20" }]}>
        <Feather name="star" size={10} color={Colors.primary} />
        <Text style={[styles.rankBadgeText, { color: Colors.primary }]}> {rank}.</Text>
      </View>
    );
  }
  return (
    <View style={[styles.rankBadge, { backgroundColor: "#8882" }]}>
      <Text style={[styles.rankBadgeText, { color: "#888" }]}>{rank}. sıra</Text>
    </View>
  );
}

function AvatarCircle({ name, size = 48, isDark }: { name: string; size?: number; isDark: boolean }) {
  const C = isDark ? Colors.dark : Colors.light;
  const initials = name.slice(0, 2).toUpperCase();
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const bg = `hsl(${hue}, 55%, 45%)`;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery<DiscoverData>({
    queryKey: ["discover"],
    queryFn: () => apiFetch("discover?limit=100"),
    staleTime: 30_000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const vitrins = (data?.vitrins || []).filter(v => {
    if (!search.trim()) return true;
    return v.displayName.toLowerCase().includes(search.toLowerCase());
  });

  const renderCard = ({ item }: { item: VitrinCard }) => {
    const isMe = user?.id === item.userId;
    return (
      <Pressable
        style={[styles.card, { backgroundColor: C.card, borderColor: isMe ? Colors.primary + "60" : C.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/(tabs)/vitrin/[username]", params: { username: item.username } });
        }}
        android_ripple={{ color: Colors.primary + "20" }}
      >
        {/* Üst satır: Avatar + İsim + Rozetler */}
        <View style={styles.cardTop}>
          <AvatarCircle name={item.displayName} isDark={isDark} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: C.text }]} numberOfLines={1}>
                {item.displayName}
              </Text>
              {item.isChampion && (
                <View style={styles.champBadge}>
                  <Feather name="award" size={11} color="#F59E0B" />
                  <Text style={styles.champText}>Şampiyon</Text>
                </View>
              )}
              {isMe && (
                <View style={[styles.meBadge, { backgroundColor: Colors.primary + "20" }]}>
                  <Text style={[styles.meText, { color: Colors.primary }]}>Sen</Text>
                </View>
              )}
            </View>
            <View style={styles.statsRow}>
              <Feather name="package" size={11} color={C.textSecondary} />
              <Text style={[styles.statText, { color: C.textSecondary }]}>{item.productCount} ürün</Text>
              <Text style={[styles.statDot, { color: C.textSecondary }]}>·</Text>
              <Feather name="mouse-pointer" size={11} color={C.textSecondary} />
              <Text style={[styles.statText, { color: C.textSecondary }]}>{item.totalClicks.toLocaleString("tr-TR")} tık</Text>
              {item.estimatedEarnings > 0 && (
                <>
                  <Text style={[styles.statDot, { color: C.textSecondary }]}>·</Text>
                  <Feather name="trending-up" size={11} color={Colors.light.green} />
                  <Text style={[styles.statText, { color: Colors.light.green }]}>
                    ~{item.estimatedEarnings.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
                  </Text>
                </>
              )}
            </View>
          </View>
          <RankBadge rank={item.rank} />
        </View>

        {/* Ürün önizlemeleri */}
        {item.previewProducts.length > 0 && (
          <View style={styles.previewRow}>
            {item.previewProducts.map((p, i) => (
              <View key={i} style={[styles.previewItem, { backgroundColor: C.surface, borderColor: C.border }]}>
                {p.imageUrl ? (
                  <Image source={{ uri: imgSrc(p.imageUrl) ?? p.imageUrl }} style={styles.previewImg} resizeMode="cover" />
                ) : (
                  <View style={[styles.previewImg, { alignItems: "center", justifyContent: "center" }]}>
                    <Feather name="package" size={18} color={C.textSecondary} />
                  </View>
                )}
                <Text style={[styles.previewName, { color: C.textSecondary }]} numberOfLines={1}>{p.name}</Text>
              </View>
            ))}
            {/* Boş slotlar */}
            {Array.from({ length: Math.max(0, 3 - item.previewProducts.length) }).map((_, i) => (
              <View key={`empty-${i}`} style={[styles.previewItem, { backgroundColor: C.surface, borderColor: C.border, opacity: 0.3 }]}>
                <View style={[styles.previewImg, { alignItems: "center", justifyContent: "center" }]}>
                  <Feather name="plus" size={18} color={C.textSecondary} />
                </View>
                <Text style={[styles.previewName, { color: C.textSecondary }]}>—</Text>
              </View>
            ))}
          </View>
        )}

        {/* Alt buton */}
        <View style={styles.cardBottom}>
          <Text style={[styles.viewBtn, { color: Colors.primary }]}>Vitrini Gör →</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: C.background }]}>
        <View>
          <Text style={[styles.headerTitle, { color: C.text }]}>Öne Çıkan Vitrinler</Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>
            {data ? `${data.vitrins.length} vitrin · ${data.yearMonth}` : "Bu ayın öne çıkanları"}
          </Text>
        </View>
        <Pressable
          style={[styles.notifBtn, { backgroundColor: C.surface, borderColor: C.border }]}
          onPress={() => router.push("/(tabs)/bildirimler")}
        >
          <Feather name="bell" size={18} color={C.textSecondary} />
        </Pressable>
      </View>

      {/* Arama */}
      <View style={[styles.searchWrap, { paddingHorizontal: 16, paddingBottom: 10 }]}>
        <View style={[styles.searchBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Feather name="search" size={16} color={C.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Vitrin ara..."
            placeholderTextColor={C.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={C.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: C.textSecondary }]}>Vitrinler yükleniyor...</Text>
        </View>
      ) : vitrins.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={48} color={C.textSecondary} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>
            {search ? "Sonuç bulunamadı" : "Henüz vitrin yok"}
          </Text>
          <Text style={[styles.emptySub, { color: C.textSecondary }]}>
            {search ? "Farklı bir isim dene" : "İlk vitrin katkıcısı sen ol!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={vitrins}
          keyExtractor={item => item.userId.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 120, gap: 12, paddingTop: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 16, paddingBottom: 10,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  searchWrap: {},
  searchBox: {
    flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 32 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  card: {
    borderRadius: 18, borderWidth: 1, overflow: "hidden",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  displayName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  champBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#F59E0B20", paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: "#F59E0B50",
  },
  champText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#F59E0B" },
  meBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  meText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" },
  statText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDot: { fontSize: 11 },
  rankBadge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 10, marginLeft: 8, alignSelf: "flex-start",
  },
  rankBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  previewRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  previewItem: { flex: 1, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  previewImg: { width: "100%", aspectRatio: 1 },
  previewName: { fontSize: 10, fontFamily: "Inter_400Regular", padding: 6, lineHeight: 14 },
  cardBottom: { marginTop: 12, alignItems: "flex-end" },
  viewBtn: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
