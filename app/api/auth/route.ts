import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { createSession, destroySession } from "@/lib/session";
import { ok, err } from "@/lib/api-helpers";
import type { Colaborador } from "@/types/colaborador";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.matricula || !body?.nascimento) {
    return err("Informe matrícula e data de nascimento.");
  }

  const result = await callGas<Colaborador>({
    action: "auth.login",
    payload: { matricula: body.matricula, nascimento: body.nascimento },
  });

  if (!result.ok || !result.data) {
    return err(result.error ?? "Dados inválidos.", 401);
  }

  const colaborador = result.data;
  await createSession({
    matricula: colaborador.matricula,
    nome: colaborador.nome,
    setor: colaborador.setor,
    fotoDriveId: colaborador.fotoDriveId,
    rh: colaborador.rh ?? false,
  });

  return ok({ nome: colaborador.nome, setor: colaborador.setor, rh: colaborador.rh ?? false });
}

export async function DELETE() {
  await destroySession();
  return ok({ message: "Sessão encerrada." });
}
