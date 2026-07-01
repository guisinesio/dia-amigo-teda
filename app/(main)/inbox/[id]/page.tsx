"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { EnvelopeAnimation } from "@/components/envelope/EnvelopeAnimation";
import { Carta } from "@/components/envelope/Carta";
import { ConfettiOverlay } from "@/components/envelope/ConfettiOverlay";
import { Spinner } from "@/components/ui/Spinner";
import { useSession } from "@/contexts/SessionContext";
import { useReaction } from "@/hooks/useReaction";
import type { Mensagem, TipoReacao } from "@/types/mensagem";

export default function MensagemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useSession();

  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFavorita, setIsFavorita] = useState(false);

  const { reacao, reagir } = useReaction(id, mensagem?.reacao);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/mensagens/${id}`);
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        setMensagem(json.data);
        setIsFavorita(json.data.favorita ?? false);

        // Mark as read and check if first time
        const patchRes = await fetch(`/api/mensagens/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acao: "markRead" }),
        });
        const patchJson = await patchRes.json();
        if (patchJson.ok && patchJson.data?.primeiraLeitura) {
          setShowConfetti(true);
        }
      } catch (e: any) {
        setError(e.message ?? "Erro ao carregar mensagem.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleFavorite = useCallback(async () => {
    const res = await fetch(`/api/mensagens/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "toggleFavorite" }),
    });
    const json = await res.json();
    if (json.ok) setIsFavorita(json.data.favorita);
  }, [id]);

  const handleReact = useCallback((tipo: TipoReacao) => {
    reagir(tipo);
  }, [reagir]);

  const isDestinatario = user?.matricula === mensagem?.destinatarioMatricula;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !mensagem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
        <span className="text-4xl">😢</span>
        <p className="font-medium text-ink">Mensagem não encontrada</p>
        <p className="text-sm text-ink-faint">{error}</p>
        <button onClick={() => router.back()} className="mt-2 text-sm text-brand hover:underline">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Back button */}
      <div className="flex items-center border-b border-line bg-paper px-4 py-3 lg:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist hover:text-ink transition-colors"
        >
          <ChevronLeft size={18} />
          Voltar
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          {showEnvelope ? (
            <motion.div key="envelope" className="flex flex-1 flex-col">
              <EnvelopeAnimation
                senderName={mensagem.remetenteNome}
                preview={mensagem.texto}
                onComplete={() => setShowEnvelope(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="carta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="px-4 py-6 lg:px-8 lg:py-8"
            >
              {showConfetti && <ConfettiOverlay />}
              <Carta
                mensagem={{ ...mensagem, reacao: reacao ?? mensagem.reacao }}
                onReact={handleReact}
                onFavorite={handleFavorite}
                isFavorita={isFavorita}
                isDestinatario={isDestinatario}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
