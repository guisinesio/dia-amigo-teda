import { NextResponse } from "next/server";
import { callGas } from "@/lib/gas-client";

// Chamado no carregamento inicial para "acordar" o GAS e evitar cold start nas próximas ações.
// É uma rota pública — não expõe dados sensíveis.
export async function GET() {
  try {
    await callGas({ action: "ping", payload: {} });
  } catch {
    // Ignora erros — o objetivo é apenas aquecer o servidor
  }
  return NextResponse.json({ ok: true });
}
