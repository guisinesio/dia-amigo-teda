"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Mail, Send, Heart } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { driveImageUrl } from "@/lib/drive";

interface Perfil {
  nome: string;
  setor: string;
  fotoDriveId?: string | null;
  totalEnviadas: number;
  totalRecebidas: number;
  totalReacoesRecebidas: number;
}

export default function PerfilPage() {
  const user = useSession();
  const { logout } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/colaboradores/${user.matricula}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setPerfil(j.data); })
      .finally(() => setLoading(false));
  }, [user]);

  const stats = [
    { icon: Mail, label: "Recebidas", value: perfil?.totalRecebidas ?? 0, color: "text-brand bg-brand-soft" },
    { icon: Send, label: "Enviadas", value: perfil?.totalEnviadas ?? 0, color: "text-ink-soft bg-mist" },
    { icon: Heart, label: "Reações", value: perfil?.totalReacoesRecebidas ?? 0, color: "text-accent bg-accent-soft" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-line bg-paper px-5 py-5 lg:px-8">
        <h1 className="text-lg font-bold text-ink">Meu Perfil</h1>
      </div>

      <div className="flex flex-col gap-5 px-5 py-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="flex flex-col items-center gap-3 p-7 text-center">
                <Avatar
                  src={driveImageUrl(perfil?.fotoDriveId)}
                  name={perfil?.nome ?? user?.nome ?? ""}
                  size="lg"
                />
                <div>
                  <h2 className="text-lg font-bold text-ink">{perfil?.nome ?? user?.nome}</h2>
                  <p className="text-sm text-ink-faint">{perfil?.setor ?? user?.setor}</p>
                </div>
              </Card>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid grid-cols-3 gap-3"
            >
              {stats.map(({ icon: Icon, label, value, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  <Card className="flex flex-col items-center gap-2 p-4 text-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                      <Icon size={17} />
                    </div>
                    <p className="text-xl font-bold text-ink">{value}</p>
                    <p className="text-xs text-ink-faint">{label}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                variant="ghost"
                size="md"
                className="w-full border border-line"
                onClick={logout}
              >
                <LogOut size={16} />
                Sair da conta
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
