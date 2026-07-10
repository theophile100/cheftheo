// Reste sous la limite de 8 Mo configurée pour les Server Actions (next.config.ts),
// en laissant de la marge pour l'overhead du multipart/form-data.
export const MAX_IMAGE_BYTES = 7 * 1024 * 1024;

export function checkImageSize(file: { size: number }): string | null {
  if (file.size > MAX_IMAGE_BYTES) {
    return "Fichier trop lourd (7 Mo maximum). Essayez un fichier plus léger.";
  }
  return null;
}
