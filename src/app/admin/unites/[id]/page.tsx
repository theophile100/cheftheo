import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { buttonClasses } from "@/lib/button-styles";
import { courseLanguageLabel } from "@/lib/course-languages";
import { updateUnite, deleteUnite } from "../../actions";

const selectClasses =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default async function EditUnite({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: unite } = await supabase
    .from("unites")
    .select(
      "id, title, position, filiere_id, niveau_etude, langue_code, parcours_niveau, niveau_difficulte, filieres(name)",
    )
    .eq("id", id)
    .single();

  if (!unite) notFound();

  const { data: lecons } = await supabase
    .from("lecons")
    .select("id, title, position")
    .eq("unite_id", id)
    .order("position");

  const filiereName = Array.isArray(unite.filieres)
    ? unite.filieres[0]?.name
    : (unite.filieres as { name: string } | null)?.name;

  const scopeLabel = unite.langue_code
    ? courseLanguageLabel(unite.langue_code)
    : unite.niveau_etude?.toUpperCase();

  return (
    <div className="mx-auto max-w-2xl">
      <AdminBackLink href="/admin" />
      <p className="text-sm text-zinc-400">
        {filiereName} · {scopeLabel} · Niveau {unite.parcours_niveau}
      </p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {unite.title}
      </h1>

      <form
        action={updateUnite.bind(null, id)}
        className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Titre
          </label>
          <input
            name="title"
            required
            defaultValue={unite.title}
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
            defaultValue={unite.position}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Niveau d&apos;utilisateur (facultatif)
          </label>
          <select
            name="niveau_difficulte"
            defaultValue={unite.niveau_difficulte ?? ""}
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
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Leçons de cette unité</h2>
        <Link
          href={`/admin/lecons/new?filiere_id=${unite.filiere_id}`}
          className={buttonClasses("dark", "text-sm px-5 py-2.5")}
        >
          + Nouvelle leçon
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {(lecons ?? []).map((lecon) => (
          <div
            key={lecon.id}
            className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
          >
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {lecon.position}. {lecon.title}
            </span>
            <Link
              href={`/admin/lecons/${lecon.id}`}
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Gérer
            </Link>
          </div>
        ))}
        {(lecons ?? []).length === 0 && (
          <p className="text-sm text-zinc-400">Aucune leçon dans cette unité pour l&apos;instant.</p>
        )}
      </div>

      <div className="mt-8">
        <DeleteButton
          onDelete={deleteUnite.bind(null, id)}
          confirmMessage={`Supprimer l'unité "${unite.title}" et toutes ses leçons (et leurs questions) ?`}
          label="Supprimer cette unité"
        />
      </div>
    </div>
  );
}
