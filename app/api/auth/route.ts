import { NextRequest } from "next/server";
import { callGas } from "@/lib/gas-client";
import { createSession, destroySession } from "@/lib/session";
import { ok, err } from "@/lib/api-helpers";
import type { Colaborador } from "@/types/colaborador";

// Matricula: 1-20 digits only
const MATRICULA_RE = /^\d{1,20}$/;
// Date: YYYY-MM-DD
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const matricula: string = (body?.matricula ?? "").trim();
  const nascimento: string = (body?.nascimento ?? "").trim();

  if (!matricula || !nascimento) {
    return err("Informe matrícula e data de nascimento.");
  }
  if (!MATRICULA_RE.test(matricula)) {
    return err("Matrícula inválida.");
  }
  if (!DATE_RE.test(nascimento)) {
    return err("Data de nascimento inválida.");
  }

  const result = await callGas<Colaborador>({
    action: "auth.login",
    payload: { matricula, nascimento },
  });

  if (!result.ok || !result.data) {
    return err("Dados inválidos.", 401);
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
