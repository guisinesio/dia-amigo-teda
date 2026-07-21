"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Download, Users, Mail, Eye, EyeOff, Camera, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

interface Colaborador {
  matricula: string;
  nome: string;
  setor: string;
  fotoDriveId: string | null;
}

function FotoUpload({ colaborador, onDone }: { colaborador: Colaborador; onDone: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(!!colaborador.fotoDriveId?.startsWith("http"));

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/fotos/${colaborador.matricula}`, { method: "POST", body: form });
      const json = await res.json();
      if (json.ok) { setDone(true); onDone(json.data.url); }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-mist/50 transition-colors">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mist text-sm font-bold text-ink-soft">
        {colaborador.nome.split(" ").slice(0, 2).map((n: string) => n[0]).join("")}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{colaborador.nome}</p>
        <p className="text-xs text-ink-faint">{colaborador.setor} · {colaborador.matricula}</p>
      </div>
      {done ? (
        <CheckCircle size={18} className="flex-shrink-0 text-emerald-500" />
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {uploading ? <Spinner /> : <Camera size={13} />}
          {uploading ? "Enviando..." : "Upload"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

interface Stats {
  totalColaboradores: number;
  totalParticipantes: number;
  totalMensagens: number;
  lidas: number;
  naoLidas: number;

  porSetor: {
    setor: string;
    total: number;
  }[];

  ranking: {
    nome: string;
    total: number;
  }[];

  rankingRecebidos: {
    matricula: string;
    nome: string;
    total: number;
  }[];

  porDia: {
    data: string;
    total: number;
  }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColab, setLoadingColab] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setStats(j.data); })
      .finally(() => setLoading(false));

    fetch("/api/admin/colaboradores")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setColaboradores(j.data); })
      .finally(() => setLoadingColab(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export");
      const json = await res.json();
      if (!json.ok) return;
      const rows: any[] = json.data;
      const headers = ["ID", "Data", "Remetente", "Setor Remetente", "Destinatário Mat.", "Setor Destinatário", "Visualizada", "Data Visualização"];
      const csv = [
        headers.join(";"),
        ...rows.map((r) =>
          [r.id, r.data, r.remetente, r.setorRemetente, r.destinatarioMatricula, r.setorDestinatario, r.visualizada ? "Sim" : "Não", r.dataVisualizacao].join(";"),
        ),
      ].join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "correio-amigo-export.csv"; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const statCards = stats
    ? [
      { icon: Users, label: "Colaboradores", value: stats.totalColaboradores, color: "bg-mist text-ink-soft" },
      { icon: Users, label: "Participantes", value: stats.totalParticipantes, color: "bg-brand-soft text-brand" },
      { icon: Mail, label: "Mensagens", value: stats.totalMensagens, color: "bg-brand-soft text-brand" },
      { icon: Eye, label: "Lidas", value: stats.lidas, color: "bg-brand-soft text-brand" },
      { icon: EyeOff, label: "Não lidas", value: stats.naoLidas, color: "bg-accent-soft text-accent" },
    ]
    : [];

  const maxDia = Math.max(...(stats?.porDia.map((d) => d.total) ?? [1]));
  const maxSetor = Math.max(...(stats?.porSetor.map((s) => s.total) ?? [1]));

  return (
    <div className="min-h-svh bg-mist">
      {/* Header */}
      <header className="border-b border-line bg-paper px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/inicio" className="rounded-xl p-1.5 hover:bg-mist transition-colors">
              <ChevronLeft size={20} className="text-ink-soft" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-ink">Painel Administrativo</h1>
              <p className="text-xs text-ink-faint">Dia do Amigo Corporativo</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={exporting}>
            <Download size={14} />
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : stats ? (
          <div className="flex flex-col gap-6">
            {/* KPI cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3 lg:grid-cols-5"
            >
              {statCards.map(({ icon: Icon, label, value, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Card className="flex flex-col gap-1 p-4">
                    <div className={`mb-1 flex h-8 w-8 items-center justify-center rounded-xl ${color}`}>
                      <Icon size={15} />
                    </div>
                    <p className="text-2xl font-bold text-ink">{value}</p>
                    <p className="text-xs text-ink-faint">{label}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Mensagens por dia */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-5">
                  <h2 className="mb-4 text-sm font-semibold text-ink">Mensagens por dia</h2>
                  <div className="flex items-end gap-1.5" style={{ height: 120 }}>
                    {stats.porDia.slice(-14).map(({ data, total }) => {
                      const h = Math.max(4, Math.round((total / maxDia) * 104));
                      const d = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(data + "T12:00:00"));
                      return (
                        <div key={data} className="group flex flex-1 flex-col items-center gap-1">
                          <div className="relative flex w-full justify-center">
                            <span className="absolute -top-6 hidden rounded bg-ink px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                              {total}
                            </span>
                          </div>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: h }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                            className="w-full rounded-t-lg bg-brand"
                          />
                          <span className="text-[9px] text-ink-faint">{d}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Por setor */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-5">
                  <h2 className="mb-4 text-sm font-semibold text-ink">Mensagens por setor</h2>
                  <div className="flex flex-col gap-2.5">
                    {stats.porSetor.sort((a, b) => b.total - a.total).slice(0, 8).map(({ setor, total }) => (
                      <div key={setor}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-ink-soft">{setor}</span>
                          <span className="font-medium text-ink">{total}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(total / maxSetor) * 100}%` }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                            className="h-full rounded-full bg-brand"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">

              {/* Ranking  de participacao*/}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-5">
                  <h2 className="mb-4 text-sm font-semibold text-ink">🏆 Ranking de participação</h2>
                  <div className="flex flex-col gap-2">
                    {stats.ranking.map(({ nome, total }, i) => (
                      <div key={nome} className="flex items-center gap-3 rounded-xl p-2 hover:bg-mist transition-colors">
                        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-[#FFD700] text-white" : i === 1 ? "bg-[#C0C0C0] text-white" : i === 2 ? "bg-[#CD7F32] text-white" : "bg-mist text-ink-faint"}`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-ink">{nome}</span>
                        <span className="text-sm font-semibold text-brand">{total} msgs</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Ranking de mensagens recebidas */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Card className="p-5">
                  <h2 className="mb-4 text-sm font-semibold text-ink">
                    💌 Ranking de mensagens recebidas
                  </h2>

                  <div className="flex flex-col gap-2">
                    {stats.rankingRecebidos.map(({ nome, total }, i) => (
                      <div
                        key={nome}
                        className="flex items-center gap-3 rounded-xl p-2 hover:bg-mist transition-colors"
                      >
                        <span
                          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0
                              ? "bg-[#FFD700] text-white"
                              : i === 1
                                ? "bg-[#C0C0C0] text-white"
                                : i === 2
                                  ? "bg-[#CD7F32] text-white"
                                  : "bg-mist text-ink-faint"
                            }`}
                        >
                          {i + 1}
                        </span>

                        <span className="flex-1 text-sm text-ink">
                          {nome}
                        </span>

                        <span className="text-sm font-semibold text-brand">
                          {total} msgs
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Upload de fotos */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="p-5">
                <h2 className="mb-1 text-sm font-semibold text-ink">Fotos dos colaboradores</h2>
                <p className="mb-4 text-xs text-ink-faint">Faça upload das fotos para exibir no mural e no perfil.</p>
                {loadingColab ? (
                  <div className="flex justify-center py-6"><Spinner /></div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {colaboradores.map((c) => (
                      <FotoUpload
                        key={c.matricula}
                        colaborador={c}
                        onDone={(url) => setColaboradores((prev) =>
                          prev.map((x) => x.matricula === c.matricula ? { ...x, fotoDriveId: url } : x)
                        )}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        ) : (
          <p className="py-20 text-center text-sm text-ink-faint">Nenhum dado disponível.</p>
        )}
      </div>
    </div>
  );
}
