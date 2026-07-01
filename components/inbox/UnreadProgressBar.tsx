"use client";

import { motion, AnimatePresence } from "framer-motion";

interface UnreadProgressBarProps {
  total: number;
  naoLidas: number;
}

export function UnreadProgressBar({ total, naoLidas }: UnreadProgressBarProps) {
  if (total === 0) return null;
  const lidas = total - naoLidas;
  const pct = Math.round((lidas / total) * 100);
  const allRead = naoLidas === 0;

  return (
    <div className="px-1">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-ink-faint">
          {allRead ? "Todas lidas 🎉" : `${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}`}
        </span>
        <span className="text-xs font-medium text-ink-soft">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist-dark">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <AnimatePresence>
        {allRead && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-center text-xs text-brand font-medium"
          >
            Você leu todas as suas mensagens! ✨
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
