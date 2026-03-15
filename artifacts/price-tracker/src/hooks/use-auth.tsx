import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/lib/utils";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string | null;
  phone: string | null;
  role: string;
  isChampion: boolean;
  loyaltyMonths: number;
  championMultiplier: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
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
  getAuthHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCESS_TOKEN_KEY = "vitrin_access_token";
const REFRESH_TOKEN_KEY = "vitrin_refresh_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, loading: true });

  const getAuthHeader = useCallback((): Record<string, string> => {
    const token = state.accessToken || localStorage.getItem(ACCESS_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [state.accessToken]);

  const fetchUser = useCallback(async (token: string): Promise<AuthUser | null> => {
    try {
      const r = await fetch(getApiUrl("auth/me"), { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }, []);

  const attemptRefresh = useCallback(async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;
    try {
      const r = await fetch(getApiUrl("auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!r.ok) { localStorage.removeItem(REFRESH_TOKEN_KEY); return null; }
      const data = await r.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      return data.accessToken;
    } catch { return null; }
  }, []);

  useEffect(() => {
    (async () => {
      let token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        const user = await fetchUser(token);
        if (user) { setState({ user, accessToken: token, loading: false }); return; }
      }
      token = await attemptRefresh();
      if (token) {
        const user = await fetchUser(token);
        if (user) { setState({ user, accessToken: token, loading: false }); return; }
      }
      setState({ user: null, accessToken: null, loading: false });
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch(getApiUrl("auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) return { error: data.error, requiresVerification: data.requiresVerification, userId: data.userId };

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    setState({ user: data.user, accessToken: data.accessToken, loading: false });
    return {};
  }, []);

  const register = useCallback(async (body: { email: string; password: string; displayName?: string; phone?: string }) => {
    const r = await fetch(getApiUrl("auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) return { error: data.error };
    return { userId: data.userId };
  }, []);

  const verifyEmail = useCallback(async (userId: number, otp: string) => {
    const r = await fetch(getApiUrl("auth/verify-email"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, otp }),
    });
    const data = await r.json();
    if (!r.ok) return { error: data.error };

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    setState({ user: data.user, accessToken: data.accessToken, loading: false });
    return {};
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      await fetch(getApiUrl("auth/logout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setState({ user: null, accessToken: null, loading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = state.accessToken || localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;
    const user = await fetchUser(token);
    if (user) setState(s => ({ ...s, user }));
  }, [state.accessToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, verifyEmail, logout, refreshUser, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
