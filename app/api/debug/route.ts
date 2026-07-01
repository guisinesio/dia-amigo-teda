import { NextResponse } from "next/server";
import { callGas } from "@/lib/gas-client";

// Rota de diagnóstico — remover após confirmar que o GAS está funcionando
export async function GET() {
  const gasUrl = process.env.GAS_WEBAPP_URL ?? "(não configurado)";
  const hasToken = !!process.env.GAS_TOKEN;

  console.log("[debug] GAS_WEBAPP_URL:", gasUrl);
  console.log("[debug] GAS_TOKEN configurado:", hasToken);

  try {
    const [search, mural] = await Promise.all([
      callGas({ action: "colaboradores.search", payload: { query: "a" } }),
      callGas({ action: "mensagens.mural" }),
    ]);
    return NextResponse.json({ gasUrl, hasToken, search, mural });
  } catch (e: any) {
    return NextResponse.json({ gasUrl, hasToken, error: e.message });
  }
}
