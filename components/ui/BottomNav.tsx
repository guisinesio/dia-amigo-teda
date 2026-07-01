"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, Send, User, Plus, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  unreadCount?: number;
}

const items = [
  { href: "/inicio", icon: Home, label: "Início" },
  { href: "/inbox", icon: Inbox, label: "Mensagens" },
  { href: "/nova-mensagem", icon: Plus, label: "Novo", special: true },
  { href: "/mural", icon: LayoutGrid, label: "Mural" },
  { href: "/perfil", icon: User, label: "Perfil" },
];

export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-paper/90 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map(({ href, icon: Icon, label, special }) => {
          const active = pathname.startsWith(href);
          const isInbox = href === "/inbox";

          if (special) {
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30"
                >
                  <Icon size={22} />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={href} href={href} className="relative flex flex-col items-center gap-1 px-3">
              <div className="relative">
                <Icon
                  size={22}
                  className={cn(
                    "transition-colors",
                    active ? "text-brand" : "text-ink-faint",
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-brand" : "text-ink-faint",
                )}
              >
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0 h-0.5 w-8 rounded-full bg-brand"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
