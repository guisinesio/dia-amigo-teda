import { callGas } from "@/lib/gas-client";
import { ok, err, requireRH, isErrorResponse } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireRH();
  if (isErrorResponse(session)) return session;

  const result = await callGas({
    action: "admin.stats",
    payload: { matricula: session.matricula },
  });

  if (!result.ok) return err(result.error ?? "Erro ao carregar estatísticas.");
  return ok(result.data);
}
