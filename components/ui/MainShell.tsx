"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Inbox, Send, User, Plus, LogOut, Shield, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "@/contexts/SessionContext";
import { useInbox } from "@/hooks/useInbox";
import { driveImageUrl } from "@/lib/drive";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/inicio", icon: Home, label: "Início" },
  { href: "/inbox", icon: Inbox, label: "Mensagens" },
  { href: "/nova-mensagem", icon: Plus, label: "Nova mensagem" },
  { href: "/enviadas", icon: Send, label: "Enviadas" },
  { href: "/mural", icon: LayoutGrid, label: "Mural" },
  { href: "/perfil", icon: User, label: "Meu perfil" },
];

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useSession();
  const { naoLidas } = useInbox();
  const { logout } = useAuth();

  return (
    <div className="flex h-svh flex-col overflow-hidden lg:flex-row">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex lg:h-full lg:w-64 lg:flex-shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-paper">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a4a8a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="TEDA" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink leading-tight">Correio do Amigo</p>
            <p className="text-[11px] text-ink-faint leading-tight">TEDA Distribuição</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            const isInbox = href === "/inbox";
            return (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-ink-soft hover:bg-mist hover:text-ink",
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="flex-1">{label}</span>
                  {isInbox && naoLidas > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                      {naoLidas > 9 ? "9+" : naoLidas}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {user?.rh && (
            <Link href="/admin">
              <div
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-brand-soft text-brand"
                    : "text-ink-soft hover:bg-mist hover:text-ink",
                )}
              >
                <Shield size={18} />
                <span>Painel RH</span>
              </div>
            </Link>
          )}
        </nav>

        {/* User section */}
        {user && (
          <div className="border-t border-line p-4">
            <div className="flex items-center gap-3">
              <Avatar src={driveImageUrl(user.fotoDriveId)} name={user.nome} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{user.nome}</p>
                <p className="truncate text-xs text-ink-faint">{user.setor}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-1.5 text-ink-faint hover:bg-mist hover:text-ink transition-colors"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-1 flex-col overflow-hidden pb-16 lg:h-full lg:pb-0"
      >
        {children}
      </motion.main>

      {/* Bottom nav — mobile only */}
      <BottomNav unreadCount={naoLidas} />
    </div>
  );
}
