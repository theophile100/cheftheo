// Format d'import en masse des questions (JSON ou CSV), utilise par
// l'action serveur importQuestions et par le formulaire d'import admin.
// Voir la doc utilisateur dans /admin/lecons/[id]/questions/import.

export interface ImportedOption {
  text: string;
  image?: string;
  correct?: boolean;
}

export interface ImportedQuestion {
  type: "qcm" | "associer" | "ordonner";
  prompt: string;
  explanation?: string;
  image?: string;
  options?: ImportedOption[];
  pairs?: { left: string; right: string }[];
  steps?: string[];
}

export interface ImportRow {
  index: number;
  question: ImportedQuestion | null;
  error: string | null;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function validateImportedQuestion(q: ImportedQuestion): string | null {
  if (!q.type || !["qcm", "associer", "ordonner"].includes(q.type)) {
    return "type doit être qcm, associer ou ordonner.";
  }
  if (!q.prompt || !q.prompt.trim()) return "prompt (énoncé) manquant.";

  if (q.type === "qcm") {
    if (!q.options || q.options.length < 2) return "qcm : au moins 2 options requises.";
    if (q.options.some((o) => !o.text?.trim() && !o.image)) {
      return "qcm : chaque option doit avoir un texte ou une image.";
    }
    if (!q.options.some((o) => o.correct)) return "qcm : aucune option marquée correct=true.";
    if (q.options.filter((o) => o.correct).length > 1) {
      return "qcm : une seule option peut être correct=true.";
    }
  }

  if (q.type === "associer") {
    if (!q.pairs || q.pairs.length < 2) return "associer : au moins 2 paires requises.";
    if (q.pairs.some((p) => !p.left?.trim() || !p.right?.trim())) {
      return "associer : chaque paire doit avoir left et right remplis.";
    }
  }

  if (q.type === "ordonner") {
    if (!q.steps || q.steps.length < 2) return "ordonner : au moins 2 étapes requises.";
    if (q.steps.some((s) => !s?.trim())) return "ordonner : chaque étape doit avoir un texte.";
  }

  return null;
}

export function toQuestionData(q: ImportedQuestion) {
  if (q.type === "qcm") {
    const options = (q.options ?? []).map((o) => ({
      id: newId(),
      text: o.text ?? "",
      ...(o.image ? { image_url: o.image } : {}),
    }));
    const correctIndex = (q.options ?? []).findIndex((o) => o.correct);
    return { options, correct_option_id: options[correctIndex]?.id ?? "" };
  }
  if (q.type === "associer") {
    return {
      pairs: (q.pairs ?? []).map((p) => ({
        left: { id: newId(), text: p.left },
        right: { id: newId(), text: p.right },
      })),
    };
  }
  return { steps: (q.steps ?? []).map((s) => ({ id: newId(), text: s })) };
}

// Valide une liste deja parsee (utilise directement par l'import d'unite
// complete, ou indirectement par parseQuestionsJson ci-dessous pour
// l'import question-par-question).
export function validateQuestionList(list: unknown[]): ImportRow[] {
  return list.map((item, i) => {
    const index = i + 1;
    if (!item || typeof item !== "object") {
      return { index, question: null, error: "Élément invalide (doit être un objet)." };
    }
    const q = item as ImportedQuestion;
    const error = validateImportedQuestion(q);
    return { index, question: error ? null : q, error };
  });
}

export function parseQuestionsJson(text: string): ImportRow[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [{ index: 1, question: null, error: "Fichier JSON invalide (erreur de syntaxe)." }];
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : null;

  if (!list) {
    return [
      {
        index: 1,
        question: null,
        error: "Le JSON doit être un tableau de questions, ou un objet { \"questions\": [...] }.",
      },
    ];
  }

  return validateQuestionList(list);
}

// Parseur CSV minimal (RFC4180 : champs entre guillemets, guillemets
// doublés pour un guillemet litteral) -- suffisant pour le format qcm
// documente, pas d'ambition de gerer tous les dialectes CSV.
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      fields.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  fields.push(current);
  return fields;
}

// CSV : uniquement pour le type qcm (jusqu'à 4 options), une ligne = une
// question. Pour associer/ordonner, utiliser le format JSON.
export function csvRowToQuestion(row: Record<string, string>): { question: ImportedQuestion | null; error: string | null } {
  if (row.type && row.type !== "qcm") {
    return {
      question: null,
      error: `type "${row.type}" non supporté en CSV (seul qcm l'est) — utilisez le format JSON pour associer/ordonner.`,
    };
  }

  const options: ImportedOption[] = [];
  for (let n = 1; n <= 4; n++) {
    const text = row[`option${n}`];
    const correct = row[`option${n}_correct`];
    if (text) {
      options.push({ text, correct: correct?.toLowerCase() === "true" });
    }
  }

  const q: ImportedQuestion = {
    type: "qcm",
    prompt: row.prompt,
    explanation: row.explanation || undefined,
    image: row.image || undefined,
    options,
  };

  const error = validateImportedQuestion(q);
  return { question: error ? null : q, error };
}

export function csvLinesToRows(header: string[], lines: string[]): Record<string, string>[] {
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((h, idx) => (row[h] = (cells[idx] ?? "").trim()));
    return row;
  });
}

export function parseQuestionsCsv(text: string): ImportRow[] {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return [{ index: 1, question: null, error: "Le fichier CSV doit avoir un en-tête et au moins une ligne." }];
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = csvLinesToRows(header, lines.slice(1));

  return rows.map((row, i) => {
    const { question, error } = csvRowToQuestion(row);
    return { index: i + 1, question, error };
  });
}

export function parseQuestionsFile(filename: string, text: string): ImportRow[] {
  if (filename.toLowerCase().endsWith(".csv")) return parseQuestionsCsv(text);
  return parseQuestionsJson(text);
}
