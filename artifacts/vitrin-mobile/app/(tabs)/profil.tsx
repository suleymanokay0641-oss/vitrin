import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  ActivityIndicator, useColorScheme, Modal, Platform, Share, Linking, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";

function formatUserDisplay(email: string): { label: string; isPhone: boolean } {
  if (email.endsWith("@vitrin.phone")) {
    const digits = email.replace("@vitrin.phone", "");
    const formatted = digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    return { label: formatted || digits, isPhone: true };
  }
  return { label: email, isPhone: false };
}

export default function ProfilTab() {
  const insets = useSafeAreaInsets();
  const { user, logout, loading, accessToken, refreshUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSocial, setEditSocial] = useState("");
  const [editError, setEditError] = useState("");

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
    setLoggingOut(false);
    setShowLogoutConfirm(false);
  };

  const openEdit = () => {
    setEditName(user?.displayName || "");
    setEditBio((user as any)?.bio || "");
    setEditSocial((user as any)?.socialLink || "");
    setEditError("");
    setShowEditModal(true);
  };

  const editMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ displayName: editName, bio: editBio, socialLink: editSocial }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Güncellenemedi");
      return d;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refreshUser();
      setShowEditModal(false);
    },
    onError: (e: Error) => setEditError(e.message),
  });

  const MenuItem = ({ icon, label, onPress, danger = false }: { icon: any; label: string; onPress: () => void; danger?: boolean }) => (
    <Pressable
      style={[styles.menuItem, { backgroundColor: C.card, borderColor: C.border }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? "#EF444420" : Colors.primary + "20" }]}>
        <Feather name={icon} size={18} color={danger ? "#EF4444" : Colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? "#EF4444" : C.text }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={C.textSecondary} />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: C.background, paddingTop: insets.top }]}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + "20" }]}>
          <Feather name="user" size={36} color={Colors.primary} />
        </View>
        <Text style={[styles.guestTitle, { color: C.text }]}>Vitrin'e Hoş Geldin</Text>
        <Text style={[styles.guestSub, { color: C.textSecondary }]}>
          URL ekle, puan kazan, aylık havuzdan pay al
        </Text>
        <Pressable
          style={[styles.loginBtn, { backgroundColor: Colors.primary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/auth"); }}
        >
          <Feather name="log-in" size={18} color="#fff" />
          <Text style={styles.loginBtnText}>Giriş Yap / Kayıt Ol</Text>
        </Pressable>
        <View style={[styles.featureList, { borderColor: C.border }]}>
          {[
            { icon: "dollar-sign", text: "Aylık gelir havuzundan pay al" },
            { icon: "star", text: "Puan kazan, sıralamaya gir" },
            { icon: "folder", text: "Koleksiyonlar oluştur" },
            { icon: "users", text: "Takipçi kazan, etki büyüt" },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.featureRow}>
              <Feather name={icon as any} size={16} color={Colors.primary} />
              <Text style={[styles.featureText, { color: C.textSecondary }]}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  const { label: contactLabel, isPhone } = formatUserDisplay(user.email);
  const username = user.displayName?.toLowerCase().replace(/\s+/g, "") || (isPhone ? `kullanici${user.id}` : user.email.split("@")[0]);
  const loyaltyBonus = Math.min((user.loyaltyMonths || 0) * 2, 20);
  const bio = (user as any)?.bio;
  const socialLink = (user as any)?.socialLink;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.background }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ paddingTop: insets.top + 16, paddingBottom: 120 }}>
          {/* Profil Başlık */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatarLarge, { backgroundColor: Colors.primary + "20" }]}>
              <Text style={[styles.avatarTextLarge, { color: Colors.primary }]}>
                {(user.displayName || username).charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.profileName, { color: C.text }]}>{user.displayName || username}</Text>

            {/* Bio */}
            {bio ? (
              <Text style={[styles.bio, { color: C.textSecondary }]}>{bio}</Text>
            ) : null}

            {/* Sosyal medya linki */}
            {socialLink ? (
              <Pressable style={styles.socialRow}>
                <Feather name="link" size={13} color={Colors.primary} />
                <Text style={[styles.socialText, { color: Colors.primary }]} numberOfLines={1}>{socialLink.replace(/^https?:\/\//, "")}</Text>
              </Pressable>
            ) : null}

            {/* E-posta veya Telefon */}
            <View style={styles.contactRow}>
              <Feather name={isPhone ? "phone" : "mail"} size={13} color={C.textSecondary} />
              <Text style={[styles.profileEmail, { color: C.textSecondary }]}>{contactLabel}</Text>
            </View>

            <View style={styles.badgeRow}>
              {user.isChampion && (
                <View style={styles.badge}>
                  <Feather name="award" size={12} color="#F59E0B" />
                  <Text style={styles.badgeText}>Şampiyon 2x</Text>
                </View>
              )}
              {loyaltyBonus > 0 && (
                <View style={[styles.badge, { backgroundColor: "#3B82F620", borderColor: "#3B82F640" }]}>
                  <Feather name="zap" size={12} color="#3B82F6" />
                  <Text style={[styles.badgeText, { color: "#3B82F6" }]}>+{loyaltyBonus}% Bonus</Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Feather name="calendar" size={12} color={C.textSecondary} />
                <Text style={[styles.badgeText, { color: C.textSecondary }]}>{user.loyaltyMonths || 0} ay üye</Text>
              </View>
            </View>

            {/* Profil Düzenle Butonu */}
            <Pressable
              style={[styles.editBtn, { borderColor: C.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openEdit(); }}
            >
              <Feather name="edit-2" size={14} color={C.text} />
              <Text style={[styles.editBtnText, { color: C.text }]}>Profili Düzenle</Text>
            </Pressable>
          </View>

          {/* Menü */}
          {/* Admin Paneli — sadece admin kullanıcılara */}
          {user.role === "admin" && (
            <View style={[styles.section, { marginBottom: 0 }]}>
              <Pressable
                style={[styles.adminCard, { backgroundColor: Colors.primary + "12", borderColor: Colors.primary + "30" }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/admin"); }}
              >
                <View style={[styles.adminIconBox, { backgroundColor: Colors.primary + "20" }]}>
                  <Feather name="shield" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminTitle, { color: Colors.primary }]}>Yönetim Paneli</Text>
                  <Text style={[styles.adminSub, { color: Colors.primary + "AA" }]}>Kullanıcılar · Havuz · Para çekme</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.primary} />
              </Pressable>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>HESAP</Text>
            <MenuItem icon="shopping-bag" label="Vitrinim" onPress={() => router.push({ pathname: "/vitrin/[username]", params: { username } })} />
            <MenuItem icon="bell" label="Bildirimler" onPress={() => router.push("/bildirimler")} />
            <MenuItem icon="folder" label="Koleksiyonlarım" onPress={() => {}} />
            <MenuItem icon="dollar-sign" label="Cüzdanım" onPress={() => router.push("/cuzdan")} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>KAZANÇ MODELİ</Text>
            <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.infoTitle, { color: C.text }]}>Nasıl Kazanırsın?</Text>
              {[
                "Ürün URL'i ekle → Tıklama puanı kazan",
                "Günlük görevleri tamamla → Aktivite puanı",
                "Top 1000'e gir → Havuzun %50'sinden orantılı pay",
                "Dışarıdan tıklanma = 2x puan (sosyal medya paylaşımı)",
                "Her ay kayıt ödülü Pro gelirinin %50'si",
              ].map((item, i) => (
                <View key={i} style={styles.infoRow}>
                  <Feather name="check" size={14} color={Colors.light.green} />
                  <Text style={[styles.infoText, { color: C.textSecondary }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>UYGULAMA</Text>
            <MenuItem
              icon="layers"
              label="Koleksiyonlarım"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/koleksiyon/listele" as any);
              }}
            />
            <MenuItem
              icon="star"
              label="Uygulamayı Değerlendir"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const storeUrl = Platform.OS === "ios"
                  ? "itms-apps://itunes.apple.com/app/id0000000000"
                  : "market://details?id=com.vitrin.app";
                Linking.canOpenURL(storeUrl).then(can => {
                  if (can) Linking.openURL(storeUrl);
                  else Alert.alert("Yakında", "Uygulama mağaza linki yakında aktif olacak!");
                });
              }}
            />
            <MenuItem
              icon="share-2"
              label="Arkadaşına Anlat"
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const msg = "Vitrin'i kullanıyorum — ürün paylaşıp para kazanıyorum! Sen de katıl 🛍️\nhttps://vitrin-profil.replit.app";
                try {
                  if (Platform.OS === "web") {
                    if (navigator?.share) await navigator.share({ title: "Vitrin", text: msg });
                    else alert(msg);
                  } else {
                    await Share.share({ message: msg });
                  }
                } catch {}
              }}
            />
            <MenuItem
              icon="help-circle"
              label="Yardım"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  "Nasıl Çalışır?",
                  "1. Ürün URL'si ekle\n2. Vitrinini paylaş\n3. Tıklama ve aktivitelerle puan kazan\n4. Ay sonunda havuzdan pay al\n\nTop 1000: %50 havuz (orantılı)\n1001+: %40 havuz (eşit)\n\nSorun için: destek@vitrin.app",
                  [{ text: "Tamam" }]
                );
              }}
            />
          </View>

          <View style={styles.section}>
            <MenuItem icon="log-out" label="Çıkış Yap" onPress={handleLogout} danger />
          </View>

          <Text style={[styles.version, { color: C.textSecondary }]}>Vitrin v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Profil Düzenle Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.editOverlay}>
          <View style={[styles.editSheet, { backgroundColor: C.background }]}>
            <View style={[styles.editHandle, { backgroundColor: C.border }]} />
            <View style={styles.editHeader}>
              <Text style={[styles.editTitle, { color: C.text }]}>Profili Düzenle</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <Feather name="x" size={22} color={C.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              {/* İsim */}
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Görünen Ad</Text>
              <View style={[styles.fieldInput, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Feather name="user" size={16} color={C.textSecondary} />
                <TextInput
                  style={[styles.input, { color: C.text }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Adın veya takma adın"
                  placeholderTextColor={C.textSecondary}
                  maxLength={50}
                />
              </View>

              {/* Bio */}
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Hakkında (maks. 200 karakter)</Text>
              <View style={[styles.fieldInput, { backgroundColor: C.surface, borderColor: C.border, alignItems: "flex-start", paddingVertical: 12, minHeight: 90 }]}>
                <TextInput
                  style={[styles.input, { color: C.text, paddingTop: 0 }]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Kendinden biraz bahset..."
                  placeholderTextColor={C.textSecondary}
                  multiline
                  maxLength={200}
                />
              </View>
              <Text style={[styles.charCount, { color: C.textSecondary }]}>{editBio.length}/200</Text>

              {/* Sosyal Link */}
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Sosyal Medya Linki</Text>
              <View style={[styles.fieldInput, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Feather name="link" size={16} color={C.textSecondary} />
                <TextInput
                  style={[styles.input, { color: C.text }]}
                  value={editSocial}
                  onChangeText={setEditSocial}
                  placeholder="https://instagram.com/..."
                  placeholderTextColor={C.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              {editError ? (
                <Text style={styles.errorText}>{editError}</Text>
              ) : null}

              <Pressable
                style={[styles.saveBtn, { backgroundColor: Colors.primary, opacity: editMut.isPending ? 0.7 : 1 }]}
                onPress={() => editMut.mutate()}
                disabled={editMut.isPending}
              >
                {editMut.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Kaydet</Text>
                }
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Çıkış Onay Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLogoutConfirm(false)}>
          <Pressable style={[styles.modalBox, { backgroundColor: C.card, borderColor: C.border }]} onPress={() => {}}>
            <View style={[styles.modalIcon, { backgroundColor: "#EF444420" }]}>
              <Feather name="log-out" size={24} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: C.text }]}>Çıkış Yap</Text>
            <Text style={[styles.modalSub, { color: C.textSecondary }]}>
              Hesabından çıkmak istediğine emin misin?
            </Text>
            <Pressable
              style={[styles.modalBtn, { backgroundColor: "#EF4444", opacity: loggingOut ? 0.7 : 1 }]}
              onPress={confirmLogout}
              disabled={loggingOut}
            >
              {loggingOut
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalBtnText}>Evet, Çıkış Yap</Text>
              }
            </Pressable>
            <Pressable style={[styles.modalCancelBtn, { borderColor: C.border }]} onPress={() => setShowLogoutConfirm(false)}>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  guestTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 8 },
  guestSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  featureList: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 8, gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  profileHeader: { alignItems: "center", paddingHorizontal: 20, marginBottom: 24, gap: 6 },
  avatarLarge: { width: 88, height: 88, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarTextLarge: { fontSize: 40, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  bio: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  socialRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  socialText: { fontSize: 13, fontFamily: "Inter_500Medium", maxWidth: 200 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: "#F59E0B20", borderWidth: 1, borderColor: "#F59E0B40" },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#F59E0B" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, borderWidth: 1, marginTop: 10 },
  editBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  infoTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
  // Edit Modal
  editOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  editSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "90%" },
  editHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  editHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  editTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  fieldInput: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  charCount: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: -12, marginBottom: 16, marginRight: 4 },
  errorText: { color: "#EF4444", fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 12, textAlign: "center" },
  saveBtn: { borderRadius: 16, padding: 16, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  // Logout Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 32 },
  modalBox: { width: "100%", maxWidth: 340, borderRadius: 24, borderWidth: 1, padding: 28, alignItems: "center", gap: 10 },
  modalIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 8 },
  modalBtn: { width: "100%", borderRadius: 14, padding: 16, alignItems: "center" },
  modalBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  modalCancelBtn: { width: "100%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", marginTop: 4 },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  adminCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  adminIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  adminTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  adminSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
