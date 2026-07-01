"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Inbox } from "lucide-react";
import { useInbox } from "@/hooks/useInbox";
import { MessageListItem } from "@/components/inbox/MessageListItem";
import { UnreadProgressBar } from "@/components/inbox/UnreadProgressBar";
import { Spinner } from "@/components/ui/Spinner";

export default function InboxPage() {
  const { mensagens, loading, error, naoLidas, total } = useInbox();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-line bg-paper px-5 py-5 lg:px-8">
        <div className="flex items-center gap-2">
          <Inbox size={20} className="text-brand" />
          <h1 className="text-lg font-bold text-ink">Caixa de Entrada</h1>
          {naoLidas > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
              {naoLidas}
            </span>
          )}
        </div>
        {total > 0 && (
          <div className="mt-3">
            <UnreadProgressBar total={total} naoLidas={naoLidas} />
          </div>
        )}
      </div>

      <div className="flex-1 px-3 py-3 lg:px-6">
        {loading && (
          <div className="flex flex-1 items-center justify-center py-20">
            <Spinner />
          </div>
        )}

        {error && (
          <p className="py-12 text-center text-sm text-accent">{error}</p>
        )}

        <AnimatePresence>
          {!loading && !error && mensagens.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-20 text-center"
            >
              <span className="text-4xl">📭</span>
              <p className="font-medium text-ink">Nenhuma mensagem ainda</p>
              <p className="text-sm text-ink-faint">Suas cartas aparecerão aqui</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-0.5">
          {mensagens.map((m, i) => (
            <MessageListItem key={m.id} mensagem={m} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
