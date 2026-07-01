import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";

type Params = Promise<{ id: string }>;

// GET /api/mensagens/[id] — busca mensagem individual
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const { id } = await params;

  const result = await callGas({
    action: "mensagens.get",
    payload: { id, matricula: session.matricula },
  });

  if (!result.ok) return err(result.error ?? "Mensagem não encontrada.", 404);
  return ok(result.data);
}

// PATCH /api/mensagens/[id] — marcar lida, favoritar
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const acao: string = body.acao ?? "";

  if (acao === "markRead") {
    const result = await callGas({
      action: "mensagens.markRead",
      payload: { id, matricula: session.matricula },
    });
    if (!result.ok) return err(result.error ?? "Erro.");
    return ok(result.data);
  }

  if (acao === "toggleFavorite") {
    const result = await callGas({
      action: "mensagens.toggleFavorite",
      payload: { id, matricula: session.matricula },
    });
    if (!result.ok) return err(result.error ?? "Erro.");
    return ok(result.data);
  }

  return err("Ação inválida.");
}
