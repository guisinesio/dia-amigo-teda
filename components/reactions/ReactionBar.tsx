"use client";

import { motion } from "framer-motion";
import { REACOES } from "@/types/reacao";
import type { TipoReacao } from "@/types/mensagem";
import { cn } from "@/lib/utils";

interface ReactionBarProps {
  reacaoAtual: TipoReacao | null;
  onReact?: (tipo: TipoReacao) => void;
}

export function ReactionBar({ reacaoAtual, onReact }: ReactionBarProps) {
  return (
    <div className="flex justify-center gap-3">
      {REACOES.map(({ tipo, emoji, label }) => {
        const active = reacaoAtual === tipo;
        return (
          <motion.button
            key={tipo}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onReact?.(tipo)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl px-4 py-2.5 transition-all",
              active
                ? "bg-brand-soft ring-2 ring-brand/30"
                : "bg-mist hover:bg-mist-dark",
            )}
          >
            <span className="text-2xl leading-none">{emoji}</span>
            <span className={cn("text-[10px] font-medium", active ? "text-brand" : "text-ink-faint")}>
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
