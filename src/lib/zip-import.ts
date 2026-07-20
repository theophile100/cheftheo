import JSZip from "jszip";

export interface ZipExtractResult {
  error?: string;
  files: { filename: string; text: string }[];
}

// Extrait tous les fichiers .json d'un ZIP (encode en base64 par le client),
// tries par nom pour un ordre previsible. Chaque fichier est ensuite
// analyse independamment par parseUniteImportJson -- une unite corrompue
// n'empeche pas les autres d'etre importees.
export async function extractJsonFilesFromZip(base64: string): Promise<ZipExtractResult> {
  let zip: JSZip;
  try {
    const buffer = Buffer.from(base64, "base64");
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return { error: "Fichier ZIP invalide ou corrompu.", files: [] };
  }

  const entries = Object.values(zip.files)
    .filter((f) => !f.dir && f.name.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name));

  const files: { filename: string; text: string }[] = [];
  for (const entry of entries) {
    try {
      const text = await entry.async("string");
      files.push({ filename: entry.name, text });
    } catch {
      // Entree illisible (rare, archive partiellement corrompue) : ignoree,
      // les autres fichiers du ZIP restent importables.
    }
  }

  return { files };
}
