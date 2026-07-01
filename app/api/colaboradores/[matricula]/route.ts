import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matricula: string }> },
) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const { matricula } = await params;

  const result = await callGas({
    action: "colaboradores.get",
    payload: { matricula },
  });

  if (!result.ok) return err(result.error ?? "Colaborador não encontrado.", 404);
  return ok(result.data);
}
