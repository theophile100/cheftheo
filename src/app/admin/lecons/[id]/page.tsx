import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { buttonClasses } from "@/lib/button-styles";
import { courseLanguageLabel } from "@/lib/course-languages";
import {
  updateLecon,
  deleteQuestion,
  swapQuestionPosition,
} from "../../actions";

const TYPE_LABELS: Record<string, string> = {
  qcm: "QCM",
  associer: "Associer",
  ordonner: "Ordonner",
};

const selectClasses =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default async function EditLecon({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: lecon } = await supabase
    .from("lecons")
    .select(
      "id, title, position, filiere_id, unite_id, niveau_etude, langue_code, parcours_niveau, niveau_difficulte, filieres(name)",
    )
    .eq("id", id)
    .single();

  if (!lecon) notFound();

  // .is() : niveau_etude/langue_code valent null pour l'axe qui ne
  // s'applique pas à cette leçon (ex. langue_code pour une leçon Cuisine) --
  // .eq() ne matcherait jamais une colonne nulle.
  let unitesQuery = supabase
    .from("unites")
    .select("id, title")
    .eq("filiere_id", lecon.filiere_id)
    .eq("parcours_niveau", lecon.parcours_niveau);
  unitesQuery = lecon.niveau_etude
    ? unitesQuery.eq("niveau_etude", lecon.niveau_etude)
    : unitesQuery.is("niveau_etude", null);
  unitesQuery = lecon.langue_code
    ? unitesQuery.eq("langue_code", lecon.langue_code)
    : unitesQuery.is("langue_code", null);

  const [{ data: questions }, { data: unitesFallback }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, type, prompt, position")
      .eq("lecon_id", id)
      .order("position"),
    unitesQuery.order("position"),
  ]);

  const filiereName = Array.isArray(lecon.filieres)
    ? lecon.filieres[0]?.name
    : (lecon.filieres as { name: string } | null)?.name;

  const scopeLabel = lecon.langue_code
    ? courseLanguageLabel(lecon.langue_code)
    : lecon.niveau_etude?.toUpperCase();

  const sortedQuestions = questions ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <AdminBackLink href="/admin" />
      <p className="text-sm text-zinc-400">
        {filiereName} · {scopeLabel} · Niveau {lecon.parcours_niveau}
      </p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {lecon.title}
      </h1>

      <form
        action={updateLecon.bind(null, id)}
        className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Titre
          </label>
          <input
            name="title"
            required
            defaultValue={lecon.title}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Position dans l&apos;arbre
          </label>
          <input
            name="position"
            type="number"
            min={1}
            required
            defaultValue={lecon.position}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Unité (facultatif)
          </label>
          <select
            name="unite_id"
            defaultValue={lecon.unite_id ?? ""}
            className={selectClasses}
          >
            <option value="">Aucune</option>
            {(unitesFallback ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Niveau d&apos;utilisateur (facultatif)
          </label>
          <select
            name="niveau_difficulte"
            defaultValue={lecon.niveau_difficulte ?? ""}
            className={selectClasses}
          >
            <option value="">Tous niveaux</option>
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        <button type="submit" className={buttonClasses("primary", "mt-2")}>
          Enregistrer
        </button>
      </form>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
          Questions ({sortedQuestions.length}/10)
        </h2>
        {sortedQuestions.length < 10 && (
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/lecons/${id}/questions/import`}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            >
              Importer un fichier
            </Link>
            <Link
              href={`/admin/lecons/${id}/questions/new`}
              className={buttonClasses("dark", "text-sm px-5 py-2.5")}
            >
              + Nouvelle question
            </Link>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {sortedQuestions.map((q, index) => (
          <div
            key={q.id}
            className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
          >
            <div>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                {TYPE_LABELS[q.type]}
              </span>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {q.position}. {q.prompt}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ReorderButtons
                onUp={
                  index > 0
                    ? swapQuestionPosition.bind(
                        null,
                        id,
                        q.id,
                        q.position,
                        sortedQuestions[index - 1].id,
                        sortedQuestions[index - 1].position,
                      )
                    : undefined
                }
                onDown={
                  index < sortedQuestions.length - 1
                    ? swapQuestionPosition.bind(
                        null,
                        id,
                        q.id,
                        q.position,
                        sortedQuestions[index + 1].id,
                        sortedQuestions[index + 1].position,
                      )
                    : undefined
                }
              />
              <Link
                href={`/admin/questions/${q.id}`}
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                Modifier
              </Link>
              <DeleteButton
                onDelete={deleteQuestion.bind(null, q.id, id)}
                confirmMessage="Supprimer cette question ?"
              />
            </div>
          </div>
        ))}
        {sortedQuestions.length === 0 && (
          <p className="text-sm text-zinc-400">Aucune question pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
