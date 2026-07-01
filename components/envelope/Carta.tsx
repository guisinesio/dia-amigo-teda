"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { driveImageUrl } from "@/lib/drive";
import type { Mensagem } from "@/types/mensagem";

interface CartaProps {
  mensagem: Mensagem;
  onReact?: (tipo: import("@/types/mensagem").TipoReacao) => void;
  onFavorite?: () => void;
  isFavorita?: boolean;
  isDestinatario: boolean;
}

export function Carta({ mensagem, onReact, onFavorite, isFavorita, isDestinatario }: CartaProps) {
  const fotoUrl = driveImageUrl(mensagem.imagemDriveId);
  const remetenteFotoUrl = driveImageUrl(mensagem.remetenteFotoDriveId);

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(mensagem.data));

  const containerVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.97 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.article
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-lg"
    >
      {/* Paper card */}
      <div
        className="relative rounded-3xl border border-line bg-white px-7 py-8 shadow-[var(--shadow-letter)]"
        style={{ background: "linear-gradient(160deg, #ffffff 0%, #fdfcf9 100%)" }}
      >
        {/* Date stamp */}
        <motion.div variants={itemVariants} className="mb-6 flex items-center justify-between">
          <span className="text-xs text-ink-faint">{dataFormatada}</span>
          <button
            onClick={onFavorite}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-ink-faint transition-colors hover:bg-mist hover:text-accent"
          >
            <Heart
              size={13}
              className={isFavorita ? "fill-accent text-accent" : ""}
            />
            {isFavorita ? "Favoritada" : "Favoritar"}
          </button>
        </motion.div>

        {/* Sender */}
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
          <Avatar
            src={remetenteFotoUrl}
            name={mensagem.remetenteNome}
            size="md"
          />
          <div>
            <p className="text-sm font-semibold text-ink">{mensagem.remetenteNome}</p>
            <p className="text-xs text-ink-faint">enviou uma mensagem especial ✉️</p>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.hr variants={itemVariants} className="mb-6 border-line" />

        {/* Message body */}
        <motion.p
          variants={itemVariants}
          className="whitespace-pre-wrap text-[17px] leading-relaxed text-ink"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {mensagem.texto}
        </motion.p>

        {/* Photo */}
        {fotoUrl && (
          <motion.div
            variants={itemVariants}
            className="mt-6 overflow-hidden rounded-2xl border border-line"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoUrl}
              alt="Foto anexada"
              className="w-full object-cover"
              style={{ maxHeight: 320 }}
            />
          </motion.div>
        )}

        {/* YouTube music */}
        {mensagem.videoYoutubeId && (
          <motion.div variants={itemVariants} className="mt-5">
            <MusicCard videoId={mensagem.videoYoutubeId} />
          </motion.div>
        )}

        {/* Reactions */}
        {isDestinatario && (
          <motion.div variants={itemVariants} className="mt-8 border-t border-line pt-6">
            <p className="mb-3 text-center text-xs font-medium text-ink-faint">
              O que você sentiu ao ler?
            </p>
            <ReactionBar
              reacaoAtual={mensagem.reacao ?? null}
              onReact={onReact}
            />
          </motion.div>
        )}

        {!isDestinatario && mensagem.reacao && (
          <motion.div variants={itemVariants} className="mt-6 border-t border-line pt-5 text-center">
            <p className="text-xs text-ink-faint">Reação recebida</p>
            <span className="text-2xl">
              {{"coracao":"❤️","sorriso":"😊","palmas":"👏","emocionado":"🥹"}[mensagem.reacao]}
            </span>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

function MusicCard({ videoId }: { videoId: string }) {
  const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-mist p-3 transition-all hover:border-brand/30 hover:bg-brand-soft"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt="Thumbnail"
        className="h-14 w-24 flex-shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink-soft">🎵 Música dedicada</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">Ouvir música</p>
        <p className="text-xs text-ink-faint">Clique para abrir no YouTube</p>
      </div>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm transition-transform group-hover:scale-105">
        ▶
      </div>
    </a>
  );
}
