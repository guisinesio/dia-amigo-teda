import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;

  if (!file) return err("Nenhum arquivo enviado.");
  if (!ALLOWED_TYPES.includes(file.type)) return err("Formato inválido. Use JPG, PNG ou WebP.");
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return err(`Imagem muito grande. Máximo ${MAX_SIZE_MB}MB.`);

  const ext = file.type.split("/")[1] ?? "jpg";
  const filename = `mensagens/${Date.now()}-${session.matricula}.${ext}`;

  const blob = await put(filename, file, { access: "public" });

  // Retorna a URL pública do blob como identificador
  return ok({ fileId: blob.url }, 201);
}
