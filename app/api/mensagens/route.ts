import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";
import type { NovaMensagemInput } from "@/types/mensagem";

// GET /api/mensagens?tipo=inbox|sent
export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const tipo = req.nextUrl.searchParams.get("tipo") ?? "inbox";
  const action = tipo === "sent" ? "mensagens.sent" : "mensagens.inbox";

  const result = await callGas({
    action,
    payload: { matricula: session.matricula },
  });

  if (!result.ok) return err(result.error ?? "Erro ao carregar mensagens.");
  return ok(result.data);
}

// POST /api/mensagens
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body: NovaMensagemInput = await req.json().catch(() => ({}));

  if (!body.destinatarioMatricula || !body.texto?.trim()) {
    return err("Destinatário e mensagem são obrigatórios.");
  }

  const result = await callGas({
    action: "mensagens.create",
    payload: {
      remetenteMatricula: session.matricula,
      destinatarioMatricula: body.destinatarioMatricula,
      texto: body.texto.trim(),
      imagemDriveId: body.imagemDriveId ?? null,
      videoYoutubeId: body.videoYoutubeId ?? null,
    },
  });

  if (!result.ok) return err(result.error ?? "Erro ao enviar mensagem.");
  return ok(result.data, 201);
}
