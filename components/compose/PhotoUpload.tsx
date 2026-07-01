"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

interface PhotoUploadProps {
  onUpload: (fileId: string) => void;
  onClear: () => void;
  fileId: string | null;
}

export function PhotoUpload({ onUpload, onClear, fileId }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    const url = URL.createObjectURL(file);
    setPreview(url);

    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      onUpload(json.data.fileId);
    } catch (e: any) {
      setError(e.message ?? "Erro ao enviar foto.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        <ImagePlus size={14} /> Adicionar foto
        <span className="text-ink-faint font-normal">(opcional)</span>
      </p>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl border border-line"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-h-56 w-full object-cover" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <Spinner className="border-white border-t-white/30" />
              </div>
            )}
            {!loading && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-paper-soft text-ink-faint transition-all hover:border-brand/40 hover:bg-brand-soft/20 hover:text-brand"
          >
            <ImagePlus size={22} />
            <span className="text-sm">Clique para adicionar uma foto</span>
          </motion.button>
        )}
      </AnimatePresence>

      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
