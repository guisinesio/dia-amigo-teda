/**
 * Converte um fileId do Google Drive em URL pública,
 * ou retorna a URL diretamente se já for uma URL completa (ex: Vercel Blob).
 */
export function driveImageUrl(fileIdOrUrl: string | null | undefined): string | null {
  if (!fileIdOrUrl) return null;
  if (fileIdOrUrl.startsWith("http")) return fileIdOrUrl;
  return `https://drive.google.com/uc?export=view&id=${fileIdOrUrl}`;
}
