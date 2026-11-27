/**
 * Compresses and resizes an image file in the browser using Canvas API.
 * Outputs WebP at max 400×400px, targeting ~20–30 KB.
 */
export async function compressImage(file: File): Promise<File> {
  const MAX_SIDE = 400;
  const QUALITY_STEPS = [0.82, 0.72, 0.60, 0.48];
  const TARGET_BYTES = 50 * 1024; // hard cap 50 KB

  const bitmap = await createImageBitmap(file);

  const { width: origW, height: origH } = bitmap;
  const scale = Math.min(1, MAX_SIDE / Math.max(origW, origH));
  const w = Math.round(origW * scale);
  const h = Math.round(origH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  for (const quality of QUALITY_STEPS) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (!blob) continue;
    if (blob.size <= TARGET_BYTES || quality === QUALITY_STEPS[QUALITY_STEPS.length - 1]) {
      return new File([blob], "foto.webp", { type: "image/webp" });
    }
  }

  // Fallback: return first attempt
  const fallback = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82)
  );
  return new File([fallback!], "foto.webp", { type: "image/webp" });
}
