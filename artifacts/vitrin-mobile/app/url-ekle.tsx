import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image,
  ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

interface ScrapedProduct {
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  store?: string;
  currentPrice?: number;
}

type Step = "input" | "preview" | "manual" | "success";

export default function UrlEkle() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { accessToken, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const [url, setUrl] = useState((params.url as string) || "");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [scraped, setScraped] = useState<ScrapedProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedProduct, setSavedProduct] = useState<{ name: string } | null>(null);

  // Manuel giriş alanları
  const [manualName, setManualName] = useState("");
  const [manualBrand, setManualBrand] = useState("");
  const [manualCategory, setManualCategory] = useState("");

  const scrapeUrl = async () => {
    setErrorMsg("");
    if (!url.trim()) return;
    let validUrl = url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl;
    }
    try { new URL(validUrl); } catch {
      setErrorMsg("Geçerli bir URL gir (örn: https://trendyol.com/...)");
      return;
    }
    setUrl(validUrl);
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/scrape?url=${encodeURIComponent(validUrl)}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const d = await r.json();
      if (r.ok && d.name) {
        setScraped({ name: d.name, brand: d.brand, category: d.category, imageUrl: d.imageUrl, store: d.store, currentPrice: d.currentPrice });
        setStep("preview");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        setStep("manual");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      setStep("manual");
    }
    setLoading(false);
  };

  const saveProduct = async (data: { name: string; brand?: string; category?: string; imageUrl?: string; store?: string; currentPrice?: number }) => {
    if (!user || !accessToken) {
      setErrorMsg("URL eklemek için giriş yapman gerekiyor.");
      return;
    }
    setErrorMsg("");
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          name: data.name,
          brand: data.brand,
          category: data.category,
          imageUrl: data.imageUrl,
          store: data.store,
          storeUrl: url,
          originalPrice: data.currentPrice || 0,
          initialPrice: data.currentPrice || 0,
          currentPrice: data.currentPrice || 0,
        }),
      });
      if (r.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSavedProduct({ name: data.name });
        setStep("success");
      } else {
        const d = await r.json();
        setErrorMsg(d.error || "Ürün kaydedilemedi. Tekrar dene.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setErrorMsg("Bağlantı hatası. İnternet bağlantını kontrol et.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setSaving(false);
  };

  const handleManualSave = () => {
    if (!manualName.trim()) {
      setErrorMsg("Ürün adı zorunludur.");
      return;
    }
    saveProduct({ name: manualName.trim(), brand: manualBrand.trim() || undefined, category: manualCategory.trim() || undefined });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.handle, { backgroundColor: C.border }]} />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}>

        {/* Hata Mesajı */}
        {errorMsg ? (
          <View style={[styles.errorBox, { backgroundColor: "#EF444415", borderColor: "#EF444440" }]}>
            <Feather name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* BAŞARI EKRANI */}
        {step === "success" && (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: "#10B98120" }]}>
              <Feather name="check-circle" size={48} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: C.text }]}>Vitrine Eklendi!</Text>
            <Text style={[styles.successSub, { color: C.textSecondary }]} numberOfLines={2}>
              "{savedProduct?.name}" vitrininde yayınlandı.{"\n"}Tıklanınca puan kazanmaya başladın!
            </Text>
            <View style={[styles.successTip, { backgroundColor: Colors.primary + "15", borderColor: Colors.primary + "30" }]}>
              <Feather name="zap" size={14} color={Colors.primary} />
              <Text style={[styles.successTipText, { color: Colors.primary }]}>
                Sosyal medyada paylaşırsan dışarıdan gelen tıklamalar 2x puan verir!
              </Text>
            </View>
            <Pressable
              style={[styles.btn, { backgroundColor: Colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            >
              <Feather name="arrow-left" size={18} color="#fff" />
              <Text style={styles.btnText}>Vitrinim'e Dön</Text>
            </Pressable>
            <Pressable
              style={[styles.outlineBtn, { borderColor: C.border }]}
              onPress={() => { setStep("input"); setUrl(""); setScraped(null); setErrorMsg(""); setSavedProduct(null); }}
            >
              <Text style={[styles.outlineBtnText, { color: C.textSecondary }]}>Başka URL Ekle</Text>
            </Pressable>
          </View>
        )}

        {/* URL Input Adımı */}
        {step === "input" && (
          <>
            <Text style={[styles.title, { color: C.text }]}>URL Ekle</Text>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>
              Trendyol, Hepsiburada, Amazon, n11 ve diğer tüm sitelerin ürün linklerini ekleyebilirsin.
            </Text>

            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="link" size={18} color={C.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="https://trendyol.com/..."
                placeholderTextColor={C.textSecondary}
                value={url}
                onChangeText={setUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                returnKeyType="go"
                onSubmitEditing={scrapeUrl}
              />
              {url.length > 0 && (
                <Pressable onPress={() => setUrl("")} hitSlop={8}>
                  <Feather name="x" size={18} color={C.textSecondary} />
                </Pressable>
              )}
            </View>

            <View style={[styles.infoChip, { backgroundColor: Colors.primary + "15", borderColor: Colors.primary + "30" }]}>
              <Feather name="zap" size={14} color={Colors.primary} />
              <Text style={[styles.infoText, { color: Colors.primary }]}>
                Sosyal medyadan paylaştığın linkten gelen her tıklama 2x puan kazandırır!
              </Text>
            </View>

            <Pressable
              style={[styles.btn, { backgroundColor: Colors.primary, opacity: !url.trim() || loading ? 0.5 : 1 }]}
              onPress={scrapeUrl}
              disabled={!url.trim() || loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.btnText}>Ürün bilgisi okunuyor...</Text>
                </>
              ) : (
                <>
                  <Feather name="search" size={18} color="#fff" />
                  <Text style={styles.btnText}>Ürünü Oku ve Ekle</Text>
                </>
              )}
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={[styles.cancelText, { color: C.textSecondary }]}>İptal</Text>
            </Pressable>
          </>
        )}

        {/* Scrape Önizleme */}
        {step === "preview" && scraped && (
          <>
            <Pressable style={styles.backRow} onPress={() => setStep("input")}>
              <Feather name="arrow-left" size={16} color={C.textSecondary} />
              <Text style={[styles.backText, { color: C.textSecondary }]}>URL'yi değiştir</Text>
            </Pressable>

            <Text style={[styles.title, { color: C.text }]}>Ürün Onayı</Text>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>Bu ürünü vitrine eklemek istiyor musun?</Text>

            <View style={[styles.productCard, { backgroundColor: C.card, borderColor: C.border }]}>
              {scraped.imageUrl ? (
                <Image source={{ uri: scraped.imageUrl }} style={styles.productImg} resizeMode="cover" />
              ) : (
                <View style={[styles.productImg, { backgroundColor: "#EF444415", alignItems: "center", justifyContent: "center" }]}>
                  <Feather name="image" size={32} color="#EF4444" />
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: C.text }]} numberOfLines={3}>{scraped.name}</Text>
                {!scraped.imageUrl && (
                  <Text style={{ color: "#EF4444", fontSize: 11, marginBottom: 4 }}>⚠ Resim çekilemedi — eklenemiyor</Text>
                )}
                {scraped.brand && <Text style={[styles.productMeta, { color: C.textSecondary }]}>{scraped.brand}</Text>}
                {scraped.store && (
                  <View style={[styles.storeBadge, { backgroundColor: Colors.primary + "20" }]}>
                    <Feather name="shopping-cart" size={11} color={Colors.primary} />
                    <Text style={[styles.storeText, { color: Colors.primary }]}>{scraped.store}</Text>
                  </View>
                )}
                {scraped.currentPrice ? (
                  <Text style={[styles.priceText, { color: C.text }]}>
                    {scraped.currentPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </Text>
                ) : null}
              </View>
            </View>

            <Pressable
              style={[styles.btn, { backgroundColor: Colors.light.green, opacity: (saving || !scraped.imageUrl) ? 0.5 : 1 }]}
              onPress={() => saveProduct(scraped)}
              disabled={saving || !scraped.imageUrl}
            >
              {saving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={styles.btnText}>Vitrine Ekle</Text>
                </>
              )}
            </Pressable>

            <Pressable style={[styles.outlineBtn, { borderColor: C.border }]} onPress={() => setStep("manual")}>
              <Text style={[styles.outlineBtnText, { color: C.textSecondary }]}>Bilgileri Düzenle</Text>
            </Pressable>
          </>
        )}

        {/* Manuel Giriş */}
        {step === "manual" && (
          <>
            <Pressable style={styles.backRow} onPress={() => setStep("input")}>
              <Feather name="arrow-left" size={16} color={C.textSecondary} />
              <Text style={[styles.backText, { color: C.textSecondary }]}>Geri</Text>
            </Pressable>

            <Text style={[styles.title, { color: C.text }]}>Ürün Bilgileri</Text>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>
              Ürün bilgileri otomatik okunamadı. Lütfen elle gir.
            </Text>

            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="package" size={18} color={C.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Ürün adı *"
                placeholderTextColor={C.textSecondary}
                value={manualName}
                onChangeText={setManualName}
                autoFocus
              />
            </View>

            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="tag" size={18} color={C.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Marka (opsiyonel)"
                placeholderTextColor={C.textSecondary}
                value={manualBrand}
                onChangeText={setManualBrand}
              />
            </View>

            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="grid" size={18} color={C.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Kategori (opsiyonel)"
                placeholderTextColor={C.textSecondary}
                value={manualCategory}
                onChangeText={setManualCategory}
              />
            </View>

            <View style={[styles.urlPreview, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="link" size={13} color={C.textSecondary} />
              <Text style={[styles.urlText, { color: C.textSecondary }]} numberOfLines={1}>{url}</Text>
            </View>

            <Pressable
              style={[styles.btn, { backgroundColor: Colors.primary, opacity: saving || !manualName.trim() ? 0.5 : 1 }]}
              onPress={handleManualSave}
              disabled={saving || !manualName.trim()}
            >
              {saving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Feather name="plus" size={18} color="#fff" />
                  <Text style={styles.btnText}>Vitrine Ekle</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 20 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  infoChip: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, padding: 18, marginBottom: 10 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  outlineBtn: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", marginBottom: 8 },
  outlineBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  cancelBtn: { alignItems: "center", padding: 16 },
  cancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  productCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  productImg: { width: "100%", height: 200 },
  productInfo: { padding: 16, gap: 6 },
  productName: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 22 },
  productMeta: { fontSize: 13, fontFamily: "Inter_400Regular" },
  storeBadge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  storeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  priceText: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 4 },
  urlPreview: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 16 },
  urlText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#EF4444" },
  successContainer: { alignItems: "center", gap: 14, paddingTop: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  successTip: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 14, borderWidth: 1, padding: 14, width: "100%" },
  successTipText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
});
