"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface SessionUser {
  matricula: string;
  nome: string;
  setor: string;
  fotoDriveId?: string | null;
  rh: boolean;
}

const SessionContext = createContext<SessionUser | null>(null);

// Refresh the JWT every 10 minutes while the user is active.
// The server-side SESSION_TIMEOUT_HOURS (default 8h) is the hard cap.
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
// Consider the user "active" if there was any interaction in the last 15 min.
const ACTIVITY_WINDOW_MS = 15 * 60 * 1000;
// Poll /api/auth/me every 5 minutes to detect server-side session expiry.
const SESSION_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/ping").catch(() => {}),
    ])
      .then(([j]) => {
        if (j?.ok) setUser(j.data);
      })
      .catch(() => {});
  }, []);

  // ── Activity tracking ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const record = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("mousemove", record, { passive: true });
    window.addEventListener("keydown", record, { passive: true });
    window.addEventListener("touchstart", record, { passive: true });
    window.addEventListener("click", record, { passive: true });

    return () => {
      window.removeEventListener("mousemove", record);
      window.removeEventListener("keydown", record);
      window.removeEventListener("touchstart", record);
      window.removeEventListener("click", record);
    };
  }, [user]);

  // ── Sliding session refresh ───────────────────────────────────────────────
  // Renews the JWT cookie whenever the user is active so the inactivity timer
  // only fires when the user has actually been idle for SESSION_TIMEOUT_HOURS.
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= ACTIVITY_WINDOW_MS) return; // user is idle — don't refresh

      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.status === 401) {
        // Session expired server-side
        setUser(null);
        router.replace("/login");
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, router]);

  // ── Periodic session health check ────────────────────────────────────────
  // Catches cases where the JWT expired and no refresh was triggered
  // (e.g., the tab was left open but idle for SESSION_TIMEOUT_HOURS).
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        setUser(null);
        router.replace("/login");
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, router]);

  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
