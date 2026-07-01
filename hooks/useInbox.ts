"use client";

import { useState, useEffect, useCallback } from "react";
import type { Mensagem } from "@/types/mensagem";

export function useInbox() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mensagens?tipo=inbox");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setMensagens(json.data ?? []);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar mensagens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const naoLidas = mensagens.filter((m) => !m.visualizada).length;
  const total = mensagens.length;

  return { mensagens, loading, error, naoLidas, total, refresh: fetch_ };
}
