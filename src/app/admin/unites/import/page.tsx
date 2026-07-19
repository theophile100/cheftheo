import { createClient } from "@/lib/supabase/server";
import { UniteImportForm } from "@/components/admin/UniteImportForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

const EXAMPLE = `{
  "unite": "Les fonds et sauces",
  "lecons": [
    {
      "titre": "Les fonds de base",
      "questions": [
        {
          "type": "qcm",
          "prompt": "Quel est le principal fond blanc utilisé en cuisine ?",
          "explanation": "Le fond blanc de veau est la base de nombreuses sauces.",
          "options": [
            { "text": "Fond brun", "correct": false },
            { "text": "Fond blanc de veau", "correct": true },
            { "text": "Fumet de poisson", "correct": false }
          ]
        },
        {
          "type": "ordonner",
          "prompt": "Remets les étapes du fond blanc dans l'ordre.",
          "explanation": "Le respect de l'ordre garantit un fond clair et gouteux.",
          "steps": [
            "Blanchir les os",
            "Mouiller à froid",
            "Écumer",
            "Laisser mijoter"
          ]
        }
      ]
    },
    {
      "titre": "Les liaisons",
      "questions": [
        {
          "type": "associer",
          "prompt": "Associe chaque liaison à son usage.",
          "explanation": "Chaque type de liaison a un usage precis en cuisine.",
          "pairs": [
            { "left": "Roux blanc", "right": "Sauce béchamel" },
            { "left": "Beurre manié", "right": "Rectifier une sauce en fin de cuisson" }
          ]
        }
      ]
    }
  ]
}`;

const CSV_EXAMPLE = `lecon,type,prompt,explanation,image,option1,option1_correct,option2,option2_correct,option3,option3_correct
Les fonds de base,qcm,Quel est le principal fond blanc utilisé en cuisine ?,Le fond blanc de veau est la base de nombreuses sauces.,,Fond brun,false,Fond blanc de veau,true,Fumet de poisson,false
Les fonds de base,qcm,Quelle est la couleur d'un fond blanc réussi ?,,,Ambré,false,Clair et limpide,true,,
Les liaisons,qcm,Le beurre manié sert à...,,,Épaissir en fin de cuisson,true,Colorer une sauce,false,,`;

export default async function ImportUnite() {
  const supabase = await createClient();
  const { data: filieres } = await supabase.from("filieres").select("id, slug, name").order("position");

  return (
    <div className="mx-auto max-w-2xl">
      <AdminBackLink href="/admin" />
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Importer une unité complète
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Un seul fichier (n&apos;importe quel type — le format est détecté automatiquement) ou un
        texte collé directement crée l&apos;unité, ses leçons dans l&apos;ordre, et toutes leurs
        questions.
      </p>

      <div className="mt-6">
        <UniteImportForm filieres={filieres ?? []} />
      </div>

      <div className="mt-8 flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Format JSON (recommandé)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Un objet avec <code>unite</code> (le titre) et <code>lecons</code> (tableau, dans l&apos;ordre
            voulu). Chaque leçon a un <code>titre</code> et un tableau <code>questions</code>, au même
            format que l&apos;import question-par-question (types <code>qcm</code>, <code>associer</code>,{" "}
            <code>ordonner</code> ; jusqu&apos;à 10 questions par leçon ; <code>image</code> optionnelle =
            adresse d&apos;une image déjà téléversée dans l&apos;admin).
          </p>
          <pre className="overflow-x-auto rounded-xl bg-zinc-50 p-4 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {EXAMPLE}
          </pre>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Format CSV (QCM uniquement)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Un CSV n&apos;a pas de place pour le titre de l&apos;unité : vous le saisissez à part, dans
            un champ dédié qui apparaît dès que le contenu n&apos;est pas reconnu comme du JSON. Chaque
            ligne est une question à choix multiple ; la colonne <code>lecon</code> indique à quelle
            leçon elle appartient (les leçons apparaissent dans l&apos;ordre de leur première apparition
            dans le fichier). Pour associer ou ordonner, utilisez le JSON.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-zinc-50 p-4 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {CSV_EXAMPLE}
          </pre>
        </div>

        <p className="text-xs text-zinc-400">
          Si une unité du même nom existe déjà dans la filière/diplôme/niveau choisis, l&apos;import vous
          demandera de la remplacer ou d&apos;en créer une nouvelle avant de rien enregistrer.
        </p>
      </div>
    </div>
  );
}
