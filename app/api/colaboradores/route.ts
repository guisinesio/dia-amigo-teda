import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";
import type { ColaboradorPublico } from "@/types/colaborador";

const MAX_QUERY_LENGTH = 100;

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const query = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (query.length < 2) return ok([]);
  if (query.length > MAX_QUERY_LENGTH) return err("Consulta muito longa.");

  const result = await callGas<ColaboradorPublico[]>({
    action: "colaboradores.search",
    payload: { query },
  });

  if (!result.ok) return err(result.error ?? "Erro na busca.");
  return ok(result.data ?? []);
}
