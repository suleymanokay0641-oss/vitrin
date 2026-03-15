import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

interface AuthUser {
  id: number;
  email: string;
  displayName: string | null;
  role: string;
  isChampion: boolean;
  loyaltyMonths: number;
  championMultiplier: number;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string; requiresVerification?: boolean; userId?: number }>;
  register: (data: { email: string; password: string; displayName?: string; phone?: string }) => Promise<{ error?: string; userId?: number }>;
  verifyEmail: (userId: number, otp: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const KEYS = { accessToken: "vitrin_at", refreshToken: "vitrin_rt" };

async function apiPost(path: string, body: object, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(`${API_BASE}/${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  return { data: await r.json(), ok: r.ok };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, loading: true });

  async function fetchUser(token: string): Promise<AuthUser | null> {
    try {
      const r = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

  async function attemptRefresh(rt: string): Promise<string | null> {
    try {
      const { data, ok } = await apiPost("auth/refresh", { refreshToken: rt });
      if (!ok) { await AsyncStorage.multiRemove([KEYS.accessToken, KEYS.refreshToken]); return null; }
      await AsyncStorage.multiSet([[KEYS.accessToken, data.accessToken], [KEYS.refreshToken, data.refreshToken]]);
      return data.accessToken;
    } catch { return null; }
  }

  useEffect(() => {
    (async () => {
      try {
        let at = await AsyncStorage.getItem(KEYS.accessToken);
        if (at) {
          const user = await fetchUser(at);
          if (user) { setState({ user, accessToken: at, loading: false }); return; }
        }
        const rt = await AsyncStorage.getItem(KEYS.refreshToken);
        if (rt) {
          at = await attemptRefresh(rt);
          if (at) {
            const user = await fetchUser(at);
            if (user) { setState({ user, accessToken: at, loading: false }); return; }
          }
        }
      } catch {}
      setState({ user: null, accessToken: null, loading: false });
    })();
  }, []);

  async function login(email: string, password: string) {
    const { data, ok } = await apiPost("auth/login", { email, password });
    if (!ok) return { error: data.error, requiresVerification: data.requiresVerification, userId: data.userId };
    await AsyncStorage.multiSet([[KEYS.accessToken, data.accessToken], [KEYS.refreshToken, data.refreshToken]]);
    setState({ user: data.user, accessToken: data.accessToken, loading: false });
    return {};
  }

  async function register(body: { email: string; password: string; displayName?: string; phone?: string }) {
    const { data, ok } = await apiPost("auth/register", body);
    if (!ok) return { error: data.error };
    return { userId: data.userId, devOtp: data.devOtp };
  }

  async function verifyEmail(userId: number, otp: string) {
    const { data, ok } = await apiPost("auth/verify-email", { userId, otp });
    if (!ok) return { error: data.error };
    await AsyncStorage.multiSet([[KEYS.accessToken, data.accessToken], [KEYS.refreshToken, data.refreshToken]]);
    setState({ user: data.user, accessToken: data.accessToken, loading: false });
    return {};
  }

  async function logout() {
    const rt = await AsyncStorage.getItem(KEYS.refreshToken);
    if (rt) await apiPost("auth/logout", { refreshToken: rt }).catch(() => {});
    await AsyncStorage.multiRemove([KEYS.accessToken, KEYS.refreshToken]);
    setState({ user: null, accessToken: null, loading: false });
  }

  async function refreshUser() {
    const token = state.accessToken || (await AsyncStorage.getItem(KEYS.accessToken));
    if (!token) return;
    const user = await fetchUser(token);
    if (user) setState(s => ({ ...s, user }));
  }

  return <AuthContext.Provider value={{ ...state, login, register, verifyEmail, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
