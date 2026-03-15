import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable,
  Image, ActivityIndicator, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { apiFetch } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  store: string | null;
  storeUrl: string | null;
}

interface SearchResult {
  products: Product[];
  total: number;
}

export default function KesifTab() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data, isLoading } = useQuery<SearchResult>({
    queryKey: ["search", debouncedQuery],
    queryFn: () => apiFetch(`products?search=${encodeURIComponent(debouncedQuery)}&limit=20`),
    enabled: debouncedQuery.length > 1,
  });

  const { data: popularData, isLoading: popularLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["popular-products"],
    queryFn: () => apiFetch("products?limit=20&sort=popular"),
    enabled: debouncedQuery.length < 2,
  });

  const products = debouncedQuery.length > 1 ? (data?.products || []) : (popularData?.products || []);
  const loading = debouncedQuery.length > 1 ? isLoading : popularLoading;

  let searchTimeout: ReturnType<typeof setTimeout>;
  const handleSearch = (text: string) => {
    setQuery(text);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => setDebouncedQuery(text), 400);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      style={[styles.productCard, { backgroundColor: C.card, borderColor: C.border }]}
      onPress={() => router.push({ pathname: "/vitrin/[username]", params: { username: "search" } })}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, { backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }]}>
          <Feather name="package" size={28} color={C.textSecondary} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: C.text }]} numberOfLines={2}>{item.name}</Text>
        {item.brand && <Text style={[styles.productBrand, { color: C.textSecondary }]}>{item.brand}</Text>}
        {item.category && (
          <View style={[styles.categoryBadge, { backgroundColor: Colors.primary + "20" }]}>
            <Text style={[styles.categoryText, { color: Colors.primary }]}>{item.category}</Text>
          </View>
        )}
        {item.store && (
          <Text style={[styles.storeName, { color: C.textSecondary }]}>
            <Feather name="shopping-cart" size={11} /> {item.store}
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={16} color={C.textSecondary} />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { paddingTop: insets.top + 12, backgroundColor: C.background }]}>
        <View style={[styles.searchInput, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Feather name="search" size={18} color={C.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.input, { color: C.text }]}
            placeholder="Ürün, marka veya kategori ara..."
            placeholderTextColor={C.textSecondary}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setDebouncedQuery(""); }}>
              <Feather name="x" size={18} color={C.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : products.length === 0 && debouncedQuery.length > 1 ? (
        <View style={styles.center}>
          <Feather name="search" size={40} color={C.textSecondary} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>Sonuç bulunamadı</Text>
          <Text style={[styles.emptySub, { color: C.textSecondary }]}>Farklı anahtar kelimeler dene</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProduct}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 8, paddingTop: 12 }}
          ListHeaderComponent={
            <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>
              {debouncedQuery.length > 1 ? `"${debouncedQuery}" için ${data?.total || products.length} sonuç` : "Öne Çıkan Ürünler"}
            </Text>
          }
          scrollEnabled={products.length > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { paddingHorizontal: 16, paddingBottom: 12 },
  searchInput: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 8 },
  productCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  productImage: { width: 80, height: 80 },
  productInfo: { flex: 1, padding: 12, gap: 3 },
  productName: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  productBrand: { fontSize: 12, fontFamily: "Inter_400Regular" },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  categoryText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  storeName: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
