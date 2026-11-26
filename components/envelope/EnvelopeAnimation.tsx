"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "idle" | "opening" | "letterRising" | "done";

interface EnvelopeAnimationProps {
  senderName: string;
  preview: string;
  onComplete: () => void;
}

export function EnvelopeAnimation({ senderName, preview, onComplete }: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("opening"), 600);
    const t2 = setTimeout(() => setPhase("letterRising"), 1400);
    const t3 = setTimeout(() => { setPhase("done"); onComplete(); }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg, #2d5a27 0%, #1a3a16 50%, #9b1a2e 100%)" }}
    >
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, y: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            {/* Envelope body */}
            <div className="relative w-72 overflow-visible">
              {/* Envelope top flap */}
              <div className="absolute -top-0 left-0 right-0 z-10 h-36" style={{ perspective: 600 }}>
                <motion.div
                  animate={{
                    rotateX: phase === "opening" || phase === "letterRising" ? -168 : 0,
                  }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformOrigin: "bottom center", transformStyle: "preserve-3d" }}
                  className="h-full w-full"
                >
                  {/* Flap front (visible when closed) — vermelho natalino */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "#c41e3a",
                      clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
                      borderLeft: "1px solid #9b1a2e",
                      borderRight: "1px solid #9b1a2e",
                      filter: "drop-shadow(0 -1px 0 #9b1a2e)",
                    }}
                  />
                  {/* Flap back (visible when open) — dourado */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "#fdf5e0",
                      clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
                      backfaceVisibility: "hidden",
                      transform: "rotateX(180deg)",
                    }}
                  />
                </motion.div>
              </div>

              {/* Envelope main body */}
              <div
                className="relative z-0 flex h-44 w-full items-end overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-letter)]"
                style={{ border: "1px solid #c41e3a" }}
              >
                {/* V at bottom — verde pinheiro */}
                <div
                  className="absolute inset-x-0 bottom-0 h-24"
                  style={{
                    background: "#2d5a27",
                    clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
                    borderTop: "1px solid #1d4020",
                  }}
                />
                {/* Side folds — tom creme */}
                <div
                  className="absolute inset-y-0 left-0 w-28"
                  style={{
                    background: "#fdf8f0",
                    clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                    borderRight: "1px solid #e6ddd0",
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 w-28"
                  style={{
                    background: "#fdf8f0",
                    clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                    borderLeft: "1px solid #e6ddd0",
                  }}
                />

                {/* Letter rising from inside */}
                <motion.div
                  animate={{
                    y: phase === "letterRising" ? -80 : 40,
                    opacity: phase === "letterRising" ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
                  className="relative z-20 mx-auto mb-0 w-52 rounded-t-xl border border-b-0 bg-white px-4 py-3 shadow-sm"
                  style={{ borderColor: "#e6ddd0" }}
                >
                  <p className="text-xs font-semibold text-brand">{senderName}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-faint">{preview}</p>
                </motion.div>
              </div>
            </div>

            <motion.p
              animate={{ opacity: phase === "idle" ? 1 : 0 }}
              className="mt-6 text-sm font-medium text-white/70"
            >
              🎄 Abrindo sua cartinha...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
