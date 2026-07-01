import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function requireSession(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return err("Não autenticado.", 401);
  return session;
}

export async function requireRH(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return err("Não autenticado.", 401);
  if (!session.rh) return err("Acesso restrito ao RH.", 403);
  return session;
}

export function isErrorResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
