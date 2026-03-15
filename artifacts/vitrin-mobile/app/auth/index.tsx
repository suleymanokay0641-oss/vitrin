import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, useColorScheme, Alert, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";

type Mode = "login" | "register" | "otp";
type Method = "email" | "phone";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, verifyEmail } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null); // dev modda kodu göster
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP input refs
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const handleOtpDigit = (val: string, idx: number) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[idx] = clean;
    setOtpDigits(newDigits);
    setOtp(newDigits.join(""));
    if (clean && idx < 5) otpRefs[idx + 1]?.current?.focus();
    if (!clean && idx > 0) otpRefs[idx - 1]?.current?.focus();
  };

  const handleLogin = async () => {
    setError("");
    const identifier = method === "email" ? email.trim() : phone.trim();
    if (!identifier || !password) { setError("Tüm alanları doldur"); return; }
    setLoading(true);
    // Telefon ile girişte email formatına çevir (backend email bazlı)
    const loginEmail = method === "phone" ? `${phone.replace(/\D/g, "")}@vitrin.phone` : email.trim();
    const result = await login(loginEmail, password);
    setLoading(false);
    if (result.error) {
      if (result.requiresVerification && result.userId) {
        setUserId(result.userId);
        setMode("otp");
      } else {
        setError(result.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  const handleRegister = async () => {
    setError("");
    if (mode === "register" && method === "email") {
      if (!email.trim()) { setError("E-posta adresini gir"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Geçersiz e-posta adresi"); return; }
    }
    if (mode === "register" && method === "phone") {
      if (!phone.trim() || phone.replace(/\D/g, "").length < 10) { setError("Geçerli telefon numarası gir"); return; }
    }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı"); return; }
    setLoading(true);

    const registerEmail = method === "phone"
      ? `${phone.replace(/\D/g, "")}@vitrin.phone`
      : email.trim();

    const result = await register({
      email: registerEmail,
      password,
      displayName: displayName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setUserId(result.userId!);
      if (result.devOtp) {
        setDevOtpCode(result.devOtp); // Geliştirme modunda kodu göster
      }
      setMode("otp");
    }
  };

  const handleOtp = async () => {
    if (!userId || otp.length !== 6) return;
    setError("");
    setLoading(true);
    const result = await verifyEmail(userId, otp);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtp("");
      otpRefs[0]?.current?.focus();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setEmail("");
    setPhone("");
    setPassword("");
  };

  const InputField = ({
    icon, placeholder, value, onChange, type = "default", secure = false, autoFocus = false,
  }: {
    icon: any; placeholder: string; value: string; onChange: (v: string) => void;
    type?: any; secure?: boolean; autoFocus?: boolean;
  }) => (
    <View style={[styles.inputWrap, { backgroundColor: C.surface, borderColor: error ? "#EF444440" : C.border }]}>
      <Feather name={icon} size={18} color={C.textSecondary} style={{ marginRight: 10 }} />
      <TextInput
        style={[styles.textInput, { color: C.text }]}
        placeholder={placeholder}
        placeholderTextColor={C.textSecondary}
        value={value}
        onChangeText={onChange}
        keyboardType={type}
        secureTextEntry={secure && !showPass}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {secure && (
        <Pressable onPress={() => setShowPass(!showPass)} hitSlop={8}>
          <Feather name={showPass ? "eye-off" : "eye"} size={18} color={C.textSecondary} />
        </Pressable>
      )}
    </View>
  );

  // ——— OTP Ekranı ———
  if (mode === "otp") {
    const displayTarget = method === "email" ? email : phone;
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: C.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.handle, { backgroundColor: C.border }]} />
        <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: insets.bottom + 40 }}>
          <View style={styles.iconBig}>
            <Feather name="shield" size={36} color={Colors.primary} />
          </View>
          <Text style={[styles.title, { color: C.text }]}>Doğrulama Kodu</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            {method === "email"
              ? `${displayTarget} adresine 6 haneli kod gönderdik`
              : `${displayTarget} numarasına SMS ile 6 haneli kod gönderdik`}
          </Text>

          {/* DEV MODU — Gerçek serviste bu kutu olmaz */}
          {devOtpCode && (
            <Pressable
              style={styles.devOtpBox}
              onPress={() => {
                const digits = devOtpCode.split("");
                setOtpDigits(digits);
                setOtp(devOtpCode);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Feather name="terminal" size={14} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.devOtpLabel}>Test Modu — E-posta Servisi Aktif Değil</Text>
                <Text style={styles.devOtpCode}>{devOtpCode}</Text>
                <Text style={styles.devOtpHint}>Koda dokun — otomatik doldurur</Text>
              </View>
            </Pressable>
          )}

          {/* 6 Haneli OTP kutuları */}
          <View style={styles.otpRow}>
            {otpDigits.map((d, i) => (
              <TextInput
                key={i}
                ref={otpRefs[i]}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: C.surface,
                    borderColor: d ? Colors.primary : C.border,
                    color: C.text,
                  },
                ]}
                value={d}
                onChangeText={v => handleOtpDigit(v, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                autoFocus={i === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.btn, { backgroundColor: Colors.primary, opacity: otp.length !== 6 || loading ? 0.5 : 1 }]}
            onPress={handleOtp}
            disabled={otp.length !== 6 || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.btnText}>Doğrula ve Giriş Yap</Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.backLink} onPress={() => { setMode("register"); setOtpDigits(["", "", "", "", "", ""]); setOtp(""); setError(""); }}>
            <Feather name="arrow-left" size={14} color={C.textSecondary} />
            <Text style={[styles.backLinkText, { color: C.textSecondary }]}>Geri dön</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ——— Giriş / Kayıt Ekranı ———
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.handle, { backgroundColor: C.border }]} />
      <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: insets.bottom + 40 }}>

        {/* Başlık */}
        <Text style={[styles.title, { color: C.text }]}>
          {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
        </Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          {mode === "login"
            ? "Vitrin hesabına giriş yap"
            : "URL ekle, puan kazan, aylık gelirden pay al 🎉"}
        </Text>

        {/* E-posta / Telefon Toggle */}
        <View style={[styles.methodToggle, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            style={[styles.methodBtn, method === "email" && { backgroundColor: Colors.primary }]}
            onPress={() => { setMethod("email"); setError(""); }}
          >
            <Feather name="mail" size={15} color={method === "email" ? "#fff" : C.textSecondary} />
            <Text style={[styles.methodBtnText, { color: method === "email" ? "#fff" : C.textSecondary }]}>E-posta</Text>
          </Pressable>
          <Pressable
            style={[styles.methodBtn, method === "phone" && { backgroundColor: Colors.primary }]}
            onPress={() => { setMethod("phone"); setError(""); }}
          >
            <Feather name="smartphone" size={15} color={method === "phone" ? "#fff" : C.textSecondary} />
            <Text style={[styles.methodBtnText, { color: method === "phone" ? "#fff" : C.textSecondary }]}>Telefon</Text>
          </Pressable>
        </View>

        {/* Kayıt — Ad */}
        {mode === "register" && (
          <InputField
            icon="user"
            placeholder="Adın (vitrin adın olacak)"
            value={displayName}
            onChange={setDisplayName}
          />
        )}

        {/* E-posta veya Telefon */}
        {method === "email" ? (
          <InputField
            icon="mail"
            placeholder="E-posta adresi"
            value={email}
            onChange={setEmail}
            type="email-address"
          />
        ) : (
          <InputField
            icon="smartphone"
            placeholder="Telefon numarası (05xx...)"
            value={phone}
            onChange={setPhone}
            type="phone-pad"
          />
        )}

        {/* Şifre */}
        <InputField
          icon="lock"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={setPassword}
          secure
        />

        {/* Hata mesajı */}
        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Ana Buton */}
        <Pressable
          style={[styles.btn, { backgroundColor: Colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={mode === "login" ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Feather name={mode === "login" ? "log-in" : "user-plus"} size={18} color="#fff" />
              <Text style={styles.btnText}>
                {mode === "login" ? "Giriş Yap" : "Kayıt Ol — Ücretsiz"}
              </Text>
            </>
          )}
        </Pressable>

        {/* Mod geçişi */}
        <Pressable style={styles.switchMode} onPress={switchMode}>
          <Text style={[styles.switchText, { color: C.textSecondary }]}>
            {mode === "login" ? "Hesabın yok mu? " : "Zaten üye misin? "}
            <Text style={{ color: Colors.primary, fontFamily: "Inter_700Bold" }}>
              {mode === "login" ? "Kayıt Ol" : "Giriş Yap"}
            </Text>
          </Text>
        </Pressable>

        {/* Bilgi kutusu */}
        <View style={[styles.infoBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          {[
            { icon: "dollar-sign", text: "Aylık gelir havuzundan pay al" },
            { icon: "star", text: "Puan kazan, üst sıralara çık" },
            { icon: "zap", text: "Dışarıdan gelen tıklama = 2x puan" },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.infoRow}>
              <Feather name={icon as any} size={14} color={Colors.primary} />
              <Text style={[styles.infoText, { color: C.textSecondary }]}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  iconBig: { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.primary + "20", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20, marginTop: 8 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 24 },

  methodToggle: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 16, gap: 4 },
  methodBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  methodBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  inputWrap: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 },
  textInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },

  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EF444415", borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText: { flex: 1, color: "#EF4444", fontSize: 13, fontFamily: "Inter_500Medium" },

  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, padding: 18, marginTop: 4 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },

  switchMode: { marginTop: 20, alignItems: "center", paddingVertical: 4 },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },

  infoBox: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10, marginTop: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular" },

  // OTP
  otpRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 24 },
  otpBox: { width: 48, height: 58, borderRadius: 14, borderWidth: 2, fontSize: 24, fontFamily: "Inter_700Bold" },

  devOtpBox: { flexDirection: "row", gap: 10, backgroundColor: "#F59E0B15", borderColor: "#F59E0B40", borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 20, alignItems: "flex-start" },
  devOtpLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#F59E0B", marginBottom: 4 },
  devOtpCode: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#F59E0B", letterSpacing: 6 },
  devOtpHint: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B90", marginTop: 2 },

  backLink: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 16, paddingVertical: 8 },
  backLinkText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
