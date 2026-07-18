import { createClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/lib/button-styles";
import { createUnite } from "../../actions";
import { FiliereScopeFields } from "@/components/admin/FiliereScopeFields";

export default async function NewUnite({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; filiere_id?: string }>;
}) {
  const { error, filiere_id: defaultFiliereId } = await searchParams;
  const supabase = await createClient();
  const { data: filieres } = await supabase
    .from("filieres")
    .select("id, slug, name")
    .order("position");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Nouvelle unité
      </h1>

      <form
        action={createUnite}
        className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
      >
        <FiliereScopeFields filieres={filieres ?? []} defaultFiliereId={defaultFiliereId} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Titre
          </label>
          <input
            name="title"
            required
            placeholder="Les cuissons"
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
            defaultValue={1}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        <button type="submit" className={buttonClasses("primary", "mt-2")}>
          Créer l&apos;unité
        </button>
      </form>
    </div>
  );
}
