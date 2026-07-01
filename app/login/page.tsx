"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [matricula, setMatricula] = useState("");
  const [nascimento, setNascimento] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ matricula: matricula.trim(), nascimento });
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-mist px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo / Ícone */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#1a4a8a] shadow-xl shadow-blue-900/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="TEDA Distribuição" className="h-full w-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-ink">Correio do Amigo</h1>
            <p className="mt-0.5 text-sm text-ink-faint">TEDA Distribuição</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-3xl border border-line bg-paper p-7 shadow-[var(--shadow-card)]"
        >
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
                  {error} 💙
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Campanha interna — apenas colaboradores
        </p>
      </motion.div>
    </main>
  );
}
