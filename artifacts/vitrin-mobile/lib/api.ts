const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
export const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "http://localhost:3001/api";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}/${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "İstek başarısız");
  return data as T;
}

export async function authedFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers },
  });
}
