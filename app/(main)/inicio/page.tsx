"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Inbox, Send, Plus, User, Shield } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useInbox } from "@/hooks/useInbox";
import { UnreadProgressBar } from "@/components/inbox/UnreadProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { driveImageUrl } from "@/lib/drive";
import { cn } from "@/lib/utils";

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const actions = [
  { href: "/inbox", icon: Inbox, label: "Caixa de\nEntrada", color: "bg-brand-soft text-brand", badge: true },
  { href: "/nova-mensagem", icon: Plus, label: "Nova\nMensagem", color: "bg-brand text-white", primary: true },
  { href: "/enviadas", icon: Send, label: "Mensagens\nEnviadas", color: "bg-mist text-ink-soft" },
  { href: "/perfil", icon: User, label: "Meu\nPerfil", color: "bg-mist text-ink-soft" },
];

export default function InicioPage() {
  const user = useSession();
  const { naoLidas, total, loading } = useInbox();

  const primeiroNome = user?.nome.split(" ")[0] ?? "";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Banner natalino */}
      <div
        className="relative overflow-hidden px-5 pb-7 pt-8 lg:px-8 lg:pt-10"
        style={{
          background: "linear-gradient(135deg, #2d5a27 0%, #c41e3a 100%)",
        }}
      >
        {/* Flocos decorativos */}
        {["12%","28%","45%","62%","78%","91%"].map((left, i) => (
          <span
            key={i}
            className="christmas-flake text-white/25"
            style={{
              left,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${6 + i * 0.8}s`,
              fontSize: i % 2 === 0 ? "0.9rem" : "0.6rem",
            }}
          >❄</span>
        ))}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-white/70">{saudacao()},</p>
            <h1 className="text-2xl font-bold text-white">
              {primeiroNome} 🎄
            </h1>
            <p className="mt-1 text-xs font-semibold text-white/60 tracking-wide uppercase">
              Correio TEDA | Natal 2026
            </p>
          </div>
          {user && (
            <div className="relative">
              <Avatar
                src={driveImageUrl(user.fotoDriveId)}
                name={user.nome}
                size="md"
              />
              <span className="absolute -top-1 -right-1 text-base">⭐</span>
            </div>
          )}
        </motion.div>

        {/* Unread summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative z-10 mt-5 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-sm"
        >
          {loading ? (
            <div className="h-10 animate-pulse rounded-xl bg-white/20" />
          ) : naoLidas > 0 ? (
            <>
              <p className="text-base font-semibold text-white">
                Você recebeu {naoLidas} {naoLidas === 1 ? "cartinha" : "cartinhas"} natalina{naoLidas !== 1 ? "s" : ""} 🎁
              </p>
              <p className="mb-3 mt-0.5 text-sm text-white/70">
                {naoLidas === 1 ? "Alguém pensou em você!" : "Pessoas especiais pensaram em você!"}
              </p>
            </>
          ) : total > 0 ? (
            <>
              <p className="text-base font-semibold text-white">Tudo lido! ✨</p>
              <p className="mb-3 mt-0.5 text-sm text-white/70">Você leu todas as suas cartinhas.</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-white">Bem-vindo ao Correio TEDA! 💌</p>
              <p className="mb-3 mt-0.5 text-sm text-white/70">Suas cartinhas natalinas aparecerão aqui.</p>
            </>
          )}
          {total > 0 && <UnreadProgressBar total={total} naoLidas={naoLidas} />}
        </motion.div>
      </div>

      <div className="px-5 pb-8 pt-5 lg:px-8">
        {/* Action cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          {actions.map(({ href, icon: Icon, label, color, primary, badge }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col gap-3 rounded-3xl p-5 transition-all active:scale-[0.97]",
                  "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
                  primary ? "bg-brand text-white" : "bg-paper border border-line",
                )}
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", color, primary && "bg-white/20")}>
                  <Icon size={20} className={primary ? "text-white" : ""} />
                </div>
                {badge && naoLidas > 0 && (
                  <span className="absolute right-4 top-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                    {naoLidas}
                  </span>
                )}
                <p className={cn("whitespace-pre-line text-sm font-semibold leading-tight", primary ? "text-white" : "text-ink")}>
                  {label}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Admin access */}
        {user?.rh && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 shadow-[var(--shadow-card)] transition-colors hover:bg-mist"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mist">
                <Shield size={17} className="text-ink-soft" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Painel Administrativo</p>
                <p className="text-xs text-ink-faint">Acesso exclusivo do RH</p>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Rodapé natalino */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center text-xs text-ink-faint"
        >
          🎄 Compartilhe o espírito do Natal com seus colegas
        </motion.p>
      </div>
    </div>
  );
}
