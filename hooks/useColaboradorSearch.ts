"use client";

import { useState, useEffect, useRef } from "react";
import type { ColaboradorPublico } from "@/types/colaborador";

export function useColaboradorSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ColaboradorPublico[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ColaboradorPublico | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (selected) return;
    if (query.length < 2) { setResults([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/colaboradores?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, selected]);

  const select = (colaborador: ColaboradorPublico) => {
    setSelected(colaborador);
    setQuery(colaborador.nome);
    setResults([]);
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
  };

  return { query, setQuery, results, loading, selected, select, clear };
}
