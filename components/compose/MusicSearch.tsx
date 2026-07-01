"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Music, Search, X, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useYoutubeSearch } from "@/hooks/useYoutubeSearch";
import type { YoutubeVideo } from "@/app/api/youtube/search/route";

interface MusicSearchProps {
  onSelect: (video: YoutubeVideo) => void;
  onClear: () => void;
  selected: YoutubeVideo | null;
}

export function MusicSearch({ onSelect, onClear, selected }: MusicSearchProps) {
  const { query, setQuery, results, loading, isMock, select, clear } = useYoutubeSearch();

  const handleSelect = (v: YoutubeVideo) => { select(v); onSelect(v); };
  const handleClear = () => { clear(); onClear(); };

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        <Music size={14} /> Dedicar uma música
        <span className="text-ink-faint font-normal">(opcional)</span>
      </label>

      {selected ? (
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-mist p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected.thumbnail} alt="" className="h-12 w-20 flex-shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{selected.title}</p>
            <p className="text-xs text-ink-faint">{selected.channelTitle}</p>
          </div>
          <button onClick={handleClear} className="flex-shrink-0 rounded-full p-1.5 hover:bg-mist-dark text-ink-faint hover:text-ink transition-colors">
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar música, artista..."
            className="h-12 w-full rounded-2xl border border-line bg-paper-soft pl-10 pr-4 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-all focus:border-brand focus:bg-paper focus:ring-4 focus:ring-brand/10"
          />
          {loading && <Spinner className="absolute right-4 top-1/2 -translate-y-1/2" />}
        </div>
      )}

      <AnimatePresence>
        {/* Aviso: chave do YouTube não configurada */}
        {isMock && !selected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
          >
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700">
              A busca de músicas precisa de uma chave da API do YouTube configurada. Enquanto isso, cole o link ou ID do vídeo manualmente no campo abaixo.
            </p>
          </motion.div>
        )}

        {/* Resultados reais */}
        {results.length > 0 && !selected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="relative z-50 mt-1.5 overflow-hidden rounded-2xl border border-line bg-paper shadow-[var(--shadow-card-hover)]"
          >
            {results.map((v) => (
              <button
                key={v.videoId}
                onClick={() => handleSelect(v)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-mist"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnail} alt="" className="h-12 w-20 flex-shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{v.title}</p>
                  <p className="text-xs text-ink-faint">{v.channelTitle}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback: inserir ID manualmente */}
      {isMock && !selected && (
        <ManualVideoInput onSelect={(v) => { select(v); onSelect(v); }} />
      )}
    </div>
  );
}

function ManualVideoInput({ onSelect }: { onSelect: (v: YoutubeVideo) => void }) {
  return (
    <div className="mt-2">
      <input
        placeholder="Cole o link do YouTube (ex: youtube.com/watch?v=...)"
        className="h-11 w-full rounded-2xl border border-line bg-paper-soft px-4 text-sm text-ink placeholder:text-ink-faint outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
        onChange={(e) => {
          const val = e.target.value.trim();
          // Extrai videoId de URLs comuns do YouTube
          const match = val.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
          if (match) {
            const videoId = match[1];
            onSelect({
              videoId,
              title: "Música dedicada",
              channelTitle: "YouTube",
              thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            });
          }
        }}
      />
    </div>
  );
}
