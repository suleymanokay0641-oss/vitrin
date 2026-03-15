import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  ActivityIndicator, RefreshControl, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { authedFetch, apiFetch, API_BASE } from "@/lib/api";

interface MonthlyStats {
  rank: number | null;
  totalPoints: number;
  clickPoints: number;
  activityPoints: number;
  estimatedEarnings: number;
  inPool: boolean;
  daysRemaining: number;
  totalParticipants: number;
  poolAmount: number;
}

interface Task {
  type: string;
  label: string;
  description: string;
  points: number;
  maxPerDay: number;
  completedCount: number;
  canComplete: boolean;
}

interface TasksData {
  tasks: Task[];
  totalEarned: number;
  maxPossible: number;
}

interface PoolStats {
  poolAmount: number;
  yearMonth: string;
  daysRemaining: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

const taskIcon = (type: string): any => {
  const map: Record<string, string> = {
    add_product: "plus-circle", share_vitrin: "share-2", create_collection: "folder-plus",
    follow_user: "user-plus", login: "log-in", review_product: "message-square", vote_product: "thumbs-up",
  };
  return map[type] || "check-circle";
};

export default function PanoScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const { user, accessToken } = useAuth();
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data: tasks, isLoading: tasksLoading } = useQuery<TasksData>({
    queryKey: ["tasks", user?.id],
    queryFn: () => authedFetch("tasks", accessToken!),
    enabled: !!accessToken,
  });

  const { data: pool } = useQuery<PoolStats>({
    queryKey: ["pool-stats"],
    queryFn: () => apiFetch("earnings/pool"),
  });

  const { data: myRank } = useQuery<MonthlyStats>({
    queryKey: ["my-rank", user?.id],
    queryFn: () => authedFetch(`rankings/my/${user!.id}`, accessToken!),
    enabled: !!user && !!accessToken,
  });

  const { data: streak } = useQuery<StreakData>({
    queryKey: ["streak", user?.id],
    queryFn: () => authedFetch("streak/me", accessToken!),
    enabled: !!accessToken,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["tasks"] }),
      qc.invalidateQueries({ queryKey: ["my-rank"] }),
      qc.invalidateQueries({ queryKey: ["streak"] }),
      qc.invalidateQueries({ queryKey: ["pool-stats"] }),
    ]);
    setRefreshing(false);
  }, [qc]);

  const completeTask = useMutation({
    mutationFn: async (taskType: string) => {
      const r = await fetch(`${API_BASE}/tasks/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ taskType }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["my-rank"] });
    },
    onError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  });

  const submitUrl = () => {
    if (!url.trim()) return;
    router.push({ pathname: "/url-ekle", params: { url: url.trim() } });
    setUrl("");
  };

  // Giriş yapılmamışsa
  if (!user) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: C.background }]}>
        <View style={{ paddingTop: insets.top + 20, paddingBottom: 120, paddingHorizontal: 16 }}>
          <Text style={[styles.pageTitle, { color: C.text }]}>Panosu</Text>
          <Text style={[styles.pageSub, { color: C.textSecondary }]}>Kişisel kontrol merkezin</Text>

          {/* URL Ekleme */}
          <View style={[styles.urlCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Yeni URL Ekle</Text>
            <Text style={[styles.cardSub, { color: C.textSecondary }]}>Ürün bağlantısı ekle, vitrinde sergile, kazan</Text>
            <View style={[styles.urlRow, { backgroundColor: C.background, borderColor: C.border }]}>
              <Feather name="link" size={17} color={C.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.urlInput, { color: C.text }]}
                placeholder="https://..."
                placeholderTextColor={C.textSecondary}
                value={url}
                onChangeText={setUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={submitUrl}
              />
              <Pressable
                onPress={submitUrl}
                style={[styles.urlBtn, { backgroundColor: Colors.primary, opacity: url ? 1 : 0.4 }]}
                disabled={!url}
              >
                <Feather name="arrow-right" size={17} color="#fff" />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.loginPrompt, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={() => router.push("/auth")}
          >
            <Feather name="log-in" size={28} color={Colors.primary} />
            <Text style={[styles.loginTitle, { color: C.text }]}>Giriş Yap & Kazan</Text>
            <Text style={[styles.loginSub, { color: C.textSecondary }]}>
              Günlük görevleri tamamla, puan kazan, aylık havuzdan pay al
            </Text>
            <View style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Giriş Yap / Kayıt Ol</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const progressPct = tasks ? Math.round((tasks.totalEarned / tasks.maxPossible) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={{ paddingTop: insets.top + 16, paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: C.textSecondary }]}>
              Merhaba, {user.displayName || user.email.split("@")[0]}
            </Text>
            <Text style={[styles.pageTitle, { color: C.text }]}>Panosum</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {user?.isChampion && (
              <View style={styles.champBadge}>
                <Feather name="award" size={13} color="#F59E0B" />
                <Text style={styles.champText}>Şampiyon</Text>
              </View>
            )}
            <Pressable
              style={[styles.iconBtn, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/bildirimler")}
            >
              <Feather name="bell" size={18} color={C.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* URL Ekleme */}
        <View style={[styles.urlCard, { backgroundColor: C.surface, borderColor: C.border, marginHorizontal: 16 }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Yeni URL Ekle</Text>
          <Text style={[styles.cardSub, { color: C.textSecondary }]}>Ürün bağlantısı ekle, vitrinde sergile, kazan</Text>
          <View style={[styles.urlRow, { backgroundColor: C.background, borderColor: C.border }]}>
            <Feather name="link" size={17} color={C.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.urlInput, { color: C.text }]}
              placeholder="https://..."
              placeholderTextColor={C.textSecondary}
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={submitUrl}
            />
            <Pressable
              onPress={submitUrl}
              style={[styles.urlBtn, { backgroundColor: Colors.primary, opacity: url ? 1 : 0.4 }]}
              disabled={!url}
            >
              <Feather name="arrow-right" size={17} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Kişisel İstatistikler */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Feather name="trending-up" size={18} color={Colors.primary} />
            <Text style={[styles.statValue, { color: C.text }]}>
              {myRank?.rank ? `#${myRank.rank}` : "—"}
            </Text>
            <Text style={[styles.statLabel, { color: C.textSecondary }]}>Bu Ay Sıra</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Feather name="zap" size={18} color="#8B5CF6" />
            <Text style={[styles.statValue, { color: C.text }]}>
              {(myRank?.totalPoints || 0).toLocaleString("tr-TR")}
            </Text>
            <Text style={[styles.statLabel, { color: C.textSecondary }]}>Puan</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Feather name="dollar-sign" size={18} color={Colors.light.green} />
            <Text style={[styles.statValue, { color: C.text }]}>
              {myRank?.estimatedEarnings
                ? `${myRank.estimatedEarnings.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺`
                : "0 ₺"}
            </Text>
            <Text style={[styles.statLabel, { color: C.textSecondary }]}>Tahmini</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Feather name="zap" size={18} color="#F59E0B" />
            <Text style={[styles.statValue, { color: C.text }]}>
              {streak?.currentStreak ?? 0}🔥
            </Text>
            <Text style={[styles.statLabel, { color: C.textSecondary }]}>Seri</Text>
          </View>
        </View>

        {/* Havuz Kartı */}
        {(pool || myRank) && (
          <View style={[styles.poolCard, { backgroundColor: Colors.primary + "12", borderColor: Colors.primary + "30", marginHorizontal: 16 }]}>
            <View style={styles.poolRow}>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name="dollar-sign" size={16} color={Colors.primary} />
                  <Text style={[styles.poolTitle, { color: Colors.primary }]}>Bu Ay Dağıtılacak Havuz</Text>
                </View>
                <Text style={[styles.poolAmount, { color: C.text }]}>
                  {(pool?.poolAmount || myRank?.poolAmount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
                </Text>
              </View>
              {myRank && (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.poolMetaLabel, { color: C.textSecondary }]}>Katılımcı</Text>
                  <Text style={[styles.poolMetaValue, { color: C.text }]}>{myRank.totalParticipants}</Text>
                  <Text style={[styles.poolMetaLabel, { color: C.textSecondary, marginTop: 4 }]}>Kalan Gün</Text>
                  <Text style={[styles.poolMetaValue, { color: C.text }]}>{myRank.daysRemaining}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.poolSub, { color: C.textSecondary }]}>
              Top 1000: %50 orantılı · 1001+: %40 eşit paylaşım
            </Text>
            {myRank?.rank && myRank.rank <= 1000 && (
              <View style={[styles.inPoolBadge, { backgroundColor: Colors.light.green + "20" }]}>
                <Feather name="check-circle" size={12} color={Colors.light.green} />
                <Text style={[styles.inPoolText, { color: Colors.light.green }]}>
                  Top 1000 havuzundasın ✓
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Günlük Görevler */}
        <View style={[styles.section, { marginHorizontal: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Günlük Görevler</Text>
            {tasks && (
              <Text style={[styles.sectionSub, { color: C.textSecondary }]}>
                {tasks.totalEarned}/{tasks.maxPossible} puan
              </Text>
            )}
          </View>

          {tasks && (
            <>
              <View style={[styles.progressBar, { backgroundColor: C.border }]}>
                <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: progressPct === 100 ? Colors.light.green : Colors.primary }]} />
              </View>
              {progressPct === 100 && (
                <Text style={[styles.allDoneText, { color: Colors.light.green }]}>
                  🎉 Tüm görevler tamamlandı!
                </Text>
              )}
            </>
          )}

          {tasksLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          ) : (
            tasks?.tasks.map(task => (
              <Pressable
                key={task.type}
                style={[styles.taskCard, { backgroundColor: C.card, borderColor: task.canComplete ? Colors.primary + "30" : C.border }]}
                onPress={() => {
                  if (!task.canComplete) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  completeTask.mutate(task.type);
                }}
              >
                <View style={[styles.taskIconWrap, { backgroundColor: task.canComplete ? Colors.primary + "20" : C.surface }]}>
                  <Feather name={taskIcon(task.type)} size={20} color={task.canComplete ? Colors.primary : C.textSecondary} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskLabel, { color: C.text }]}>{task.label}</Text>
                  <Text style={[styles.taskDesc, { color: C.textSecondary }]}>{task.description}</Text>
                  <Text style={[styles.taskProgress, { color: task.canComplete ? Colors.primary : C.textSecondary }]}>
                    {task.completedCount}/{task.maxPerDay} tamamlandı · +{task.points} puan
                  </Text>
                </View>
                {task.completedCount >= task.maxPerDay ? (
                  <Feather name="check-circle" size={22} color={Colors.light.green} />
                ) : (
                  <View style={[styles.doBtn, { backgroundColor: Colors.primary }]}>
                    <Feather name="plus" size={15} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Hızlı Bağlantılar */}
        <View style={[styles.section, { marginHorizontal: 16 }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Hızlı Erişim</Text>
          <View style={styles.quickGrid}>
            <Pressable
              style={[styles.quickBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/vitrin")}
            >
              <Feather name="shopping-bag" size={22} color={Colors.primary} />
              <Text style={[styles.quickLabel, { color: C.text }]}>Vitrinim</Text>
            </Pressable>
            <Pressable
              style={[styles.quickBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/siralama")}
            >
              <Feather name="award" size={22} color="#F59E0B" />
              <Text style={[styles.quickLabel, { color: C.text }]}>Sıralama</Text>
            </Pressable>
            <Pressable
              style={[styles.quickBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/bildirimler")}
            >
              <Feather name="bell" size={22} color="#8B5CF6" />
              <Text style={[styles.quickLabel, { color: C.text }]}>Bildirimler</Text>
            </Pressable>
            <Pressable
              style={[styles.quickBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/profil")}
            >
              <Feather name="user" size={22} color={Colors.light.green} />
              <Text style={[styles.quickLabel, { color: C.text }]}>Profilim</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 16, marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 2 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  pageSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  champBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "#F59E0B20", borderWidth: 1, borderColor: "#F59E0B50",
  },
  champText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#F59E0B" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  urlCard: { borderRadius: 20, padding: 18, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 3 },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12 },
  urlRow: { flexDirection: "row", alignItems: "center", borderRadius: 13, borderWidth: 1, paddingLeft: 12, paddingRight: 5, paddingVertical: 5 },
  urlInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 8 },
  urlBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  statCard: {
    flex: 1, minWidth: "44%", borderRadius: 16, borderWidth: 1, padding: 14,
    alignItems: "center", gap: 4,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  poolCard: { borderRadius: 20, padding: 18, borderWidth: 1, marginBottom: 16 },
  poolRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  poolTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  poolAmount: { fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 4 },
  poolMetaLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  poolMetaValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  poolSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  inPoolBadge: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10, padding: 8, borderRadius: 10 },
  inPoolText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 13, fontFamily: "Inter_500Medium" },
  progressBar: { height: 6, borderRadius: 3, marginBottom: 6, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  allDoneText: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  taskCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  taskIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  taskInfo: { flex: 1 },
  taskLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  taskDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 3 },
  taskProgress: { fontSize: 11, fontFamily: "Inter_500Medium" },
  doBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
  quickBtn: { flex: 1, minWidth: "44%", borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", gap: 8 },
  quickLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  loginPrompt: { marginTop: 16, borderRadius: 20, padding: 24, borderWidth: 1, alignItems: "center", gap: 8 },
  loginTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 4 },
  loginSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  loginBtn: { marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
