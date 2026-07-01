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
      <div className="px-5 pb-8 pt-8 lg:px-8 lg:pt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-ink-faint">{saudacao()},</p>
            <h1 className="text-2xl font-bold text-ink">
              {primeiroNome} 👋
            </h1>
          </div>
          {user && (
            <Avatar
              src={driveImageUrl(user.fotoDriveId)}
              name={user.nome}
              size="md"
            />
          )}
        </motion.div>

        {/* Unread summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-6 rounded-3xl border border-line bg-paper p-5 shadow-[var(--shadow-card)]"
        >
          {loading ? (
            <div className="h-12 animate-pulse rounded-2xl bg-mist" />
          ) : naoLidas > 0 ? (
            <>
              <p className="text-base font-semibold text-ink">
                Você recebeu {naoLidas} {naoLidas === 1 ? "mensagem" : "mensagens"} ❤️
              </p>
              <p className="mb-4 mt-0.5 text-sm text-ink-faint">
                {naoLidas === 1 ? "Alguém pensou em você!" : "Pessoas especiais pensaram em você!"}
              </p>
            </>
          ) : total > 0 ? (
            <>
              <p className="text-base font-semibold text-ink">Tudo lido! ✨</p>
              <p className="mb-4 mt-0.5 text-sm text-ink-faint">Você leu todas as suas mensagens.</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-ink">Bem-vindo! 💌</p>
              <p className="mb-4 mt-0.5 text-sm text-ink-faint">Suas mensagens aparecerão aqui.</p>
            </>
          )}
          {total > 0 && <UnreadProgressBar total={total} naoLidas={naoLidas} />}
        </motion.div>

        {/* Action cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-3"
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
      </div>
    </div>
  );
}
