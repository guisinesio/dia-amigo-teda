"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface LoginPayload {
  matricula: string;
  nascimento: string;
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async ({ matricula, nascimento }: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, nascimento }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Dados inválidos.");
        return false;
      }
      router.push("/inicio");
      return true;
    } catch {
      setError("Erro de conexão. Tente novamente.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }, [router]);

  return { login, logout, loading, error };
}
