import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { callGas } from "@/lib/gas-client";
import { ok, err, requireRH, isErrorResponse } from "@/lib/api-helpers";

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

  const ext = file.type.split("/")[1] ?? "jpg";
  const blob = await put(`fotos/${matricula}.${ext}`, file, { access: "public" });

  // Atualiza o FotoDriveId na planilha com a URL do Blob
  const result = await callGas({
    action: "colaboradores.updateFoto",
    payload: { matricula, fotoUrl: blob.url },
  });

  if (!result.ok) return err(result.error ?? "Erro ao atualizar foto.");
  return ok({ url: blob.url });
}
