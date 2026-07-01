"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { driveImageUrl } from "@/lib/drive";
import { useColaboradorSearch } from "@/hooks/useColaboradorSearch";
import type { ColaboradorPublico } from "@/types/colaborador";

interface ColaboradorSearchProps {
  onSelect: (colaborador: ColaboradorPublico) => void;
  onClear: () => void;
  selected: ColaboradorPublico | null;
}

export function ColaboradorSearch({ onSelect, onClear, selected }: ColaboradorSearchProps) {
  const { query, setQuery, results, loading, select, clear } = useColaboradorSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (c: ColaboradorPublico) => {
    select(c);
    onSelect(c);
  };

  const handleClear = () => {
    clear();
    onClear();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (!selected) inputRef.current?.focus();
  }, [selected]);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">
        Para quem é a mensagem?
      </label>

      {selected ? (
        <div className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3">
          <Avatar src={driveImageUrl(selected.fotoDriveId)} name={selected.nome} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{selected.nome}</p>
            <p className="text-xs text-ink-faint">{selected.setor}</p>
          </div>
          <button onClick={handleClear} className="rounded-full p-1 hover:bg-white/60 text-ink-faint hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome do colega..."
            className="h-12 w-full rounded-2xl border border-line bg-paper-soft pl-10 pr-4 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-all focus:border-brand focus:bg-paper focus:ring-4 focus:ring-brand/10"
          />
          {loading && <Spinner className="absolute right-4 top-1/2 -translate-y-1/2" />}
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && !selected && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-line bg-paper shadow-[var(--shadow-card-hover)]"
          >
            {results.map((c) => (
              <button
                key={c.matricula}
                onClick={() => handleSelect(c)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-mist"
              >
                <Avatar src={driveImageUrl(c.fotoDriveId)} name={c.nome} size="sm" />
                <div>
                  <p className="text-sm font-medium text-ink">{c.nome}</p>
                  <p className="text-xs text-ink-faint">{c.setor}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
