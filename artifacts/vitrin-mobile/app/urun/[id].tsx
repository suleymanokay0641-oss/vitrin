import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  Image, ActivityIndicator, useColorScheme, Alert, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

type VoteColor = "green" | "yellow" | "red";

function StarRow({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Pressable key={s} onPress={() => onChange?.(s)} disabled={!onChange}>
          <Feather
            name={s <= rating ? "star" : "star"}
            size={24}
            color={s <= rating ? "#F59E0B" : "#D1D5DB"}
          />
        </Pressable>
      ))}
    </View>
  );
}

export default function UrunDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const qc = useQueryClient();
  const productId = parseInt(id || "0");

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: product, isLoading: pLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/products/${productId}`);
      if (!r.ok) throw new Error("Ürün bulunamadı");
      return r.json();
    },
    enabled: productId > 0,
  });

  const { data: reviews, isLoading: rLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetch(`${API_BASE}/products/${productId}/reviews`).then(r => r.json()),
    enabled: productId > 0,
  });

  const { data: votes } = useQuery({
    queryKey: ["votes", productId],
    queryFn: () => fetch(`${API_BASE}/products/${productId}/votes`).then(r => r.json()),
    enabled: productId > 0,
  });

  const addReview = useMutation({
    mutationFn: async () => {
      if (!reviewText.trim() || reviewText.trim().length < 10) {
        throw new Error("Yorum en az 10 karakter olmalı");
      }
      const name = user?.displayName || user?.email?.split("@")[0] || "Kullanıcı";
      const r = await fetch(`${API_BASE}/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ authorName: name, rating: reviewRating, comment: reviewText.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Yorum eklenemedi");

      // Görev tamamla: review_product
      if (accessToken) {
        fetch(`${API_BASE}/tasks/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ taskType: "review_product" }),
        }).catch(() => {});
      }
      return d;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: any) => {
      Alert.alert("Hata", e.message || "Yorum eklenemedi");
    },
  });

  const addVote = useMutation({
    mutationFn: async (color: VoteColor) => {
      const sessionId = user ? `user-${user.id}-${productId}` : `anon-${productId}-${Math.random().toString(36).slice(2, 10)}`;
      const r = await fetch(`${API_BASE}/products/${productId}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ color, sessionId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Oy verilemedi");

      // Görev tamamla: vote_product
      if (accessToken) {
        fetch(`${API_BASE}/tasks/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ taskType: "vote_product" }),
        }).catch(() => {});
      }
      return d;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["votes", productId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: any) => Alert.alert("Hata", e.message),
  });

  if (pLoading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Feather name="alert-circle" size={40} color={C.textSecondary} />
        <Text style={[styles.emptyText, { color: C.textSecondary }]}>Ürün bulunamadı</Text>
      </View>
    );
  }

  const displayPrice = product.displayPrice || product.originalPrice;

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: C.background, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]} numberOfLines={1}>Ürün Detayı</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Ürün Görseli */}
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="contain" />
      ) : (
        <View style={[styles.productImage, { backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }]}>
          <Feather name="shopping-bag" size={60} color={C.textSecondary} />
        </View>
      )}

      <View style={{ paddingHorizontal: 16 }}>
        {/* Ürün Bilgileri */}
        <View style={[styles.infoCard, { backgroundColor: C.card, borderColor: C.border }]}>
          {product.store && (
            <View style={[styles.storePill, { backgroundColor: Colors.primary + "15" }]}>
              <Feather name="external-link" size={11} color={Colors.primary} />
              <Text style={[styles.storeText, { color: Colors.primary }]}>{product.store}</Text>
            </View>
          )}
          <Text style={[styles.productName, { color: C.text }]}>{product.name}</Text>
          {displayPrice > 0 && (
            <Text style={[styles.productPrice, { color: Colors.primary }]}>
              {displayPrice.toLocaleString("tr-TR")} TL
            </Text>
          )}
          <Pressable
            style={[styles.goBtn, { backgroundColor: Colors.primary }]}
            onPress={() => {
              if (product.storeUrl) Linking.openURL(product.storeUrl);
            }}
          >
            <Feather name="shopping-cart" size={16} color="#fff" />
            <Text style={styles.goBtnText}>Mağazaya Git</Text>
          </Pressable>
        </View>

        {/* Oy Bölümü */}
        <View style={[styles.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Ürünü Değerlendir</Text>
          {votes && votes.total > 0 && (
            <View style={styles.voteBar}>
              {votes.green > 0 && (
                <View style={[styles.voteSegment, { flex: votes.green, backgroundColor: "#10B981" }]} />
              )}
              {votes.yellow > 0 && (
                <View style={[styles.voteSegment, { flex: votes.yellow, backgroundColor: "#F59E0B" }]} />
              )}
              {votes.red > 0 && (
                <View style={[styles.voteSegment, { flex: votes.red, backgroundColor: "#EF4444" }]} />
              )}
            </View>
          )}
          {votes && (
            <Text style={[styles.voteCount, { color: C.textSecondary }]}>
              {votes.total} oy · %{votes.greenPct} olumlu
            </Text>
          )}
          <View style={styles.voteButtons}>
            {([
              { color: "green" as VoteColor, icon: "thumbs-up", label: "İyi", bg: "#10B98115", fg: "#10B981" },
              { color: "yellow" as VoteColor, icon: "minus-circle", label: "Orta", bg: "#F59E0B15", fg: "#F59E0B" },
              { color: "red" as VoteColor, icon: "thumbs-down", label: "Kötü", bg: "#EF444415", fg: "#EF4444" },
            ] as const).map(v => (
              <Pressable
                key={v.color}
                style={[styles.voteBtn, { backgroundColor: v.bg, borderColor: v.fg + "40" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  addVote.mutate(v.color);
                }}
                disabled={addVote.isPending}
              >
                <Feather name={v.icon as any} size={18} color={v.fg} />
                <Text style={[styles.voteBtnText, { color: v.fg }]}>{v.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Yorum Bölümü */}
        <View style={[styles.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.reviewHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              Yorumlar {reviews?.total ? `(${reviews.total})` : ""}
            </Text>
            {reviews?.avgRating > 0 && (
              <View style={styles.avgRating}>
                <Feather name="star" size={14} color="#F59E0B" />
                <Text style={[styles.avgRatingText, { color: C.text }]}>{reviews.avgRating}</Text>
              </View>
            )}
          </View>

          {/* Yorum Formu */}
          {showReviewForm ? (
            <View style={[styles.reviewForm, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.formLabel, { color: C.textSecondary }]}>Puanın:</Text>
              <StarRow rating={reviewRating} onChange={setReviewRating} />
              <Text style={[styles.formLabel, { color: C.textSecondary }]}>Yorumun:</Text>
              <TextInput
                style={[styles.reviewInput, { backgroundColor: C.background, borderColor: C.border, color: C.text }]}
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="En az 10 karakter yorum yazın..."
                placeholderTextColor={C.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.formButtons}>
                <Pressable style={[styles.cancelBtn, { borderColor: C.border }]} onPress={() => setShowReviewForm(false)}>
                  <Text style={{ color: C.textSecondary }}>İptal</Text>
                </Pressable>
                <Pressable
                  style={[styles.submitBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => addReview.mutate()}
                  disabled={addReview.isPending}
                >
                  {addReview.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Gönder</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.addReviewBtn, { borderColor: Colors.primary + "40", backgroundColor: Colors.primary + "08" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReviewForm(true);
              }}
            >
              <Feather name="edit-2" size={16} color={Colors.primary} />
              <Text style={[styles.addReviewText, { color: Colors.primary }]}>Yorum Yaz (+8 puan)</Text>
            </Pressable>
          )}

          {/* Yorum Listesi */}
          {rLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />
          ) : reviews?.reviews?.length > 0 ? (
            reviews.reviews.map((r: any, i: number) => (
              <View key={i} style={[styles.reviewItem, { borderTopColor: C.border }]}>
                <View style={styles.reviewTop}>
                  <Text style={[styles.reviewAuthor, { color: C.text }]}>{r.authorName}</Text>
                  <StarRow rating={r.rating} />
                </View>
                <Text style={[styles.reviewComment, { color: C.textSecondary }]}>{r.comment}</Text>
                {r.tag && (
                  <View style={[styles.reviewTag, { backgroundColor: Colors.primary + "15" }]}>
                    <Text style={[styles.reviewTagText, { color: Colors.primary }]}>{r.tag}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.noReviews, { color: C.textSecondary }]}>
              Henüz yorum yok — ilk yorumu sen yaz!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  productImage: { width: "100%", height: 280 },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 16, gap: 8 },
  storePill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  storeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  productName: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 26 },
  productPrice: { fontSize: 22, fontFamily: "Inter_700Bold" },
  goBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 12, marginTop: 4 },
  goBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 16, gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  voteBar: { flexDirection: "row", borderRadius: 8, overflow: "hidden", height: 8 },
  voteSegment: { height: 8 },
  voteCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  voteButtons: { flexDirection: "row", gap: 8 },
  voteBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  voteBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avgRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  avgRatingText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  addReviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  addReviewText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewForm: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8 },
  formLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  reviewInput: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80 },
  formButtons: { flexDirection: "row", gap: 8, marginTop: 4 },
  cancelBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  submitBtn: { flex: 2, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  submitBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewItem: { paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  reviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewAuthor: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewComment: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  reviewTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  reviewTagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  noReviews: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});
