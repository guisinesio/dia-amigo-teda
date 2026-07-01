import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";
import { REACOES } from "@/types/reacao";
import type { TipoReacao } from "@/types/mensagem";

const TIPOS_VALIDOS = REACOES.map((r) => r.tipo);

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await req.json().catch(() => ({}));
  const { mensagemId, tipo } = body as { mensagemId: string; tipo: TipoReacao };

  if (!mensagemId || !TIPOS_VALIDOS.includes(tipo)) {
    return err("Dados inválidos.");
  }

  const result = await callGas({
    action: "reacoes.add",
    payload: { mensagemId, tipo, matricula: session.matricula },
  });

  if (!result.ok) return err(result.error ?? "Erro ao reagir.");
  return ok(result.data);
}
