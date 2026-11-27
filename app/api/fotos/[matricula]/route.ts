import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireRH, isErrorResponse } from "@/lib/api-helpers";

// 7 days — long enough to benefit from CDN cache, short enough that
// a re-upload propagates within a week even on stale clients.
const CACHE_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matricula: string }> }
) {
  const session = await requireRH();
  if (isErrorResponse(session)) return session;

  const { matricula } = await params;
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;

  if (!file) return err("Nenhum arquivo enviado.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return err("Formato inválido. Use JPG, PNG ou WebP.");

  // Always store as .webp — client compresses before upload.
  // Overwriting the same path invalidates the CDN cache for new requests.
  const blob = await put(`fotos/${matricula}.webp`, file, {
    access: "public",
    cacheControlMaxAge: CACHE_MAX_AGE,
  });

  // Append a version timestamp so browsers treat a re-upload as a new URL,
  // bypassing any cached copy from a previous session.
  const versionedUrl = `${blob.url}?v=${Date.now()}`;

  const result = await callGas({
    action: "colaboradores.updateFoto",
    payload: { matricula, fotoUrl: versionedUrl },
  });

  if (!result.ok) return err(result.error ?? "Erro ao atualizar foto.");
  return ok({ url: versionedUrl });
}
