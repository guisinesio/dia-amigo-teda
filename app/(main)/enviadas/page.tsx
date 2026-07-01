"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Send, Eye, EyeOff } from "lucide-react";
import { useSentMessages } from "@/hooks/useSentMessages";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const reacaoEmoji: Record<string, string> = {
  coracao: "❤️", sorriso: "😊", palmas: "👏", emocionado: "🥹",
};

export default function EnviadasPage() {
  const { mensagens, loading, error } = useSentMessages();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-line bg-paper px-5 py-5 lg:px-8">
        <div className="flex items-center gap-2">
          <Send size={20} className="text-brand" />
          <h1 className="text-lg font-bold text-ink">Enviadas</h1>
        </div>
        <p className="mt-0.5 text-sm text-ink-faint">Mensagens que você enviou</p>
      </div>

      <div className="flex-1 px-3 py-3 lg:px-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        )}

        {error && <p className="py-12 text-center text-sm text-accent">{error}</p>}

        <AnimatePresence>
          {!loading && !error && mensagens.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-20 text-center"
            >
              <span className="text-4xl">📤</span>
              <p className="font-medium text-ink">Nenhuma mensagem enviada</p>
              <p className="text-sm text-ink-faint">Envie sua primeira carta!</p>
              <Link href="/nova-mensagem" className="mt-2 text-sm font-medium text-brand hover:underline">
                Nova mensagem →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          {mensagens.map((m, i) => {
            const lida = m.visualizada;
            const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(m.data));

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={`/inbox/${m.id}`}
                  className="flex items-start gap-3 rounded-2xl p-4 transition-colors hover:bg-mist"
                >
                  {/* Status icon */}
                  <div className={cn(
                    "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                    lida ? "bg-brand-soft text-brand" : "bg-mist text-ink-faint",
                  )}>
                    {lida ? <Eye size={15} /> : <EyeOff size={15} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[15px] font-semibold text-ink">
                        {(m as any).destinatarioNome ?? "—"}
                      </p>
                      <span className="flex-shrink-0 text-xs text-ink-faint">{data}</span>
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-sm text-ink-faint">{m.texto}</p>

                    <div className="mt-2 flex items-center gap-2">
                      {lida ? (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">✓ Visualizada</span>
                      ) : (
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] text-ink-faint">Não visualizada</span>
                      )}
                      {m.reacao && (
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] text-ink-faint">
                          Reação: {reacaoEmoji[m.reacao]}
                        </span>
                      )}
                      {m.imagemDriveId && <span className="text-[11px] text-ink-faint">📷</span>}
                      {m.videoYoutubeId && <span className="text-[11px] text-ink-faint">🎵</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
