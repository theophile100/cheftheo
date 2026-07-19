// Format d'import d'une unite complete (titre + leçons + questions), en
// JSON (structure imbriquee complete, tous types de question) ou CSV
// (aplati : une ligne = une question qcm, regroupee par colonne "lecon").
// Reutilise le format de question deja etabli par question-import.ts.
import {
  type ImportRow,
  validateQuestionList,
  parseCsvHeader,
  csvLinesToRows,
  csvRowToQuestion,
  looksLikeJson,
} from "./question-import";

// Colonne "lecon" acceptee sous plusieurs orthographes/langues courantes,
// une fois l'en-tete normalise (accents/majuscules retires par
// parseCsvHeader) -- un admin qui tape "Leçon" ou "Lesson" ne doit pas se
// heurter a une erreur de format.
const LECON_COLUMN_ALIASES = ["lecon", "lesson", "titre_lecon", "nom_lecon"];

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

// CSV : une ligne = une question qcm, avec une colonne "lecon" qui indique
// à quelle leçon elle appartient. L'ordre des leçons suit leur premiere
// apparition dans le fichier. Le titre de l'unite n'a pas de colonne dediee
// (il n'y a qu'une unite par fichier) : il est saisi a part, dans le
// formulaire d'import.
export function parseUniteImportCsv(uniteTitle: string, text: string): ParsedUniteFile {
  if (!uniteTitle.trim()) {
    return { error: "Le titre de l'unité est requis pour un import CSV.", uniteTitle: null, lecons: [] };
  }

  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      error: "Le fichier CSV doit avoir un en-tête et au moins une ligne.",
      uniteTitle: uniteTitle.trim(),
      lecons: [],
    };
  }

  const header = parseCsvHeader(lines[0]);
  const leconColumn = LECON_COLUMN_ALIASES.find((alias) => header.includes(alias));
  if (!leconColumn) {
    return {
      error:
        'Le fichier CSV doit avoir une colonne "leçon" (ou "lesson") indiquant la leçon de chaque question.',
      uniteTitle: uniteTitle.trim(),
      lecons: [],
    };
  }

  const rows = csvLinesToRows(header, lines.slice(1));

  const order: string[] = [];
  const grouped = new Map<string, { row: Record<string, string>; lineIndex: number }[]>();
  rows.forEach((row, i) => {
    const leconTitre = row[leconColumn]?.trim() || `(ligne ${i + 2} sans leçon)`;
    if (!grouped.has(leconTitre)) {
      order.push(leconTitre);
      grouped.set(leconTitre, []);
    }
    grouped.get(leconTitre)!.push({ row, lineIndex: i + 1 });
  });

  const lecons: ParsedUniteLecon[] = order.map((titre) => {
    const entries = grouped.get(titre)!;
    const importRows: ImportRow[] = entries.map(({ row, lineIndex }) => {
      const { question, error } = csvRowToQuestion(row);
      return { index: lineIndex, question, error };
    });
    return { titre, rows: importRows };
  });

  return { error: null, uniteTitle: uniteTitle.trim(), lecons };
}

// Detection par contenu (pas par extension de fichier) : accepte n'importe
// quel fichier ou texte collé directement, du moment que son contenu est
// du JSON ou du CSV valide.
export function parseUniteImportFile(uniteTitleOverride: string, text: string): ParsedUniteFile {
  if (looksLikeJson(text)) return parseUniteImportJson(text);
  return parseUniteImportCsv(uniteTitleOverride, text);
}
