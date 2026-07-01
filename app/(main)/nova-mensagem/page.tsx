"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ColaboradorSearch } from "@/components/compose/ColaboradorSearch";
import { MusicSearch } from "@/components/compose/MusicSearch";
import { PhotoUpload } from "@/components/compose/PhotoUpload";
import type { ColaboradorPublico } from "@/types/colaborador";
import type { YoutubeVideo } from "@/app/api/youtube/search/route";

export default function NovaMensagemPage() {
  const router = useRouter();

  const [destinatario, setDestinatario] = useState<ColaboradorPublico | null>(null);
  const [texto, setTexto] = useState("");
  const [imagemDriveId, setImagemDriveId] = useState<string | null>(null);
  const [video, setVideo] = useState<YoutubeVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!destinatario || !texto.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatarioMatricula: destinatario.matricula,
          texto: texto.trim(),
          imagemBase64: null,
          imagemDriveId: imagemDriveId ?? null,
          videoYoutubeId: video?.videoId ?? null,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? "Erro ao enviar mensagem.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="text-6xl"
        >
          💌
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg font-bold text-ink">Mensagem enviada!</p>
          <p className="mt-1 text-sm text-ink-faint">
            {destinatario?.nome} vai receber com muito carinho.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <Button variant="secondary" onClick={() => { setSuccess(false); setDestinatario(null); setTexto(""); setImagemDriveId(null); setVideo(null); }}>
            Enviar outra
          </Button>
          <Button onClick={() => router.push("/enviadas")}>
            Ver enviadas
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-line bg-paper px-5 py-5 lg:px-8">
        <div className="flex items-center gap-2">
          <Send size={20} className="text-brand" />
          <h1 className="text-lg font-bold text-ink">Nova Mensagem</h1>
        </div>
        <p className="mt-0.5 text-sm text-ink-faint">Escreva uma carta especial para um colega 💙</p>
      </div>

      <div className="flex flex-col gap-5 px-5 py-6 lg:px-8">
        {/* Destinatário */}
        <ColaboradorSearch
          selected={destinatario}
          onSelect={setDestinatario}
          onClear={() => setDestinatario(null)}
        />

        {/* Mensagem */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Sua mensagem
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva algo especial... pode ser um elogio, uma lembrança, um agradecimento. Seja você mesmo! ✨"
            rows={6}
            className="w-full resize-none rounded-2xl border border-line bg-paper-soft px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-all focus:border-brand focus:bg-paper focus:ring-4 focus:ring-brand/10 leading-relaxed"
          />
          <p className="mt-1 text-right text-xs text-ink-faint">{texto.length} caracteres</p>
        </div>

        {/* Foto */}
        <PhotoUpload
          fileId={imagemDriveId}
          onUpload={setImagemDriveId}
          onClear={() => setImagemDriveId(null)}
        />

        {/* Música */}
        <MusicSearch
          selected={video}
          onSelect={setVideo}
          onClear={() => setVideo(null)}
        />

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Send */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleSend}
          disabled={!destinatario || !texto.trim() || loading}
        >
          <Send size={18} />
          {loading ? "Enviando..." : "Enviar mensagem"}
        </Button>
      </div>
    </div>
  );
}
