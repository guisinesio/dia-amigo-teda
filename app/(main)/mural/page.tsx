"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Heart, ChevronDown } from "lucide-react";
import { driveImageUrl } from "@/lib/drive";
import type { MuralMessage } from "@/app/api/mural/route";

const BUBBLES_PER_PAGE = 20;

const BUBBLE_COLORS = [
  { from: "#3b82f6", to: "#2563eb" },
  { from: "#f43f5e", to: "#e11d48" },
  { from: "#8b5cf6", to: "#7c3aed" },
  { from: "#10b981", to: "#059669" },
  { from: "#f59e0b", to: "#d97706" },
  { from: "#ec4899", to: "#db2777" },
  { from: "#06b6d4", to: "#0891b2" },
  { from: "#6366f1", to: "#4f46e5" },
  { from: "#14b8a6", to: "#0d9488" },
  { from: "#a855f7", to: "#9333ea" },
];

function seeded(id: string, offset: number, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  const r = Math.abs((h + offset * 2654435761) | 0) / 2147483647;
  return min + r * (max - min);
}

function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return BUBBLE_COLORS[Math.abs(h) % BUBBLE_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return ""; }
}

function generatePositions(count: number, mobile = false) {
  if (mobile) {
    // Mobile: 2 colunas fixas (6% e 52%) com jitter pequeno em X e variação em Y.
    // Evita o clamping que ocorria quando cellW=50 jogava col=1 acima de maxLeft.
    // Pílula ~130px em 375px = ~35%; col1 a 52% termina em 87% — dentro da tela.
    const totalRows = Math.ceil(count / 2);
    const cellH = 82 / Math.max(totalRows, 4);
    return Array.from({ length: count }, (_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const jitterX = Math.sin(i * 3.7) * 4;
      const jitterY = (Math.cos(i * 5.1) * 0.25 + 0.5) * cellH;
      return {
        left: Math.max(2, (col === 0 ? 6 : 52) + jitterX),
        top: Math.min(85, Math.max(2, row * cellH + jitterY)),
      };
    });
  }
  // Desktop: 4 colunas com jitter orgânico
  const cols = 4, rows = 4;
  const cellW = 100 / cols, cellH = 100 / rows;
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    const jitterX = (Math.sin(i * 7.3) * 0.20 + 0.37) * cellW;
    const jitterY = (Math.cos(i * 5.1) * 0.20 + 0.37) * cellH;
    return {
      left: Math.min(78, Math.max(2, col * cellW + jitterX)),
      top: Math.min(88, Math.max(2, row * cellH + jitterY)),
    };
  });
}

