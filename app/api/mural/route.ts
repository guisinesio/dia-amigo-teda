import { callGas } from "@/lib/gas-client";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";

export interface MuralMessage {
  id: string;
  texto: string;
  remetenteNome: string;
  remetenteFotoId: string | null;
  destinatarioNome: string;
  destinatarioFotoId: string | null;
  data: string;
  imagemDriveId: string | null;
  videoYoutubeId: string | null;
}

export async function GET() {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const result = await callGas<MuralMessage[]>({
    action: "mensagens.mural",
  });

  if (!result.ok) return err(result.error ?? "Erro ao carregar mural.");
  return ok(result.data ?? []);
}
