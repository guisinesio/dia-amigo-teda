import { getSession } from "@/lib/session";
import { ok, err } from "@/lib/api-helpers";

export async function GET() {
  const session = await getSession();
  if (!session) return err("Não autenticado.", 401);
  return ok({
    matricula: session.matricula,
    nome: session.nome,
    setor: session.setor,
    fotoDriveId: session.fotoDriveId ?? null,
    rh: session.rh,
  });
}
