import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionImportForm } from "@/components/admin/QuestionImportForm";

const JSON_EXAMPLE = `[
  {
    "type": "qcm",
    "prompt": "Quelle température à cœur pour un poulet ?",
    "explanation": "74°C élimine les bactéries pathogènes.",
    "options": [
      { "text": "63°C", "correct": false },
      { "text": "74°C", "correct": true },
      { "text": "50°C", "correct": false }
    ]
  },
  {
    "type": "associer",
    "prompt": "Associe chaque ustensile à son usage.",
    "explanation": "Chaque ustensile a une fonction précise.",
    "pairs": [
      { "left": "Fouet", "right": "Monter une crème" },
      { "left": "Chinois", "right": "Filtrer une sauce" }
    ]
  },
  {
    "type": "ordonner",
    "prompt": "Remets les étapes de la pâte à choux dans l'ordre.",
    "explanation": "Le respect de l'ordre garantit une bonne texture.",
    "steps": [
      "Faire bouillir eau, beurre et sel",
      "Ajouter la farine hors du feu",
      "Dessécher la pâte",
      "Incorporer les œufs un à un"
    ]
  }
]`;

const CSV_EXAMPLE = `type,prompt,explanation,image,option1,option1_correct,option2,option2_correct,option3,option3_correct
qcm,Quelle température à cœur pour un poulet ?,74°C élimine les bactéries.,,63°C,false,74°C,true,50°C,false`;

export default async function ImportQuestions({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lecon } = await supabase.from("lecons").select("id, title").eq("id", id).single();
  if (!lecon) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-zinc-400">{lecon.title}</p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Importer des questions
      </h1>

      <div className="mt-6">
        <QuestionImportForm leconId={id} />
      </div>

      <div className="mt-8 flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <div>
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Format JSON (recommandé)</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Un tableau de questions. Gère les 3 types (qcm, associer, ordonner) et les images.
            Pour <code>image</code> (question ou option), collez l&apos;adresse d&apos;une image
            déjà téléversée dans l&apos;admin (clic droit → copier l&apos;adresse de l&apos;image
            sur une image existante).
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-50 p-4 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {JSON_EXAMPLE}
          </pre>
        </div>

        <div>
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Format CSV (QCM uniquement)</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Une ligne = une question à choix multiple, jusqu&apos;à 4 options
            (<code>option1</code>…<code>option4</code> + <code>optionN_correct</code> à{" "}
            <code>true</code>/<code>false</code>). Pour associer ou ordonner, utilisez le JSON.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-50 p-4 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {CSV_EXAMPLE}
          </pre>
        </div>

        <p className="text-xs text-zinc-400">
          Les lignes invalides sont signalées et ignorées individuellement — le reste du fichier
          s&apos;importe quand même. La limite de 10 questions par leçon s&apos;applique aussi à
          l&apos;import.
        </p>
      </div>
    </div>
  );
}
