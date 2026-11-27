"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Snowflakes } from "@/components/ui/Snowflakes";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [matricula, setMatricula] = useState("");
  const [nascimento, setNascimento] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ matricula: matricula.trim(), nascimento });
  };

  return (
    <main
      className="relative flex min-h-svh flex-col items-center justify-center px-5 py-6 sm:py-12 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #2d5a27 0%, #1d4020 40%, #c41e3a 100%)",
      }}
    >
      {/* Flocos de neve decorativos */}
      <Snowflakes count={10} opacity={0.5} />

      {/* Estrelas decorativas */}
      <div className="pointer-events-none absolute inset-0">
        {["top-[12%] left-[8%]", "top-[8%] right-[12%]", "top-[35%] left-[5%]", "top-[55%] right-[6%]", "bottom-[20%] left-[14%]", "bottom-[12%] right-[9%]"].map((pos, i) => (
          <span
            key={i}
            className="christmas-sparkle absolute text-white/30"
            style={{ animationDelay: `${i * 0.5}s`, fontSize: i % 2 === 0 ? "1.1rem" : "0.75rem" }}
          >
            {i % 3 === 0 ? "✦" : i % 3 === 1 ? "✶" : "❋"}
          </span>
        ))}
        {/* decoração extra */}
        <div className={`absolute top-[12%] left-[8%] text-white/30 christmas-sparkle`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo / Ícone */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
          className="mb-5 sm:mb-8 flex flex-col items-center gap-2 sm:gap-3"
        >
          <div className="relative">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-full bg-[#1a4a8a] shadow-xl shadow-black/40 ring-4 ring-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="TEDA Distribuição" className="h-full w-full object-cover" />
            </div>
            <span className="absolute -top-1 -right-1 text-xl">⭐</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white drop-shadow">Correio TEDA</h1>
            <p className="mt-1 text-sm font-semibold text-white/80 tracking-wide">
              Edição Especial de Natal
            </p>
            <p className="mt-0.5 text-xs text-white/50">TEDA Distribuição · 2026</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-3xl border border-white/20 bg-paper p-7 shadow-[var(--shadow-letter)] backdrop-blur-sm"
        >
          {/* Faixa decorativa */}
          <div className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-brand-soft px-4 py-2">
            {/* <span className="text-sm">🎄</span> */}
            <p className="text-xs font-semibold text-brand">Compartilhe o espírito do Natal</p>
            {/* <span className="text-sm">🎄</span> */}
          </div>

          <h2 className="mb-1 text-lg font-semibold text-ink">Entrar</h2>
          <p className="mb-6 text-sm text-ink-faint">
            Use sua matrícula e data de nascimento.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="matricula"
              label="Matrícula (consta atrás do crachá)"
              placeholder="Ex: 12345"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              autoComplete="username"
            />

            <Input
              id="nascimento"
              label="Data de nascimento"
              type="date"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
              required
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
              {loading ? "Entrando..." : "✦ Entrar"}
            </Button>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-xs text-white/50">
          Edição Especial de Natal · Apenas colaboradores
        </p>
      </motion.div>
    </main>
  );
}
