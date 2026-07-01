"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { driveImageUrl } from "@/lib/drive";
import type { Mensagem } from "@/types/mensagem";
import { cn } from "@/lib/utils";

interface MessageListItemProps {
  mensagem: Mensagem;
  index: number;
}

export function MessageListItem({ mensagem, index }: MessageListItemProps) {
  const fotoUrl = driveImageUrl(mensagem.remetenteFotoDriveId);
  const naoLida = !mensagem.visualizada;
  const temReacao = !!mensagem.reacao;

  const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(mensagem.data),
  );

  const reacaoEmoji: Record<string, string> = {
    coracao: "❤️", sorriso: "😊", palmas: "👏", emocionado: "🥹",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/inbox/${mensagem.id}`}
        className={cn(
          "flex items-start gap-3.5 rounded-2xl p-4 transition-all",
          "hover:bg-mist active:scale-[0.99]",
          naoLida && "bg-brand-soft/40",
        )}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar src={fotoUrl} name={mensagem.remetenteNome} size="md" />
          {naoLida && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent ring-2 ring-paper" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-[15px] leading-tight", naoLida ? "font-semibold text-ink" : "font-medium text-ink-soft")}>
              {mensagem.remetenteNome}
            </p>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              {temReacao && (
                <span className="text-xs">{reacaoEmoji[mensagem.reacao!]}</span>
              )}
              <span className="text-xs text-ink-faint">{data}</span>
            </div>
          </div>

          <p className={cn("mt-0.5 line-clamp-2 text-sm leading-snug", naoLida ? "text-ink-soft" : "text-ink-faint")}>
            {mensagem.texto}
          </p>

          <div className="mt-2 flex items-center gap-2">
            {mensagem.imagemDriveId && (
              <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] text-ink-faint">📷 Foto</span>
            )}
            {mensagem.videoYoutubeId && (
              <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] text-ink-faint">🎵 Música</span>
            )}
            {mensagem.favorita && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent">❤️ Favoritada</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
