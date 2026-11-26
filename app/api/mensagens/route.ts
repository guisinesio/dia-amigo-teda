import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";
import type { NovaMensagemInput } from "@/types/mensagem";

const MAX_TEXTO_LENGTH = 2000;
const MATRICULA_RE = /^\d{1,20}$/;

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

  const destinatario = (body.destinatarioMatricula ?? "").trim();
  const texto = (body.texto ?? "").trim();

  if (!destinatario || !texto) {
    return err("Destinatário e mensagem são obrigatórios.");
  }
  if (!MATRICULA_RE.test(destinatario)) {
    return err("Destinatário inválido.");
  }
  if (texto.length > MAX_TEXTO_LENGTH) {
    return err(`A mensagem não pode ter mais de ${MAX_TEXTO_LENGTH} caracteres.`);
  }

  const result = await callGas({
    action: "mensagens.create",
    payload: {
      remetenteMatricula: session.matricula,
      destinatarioMatricula: destinatario,
      texto,
      imagemDriveId: body.imagemDriveId ?? null,
      videoYoutubeId: body.videoYoutubeId ?? null,
    },
  });

  if (!result.ok) return err(result.error ?? "Erro ao enviar mensagem.");
  return ok(result.data, 201);
}
