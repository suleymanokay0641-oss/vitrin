import React from "react";
import {
  View, Text, StyleSheet, FlatList, Image, Pressable,
  ActivityIndicator, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

export default function KoleksiyonDetay() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const r = await fetch(`${API_BASE}/collections/${slug}`, { headers });
      if (!r.ok) throw new Error("Koleksiyon bulunamadı");
      return r.json();
    },
    enabled: !!slug,
  });

  if (isLoading) return (
    <View style={[styles.center, { backgroundColor: C.background }]}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );

  if (!data) return (
    <View style={[styles.center, { backgroundColor: C.background }]}>
      <Feather name="alert-circle" size={40} color={C.textSecondary} />
      <Text style={[styles.errorText, { color: C.text }]}>Koleksiyon bulunamadı</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]} numberOfLines={1}>{data.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={data.items || []}
        keyExtractor={(item: any) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }}
        columnWrapperStyle={{ gap: 10 }}
        ListHeaderComponent={
          data.description ? (
            <Text style={[styles.description, { color: C.textSecondary }]}>{data.description}</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Feather name="package" size={40} color={C.textSecondary} />
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>Bu koleksiyonda ürün yok</Text>
          </View>
        }
        renderItem={({ item }: { item: any }) => (
          <View style={[styles.productCard, { backgroundColor: C.card, borderColor: C.border }]}>
            {item.product?.imageUrl ? (
              <Image source={{ uri: item.product.imageUrl }} style={styles.productImg} />
            ) : (
              <View style={[styles.productImg, { backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }]}>
                <Feather name="shopping-bag" size={28} color={C.textSecondary} />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: C.text }]} numberOfLines={2}>{item.product?.name}</Text>
              {item.product?.brand && (
                <Text style={[styles.productBrand, { color: C.textSecondary }]}>{item.product.brand}</Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 16 },
  productCard: { flex: 1, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  productImg: { width: "100%", height: 140 },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  productBrand: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  errorText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
});
