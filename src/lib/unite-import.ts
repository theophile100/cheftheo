// Format d'import d'une unite complete (titre + leçons + questions), en
// JSON uniquement -- la structure imbriquee ne se prete pas au CSV.
// Reutilise le format de question deja etabli par question-import.ts.
import { type ImportRow, validateQuestionList } from "./question-import";

export interface ParsedUniteLecon {
  titre: string;
  rows: ImportRow[];
}

export interface ParsedUniteFile {
  error: string | null;
  uniteTitle: string | null;
  lecons: ParsedUniteLecon[];
}

export function parseUniteImportJson(text: string): ParsedUniteFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "Fichier JSON invalide (erreur de syntaxe).", uniteTitle: null, lecons: [] };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      error: 'Le JSON doit être un objet { "unite": "...", "lecons": [...] }.',
      uniteTitle: null,
      lecons: [],
    };
  }

  const obj = parsed as { unite?: unknown; lecons?: unknown };

  if (!obj.unite || typeof obj.unite !== "string" || !obj.unite.trim()) {
    return { error: 'Le champ "unite" (titre, texte) est requis.', uniteTitle: null, lecons: [] };
  }

  if (!Array.isArray(obj.lecons) || obj.lecons.length === 0) {
    return {
      error: 'Le champ "lecons" doit être un tableau non vide.',
      uniteTitle: obj.unite.trim(),
      lecons: [],
    };
  }

  const lecons: ParsedUniteLecon[] = obj.lecons.map((item, i) => {
    if (!item || typeof item !== "object") {
      return {
        titre: `(leçon ${i + 1} invalide)`,
        rows: [{ index: 1, question: null, error: "Élément de leçon invalide (doit être un objet)." }],
      };
    }
    const l = item as { titre?: unknown; questions?: unknown };
    const titre = typeof l.titre === "string" && l.titre.trim() ? l.titre.trim() : `(leçon ${i + 1} sans titre)`;

    if (!Array.isArray(l.questions)) {
      return { titre, rows: [{ index: 1, question: null, error: '"questions" doit être un tableau.' }] };
    }

    return { titre, rows: validateQuestionList(l.questions) };
  });

  return { error: null, uniteTitle: obj.unite.trim(), lecons };
}
