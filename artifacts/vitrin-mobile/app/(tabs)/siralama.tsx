import React from "react";
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { apiFetch } from "@/lib/api";

interface RankEntry {
  rank: number;
  displayName: string;
  totalPoints: number;
  clickPoints: number;
  activityPoints: number;
  estimatedEarnings: number;
  inPool: boolean;
  inSecondPool: boolean;
}

interface RankingMeta {
  yearMonth: string;
  poolAmount: number;
  totalParticipants: number;
  topPoolSlots: number;
  daysRemaining: number;
  topPoolShare: number;
  restPoolShare: number;
}

interface RankingData {
  ranked: RankEntry[];
  meta: RankingMeta;
}

export default function SiralamaTab() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const { data, isLoading } = useQuery<RankingData>({
    queryKey: ["rankings-live"],
    queryFn: () => apiFetch("rankings/live?limit=100"),
    refetchInterval: 30000,
  });

  const rankColor = (rank: number) => {
    if (rank === 1) return "#F59E0B";
    if (rank === 2) return "#94A3B8";
    if (rank === 3) return "#CD7C32";
    return C.textSecondary;
  };

  const renderEntry = ({ item }: { item: RankEntry }) => {
    return (
      <View style={[
        styles.rankCard,
        { backgroundColor: C.card, borderColor: C.border },
        item.inPool && { borderColor: Colors.primary + "30" },
      ]}>
        <View style={styles.rankNumContainer}>
          {item.rank <= 3 ? (
            <Feather name="award" size={22} color={rankColor(item.rank)} />
          ) : (
            <Text style={[styles.rankNum, { color: rankColor(item.rank) }]}>#{item.rank}</Text>
          )}
        </View>
        <View style={styles.rankInfo}>
          <View style={styles.rankNameRow}>
            <Text style={[styles.rankName, { color: C.text }]} numberOfLines={1}>{item.displayName}</Text>
            {item.inPool && (
              <View style={styles.poolBadge}>
                <Feather name="trending-up" size={10} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={[styles.rankPoints, { color: C.textSecondary }]}>
            {item.totalPoints.toLocaleString("tr")} puan
            {item.activityPoints > 0 ? ` · ⚡${item.activityPoints} aktivite` : ""}
          </Text>
        </View>
        <Text style={[styles.rankEarnings, { color: C.text }]}>
          ~{(item.estimatedEarnings || 0).toFixed(0)} ₺
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data?.ranked || []}
          keyExtractor={(item, idx) => `${item.rank}-${idx}`}
          renderItem={renderEntry}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: 120, gap: 8, paddingHorizontal: 16, paddingTop: 16 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 16 }}>
              <View style={{ paddingTop: insets.top }}>
                <Text style={[styles.title, { color: C.text }]}>Puan Sıralaması</Text>
                {data?.meta && (
                  <Text style={[styles.subtitle, { color: C.textSecondary }]}>
                    {data.meta.yearMonth} · {data.meta.totalParticipants} katılımcı · {data.meta.daysRemaining} gün kaldı
                  </Text>
                )}
              </View>
              {data?.meta?.poolAmount !== undefined && (
                <View style={[styles.poolBanner, { backgroundColor: Colors.primary + "15", borderColor: Colors.primary + "30" }]}>
                  <Feather name="dollar-sign" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.poolLabel, { color: Colors.primary }]}>Aylık Ödül Havuzu</Text>
                    <Text style={[styles.poolAmount, { color: C.text }]}>
                      {(data.meta.poolAmount).toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
                    </Text>
                  </View>
                </View>
              )}
              <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Text style={[styles.infoText, { color: C.textSecondary }]}>
                  Sıralama toplam puana göredir: tıklama + aktivite + bonus puanlar.{"\n"}
                  Top 1000: %50 orantılı · 1001+: %40 eşit · %10 platform
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="trophy" size={40} color={C.textSecondary} />
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>Henüz sıralama yok</Text>
              <Text style={[styles.emptySubtext, { color: C.textSecondary }]}>Ürün ekle ve aktivite yap!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  poolBanner: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  poolLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  poolAmount: { fontSize: 24, fontFamily: "Inter_700Bold" },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  infoText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  rankCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, padding: 14 },
  rankNumContainer: { width: 40, alignItems: "center" },
  rankNum: { fontSize: 16, fontFamily: "Inter_700Bold" },
  rankInfo: { flex: 1, gap: 2 },
  rankNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rankName: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  poolBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary + "20", alignItems: "center", justifyContent: "center" },
  rankPoints: { fontSize: 13, fontFamily: "Inter_400Regular" },
  rankEarnings: { fontSize: 15, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
