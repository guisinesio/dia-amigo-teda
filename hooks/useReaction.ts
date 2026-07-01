"use client";

import { useState } from "react";
import type { TipoReacao } from "@/types/mensagem";

export function useReaction(mensagemId: string, reacaoInicial?: TipoReacao | null) {
  const [reacao, setReacao] = useState<TipoReacao | null>(reacaoInicial ?? null);
  const [loading, setLoading] = useState(false);

  const reagir = async (tipo: TipoReacao) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagemId, tipo }),
      });
      const json = await res.json();
      if (json.ok) setReacao(json.data?.tipo ?? tipo);
    } finally {
      setLoading(false);
    }
  };

  return { reacao, reagir, loading };
}
