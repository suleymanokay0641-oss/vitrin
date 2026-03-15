import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;
const USER_ID_KEY = "fd-user-id";
const USER_EMAIL_KEY = "fd-user-email";

export interface PointBalance {
  userId: number;
  email: string;
  totalPoints: number;
  weeklyPoints: number;
  weeklyTickets: number;
  weekKey: string;
  recentEvents: Array<{ id: number; type: string; points: number; description: string; createdAt: string }>;
}

export function usePoints() {
  const [userId, setUserId] = useState<number | null>(() => {
    const v = localStorage.getItem(USER_ID_KEY);
    return v ? parseInt(v) : null;
  });
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem(USER_EMAIL_KEY));
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchBalance = useCallback(async (uid: number) => {
    try {
      const res = await fetch(`${BASE}api/points/balance/${uid}`);
      if (res.ok) setBalance(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (userId) fetchBalance(userId);
  }, [userId, fetchBalance]);

  const register = useCallback(async (emailInput: string): Promise<boolean> => {
    setIsRegistering(true);
    try {
      const res = await fetch(`${BASE}api/points/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim().toLowerCase() }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem(USER_ID_KEY, String(data.userId));
      localStorage.setItem(USER_EMAIL_KEY, data.email);
      setUserId(data.userId);
      setEmail(data.email);
      await fetchBalance(data.userId);
      return true;
    } catch {
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [fetchBalance]);

  const earnPoints = useCallback(async (
    type: string,
    referenceId?: string,
    customPoints?: number,
  ): Promise<{ success: boolean; pointsEarned: number; newTotal: number }> => {
    if (!userId) return { success: false, pointsEarned: 0, newTotal: 0 };
    try {
      const res = await fetch(`${BASE}api/points/earn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, referenceId, customPoints }),
      });
      if (!res.ok) return { success: false, pointsEarned: 0, newTotal: 0 };
      const data = await res.json();
      if (data.success && data.pointsEarned > 0) {
        setBalance((prev) => prev ? { ...prev, totalPoints: data.newTotal, weeklyPoints: prev.weeklyPoints + data.pointsEarned } : prev);
      }
      return data;
    } catch {
      return { success: false, pointsEarned: 0, newTotal: 0 };
    }
  }, [userId]);

  const buyRaffleTickets = useCallback(async (ticketCount: number) => {
    if (!userId) return null;
    try {
      const res = await fetch(`${BASE}api/points/redeem/raffle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ticketCount }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance((prev) => prev ? {
          ...prev,
          totalPoints: data.newTotal,
          weeklyTickets: prev.weeklyTickets + ticketCount,
        } : prev);
      }
      return data;
    } catch {
      return null;
    }
  }, [userId]);

  return { userId, email, balance, isRegistering, register, earnPoints, buyRaffleTickets, refetch: () => userId && fetchBalance(userId) };
}
