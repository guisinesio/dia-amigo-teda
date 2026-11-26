import { NextResponse } from "next/server";
import { callGas } from "@/lib/gas-client";
import { requireRH, isErrorResponse } from "@/lib/api-helpers";

// Rota de diagnóstico — acesso restrito ao RH. Remover após go-live.
export async function GET() {
  const session = await requireRH();
  if (isErrorResponse(session)) return session;

  // Never expose the actual GAS URL or token value.
  const hasGasUrl = !!process.env.GAS_WEBAPP_URL;
  const hasToken = !!process.env.GAS_TOKEN;

  try {
    const [search, mural] = await Promise.all([
      callGas({ action: "colaboradores.search", payload: { query: "a" } }),
      callGas({ action: "mensagens.mural" }),
    ]);
    return NextResponse.json({ hasGasUrl, hasToken, search, mural });
  } catch {
    return NextResponse.json(
      { hasGasUrl, hasToken, error: "Erro de conexão com o servidor." },
      { status: 502 }
    );
  }
}
