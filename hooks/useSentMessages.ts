"use client";

import { useState, useEffect, useCallback } from "react";
import type { Mensagem } from "@/types/mensagem";

export function useSentMessages() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mensagens?tipo=sent");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setMensagens(json.data ?? []);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar mensagens enviadas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { mensagens, loading, error, refresh: fetch_ };
}