// Avatar individual — foto com fallback para iniciais
function Avatar({
  fotoId, name, size,
}: { fotoId: string | null; name: string; size: number }) {
  const [err, setErr] = useState(false);
  const url = driveImageUrl(fotoId);

  if (url && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        onError={() => setErr(true)}
        className="rounded-full object-cover ring-2 ring-white/50"
        style={{ width: size, height: size, flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-white/25 ring-2 ring-white/50 font-bold text-white"
      style={{ width: size, height: size, flexShrink: 0, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}

// Pílula de bolha: (foto/iniciais remetente) → (foto/iniciais destinatário)
function BubblePill({ msg, onClick }: { msg: MuralMessage; onClick: () => void }) {
  const color = colorFor(msg.id);
  const floatY = seeded(msg.id, 2, 8, 18);
  const duration = seeded(msg.id, 3, 3.5, 6);
  const delay = seeded(msg.id, 4, 0, 2.5);
  const rotate = seeded(msg.id, 5, -4, 4);

  return (
    <motion.button
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{ left: 0, top: 0 }} // posicionamento via wrapper
      animate={{
        y: [0, -floatY, 0],
        rotate: [0, rotate, 0],
      }}
      transition={{
        y: { duration, delay, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: duration * 1.2, delay, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.93 }}
      title={`De ${msg.remetenteNome} para ${msg.destinatarioNome}`}
    >
      <div
        className="flex items-center gap-2 rounded-full px-3 py-2 shadow-lg overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
      >
        <Avatar fotoId={msg.remetenteFotoId} name={msg.remetenteNome} size={40} />
        <span className="text-sm font-bold text-white/80 select-none">→</span>
        <Avatar fotoId={msg.destinatarioFotoId} name={msg.destinatarioNome} size={40} />
      </div>
    </motion.button>
  );
}

export default function MuralPage() {
  const [all, setAll] = useState<MuralMessage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MuralMessage | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mural");
      const json = await res.json();
      if (json.ok) { setAll(json.data ?? []); setPage(1); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const visible = all.slice(0, page * BUBBLES_PER_PAGE);
  const hasMore = visible.length < all.length;
  const positions = generatePositions(visible.length, isMobile);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-line bg-paper px-5 py-4">
        <div>
          <h1 className="text-lg font-bold text-ink">Mural do Amigo</h1>
          <p className="text-xs text-ink-faint">
            {loading ? "Carregando..." : all.length > 0
              ? `${all.length} mensagem${all.length !== 1 ? "s" : ""} circulando`
              : "Nenhuma mensagem ainda"}
          </p>
        </div>
        <button
          onClick={fetch_}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-mist disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-brand-soft via-paper to-accent-soft">
        {/* Fundo decorativo */}
        <div className="pointer-events-none absolute inset-0">
          {[180, 260, 140, 320, 200].map((s, i) => (
            <div key={i} className="absolute rounded-full bg-brand/5"
              style={{ width: s, height: s, left: `${[8,55,80,25,65][i]}%`, top: `${[15,8,50,65,40][i]}%`, transform: "translate(-50%,-50%)" }}
            />
          ))}
        </div>

        {loading && all.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
            <p className="text-sm text-ink-faint">Carregando o mural...</p>
          </div>
        )}

        {!loading && all.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Heart size={40} className="text-ink-faint" />
            <p className="text-sm font-medium text-ink-soft">Nenhuma mensagem ainda</p>
            <p className="text-xs text-ink-faint">As mensagens aparecerão aqui assim que forem enviadas</p>
          </div>
        )}

        {/* Pílulas flutuantes */}
        <AnimatePresence>
          {visible.map((msg, i) => {
            const pos = positions[i];
            return (
              <motion.div
                key={msg.id}
                className="absolute"
                style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <BubblePill msg={msg} onClick={() => setSelected(msg)} />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Ver mais */}
        {hasMore && (
          <motion.button
            onClick={() => setPage((p) => p + 1)}
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-paper/90 px-4 py-2 text-sm font-medium text-ink shadow-md backdrop-blur-sm hover:bg-mist transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChevronDown size={15} />
            Ver mais {Math.min(BUBBLES_PER_PAGE, all.length - visible.length)} mensagens
          </motion.button>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              className="relative z-10 mx-4 mb-4 w-full max-w-md flex flex-col rounded-2xl bg-paper shadow-[var(--shadow-letter)] sm:mb-0"
              style={{ maxHeight: "85vh" }}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              {/* Header — fixo no topo do modal */}
              <div
                className="flex-shrink-0 rounded-t-2xl px-5 py-4"
                style={{ background: `linear-gradient(135deg, ${colorFor(selected.id).from}, ${colorFor(selected.id).to})` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar fotoId={selected.remetenteFotoId} name={selected.remetenteNome} size={48} />
                        <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">De</p>
                      </div>
                      <span className="text-lg font-bold text-white/60 pb-4">→</span>
                      <div className="flex flex-col items-center gap-1">
                        <Avatar fotoId={selected.destinatarioFotoId} name={selected.destinatarioNome} size={48} />
                        <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">Para</p>
                      </div>
                    </div>
                    <div className="ml-1">
                      <p className="text-sm font-bold text-white leading-tight">{selected.remetenteNome}</p>
                      <p className="text-xs text-white/70 leading-tight">→ {selected.destinatarioNome}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Conteúdo — rolável quando necessário */}
              <div className="overflow-y-auto p-5">
                <p className="font-serif text-[15px] leading-relaxed text-ink">{selected.texto}</p>

                {selected.imagemDriveId && (
                  <div className="mt-4 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={driveImageUrl(selected.imagemDriveId) ?? ""} alt="Foto" className="w-full object-cover" />
                  </div>
                )}

                {selected.videoYoutubeId && (
                  <a
                    href={`https://youtu.be/${selected.videoYoutubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5 text-sm text-ink-soft hover:bg-mist-dark transition-colors"
                  >
                    <span>🎵</span>
                    <span>Ver música dedicada no YouTube</span>
                  </a>
                )}

                <p className="mt-4 text-right text-[11px] text-ink-faint">{formatDate(selected.data)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
