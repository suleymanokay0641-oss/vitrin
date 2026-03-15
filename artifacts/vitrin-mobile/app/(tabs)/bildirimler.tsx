import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, useColorScheme, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "Az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return d.toLocaleDateString("tr-TR");
}

export default function BildirimlerScreen() {
  const insets = useSafeAreaInsets();
  const { accessToken, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error("Bildirimler yüklenemedi");
      return r.json();
    },
    enabled: !!accessToken,
  });

  const notifications = data?.notifications || [];
  const summary = data?.summary;

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: C.background, paddingTop: insets.top }]}>
        <Feather name="bell-off" size={48} color={C.textSecondary} />
        <Text style={[styles.emptyTitle, { color: C.text }]}>Giriş Gerekli</Text>
        <Pressable style={[styles.loginBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push("/auth")}>
          <Text style={styles.loginBtnText}>Giriş Yap</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Bildirimler</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {summary && (
            <View style={[styles.summaryRow, { borderBottomColor: C.border }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                  {Number(summary.totalPoints || 0).toLocaleString("tr")}
                </Text>
                <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>Son 30 gün puan</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: C.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: "#3B82F6" }]}>
                  {Number(summary.clickCount || 0).toLocaleString("tr")}
                </Text>
                <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>Ürün tıklanması</Text>
              </View>
            </View>
          )}

          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="bell" size={48} color={C.textSecondary} />
              <Text style={[styles.emptyTitle, { color: C.text }]}>Henüz bildirim yok</Text>
              <Text style={[styles.emptySub, { color: C.textSecondary }]}>
                Ürün ekle ve vitrinini paylaş — tıklanınca burada görürsün
              </Text>
            </View>
          ) : (
            <View>
              {notifications.map((n: any, i: number) => (
                <View
                  key={n.id}
                  style={[styles.notifRow, { borderBottomColor: C.border }, i === 0 && styles.notifRowFirst]}
                >
                  <View style={[styles.notifIcon, { backgroundColor: n.color + "20" }]}>
                    <Feather name={n.icon as any} size={20} color={n.color} />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, { color: C.text }]}>{n.title}</Text>
                    <Text style={[styles.notifSubtitle, { color: n.color }]}>{n.subtitle}</Text>
                  </View>
                  <Text style={[styles.notifTime, { color: C.textSecondary }]}>{timeAgo(n.createdAt)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  summaryRow: { flexDirection: "row", paddingVertical: 20, paddingHorizontal: 24, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryDivider: { width: 1, marginVertical: 4 },
  notifRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  notifRowFirst: {},
  notifIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  notifContent: { flex: 1, gap: 3 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  notifSubtitle: { fontSize: 13, fontFamily: "Inter_500Medium" },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular", flexShrink: 0 },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  loginBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
