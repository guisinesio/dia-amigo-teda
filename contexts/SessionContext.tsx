"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface SessionUser {
  matricula: string;
  nome: string;
  setor: string;
  fotoDriveId?: string | null;
  rh: boolean;
}

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    // Carrega sessão e aquece o GAS em paralelo para eliminar cold start
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/ping").catch(() => {}),
    ]).then(([j]) => {
      if (j?.ok) setUser(j.data);
    }).catch(() => {});
  }, []);

  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
