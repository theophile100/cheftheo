import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { buttonClasses } from "@/lib/button-styles";
import { filiereColor } from "@/lib/filiere-style";
import { deleteLecon } from "./actions";

export default async function AdminHome() {
  const supabase = await createClient();

  const [{ data: filieres }, { data: lecons }] = await Promise.all([
    supabase
      .from("filieres")
      .select("id, name, icon, position")
      .order("position"),
    supabase
      .from("lecons")
      .select("id, filiere_id, title, position")
      .order("position"),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Filières &amp; leçons
        </h1>
        <Link href="/admin/lecons/new" className={buttonClasses("primary", "text-sm px-5 py-2.5")}>
          + Nouvelle leçon
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {(filieres ?? []).map((filiere) => {
          const filiereLecons = (lecons ?? []).filter(
            (l) => l.filiere_id === filiere.id,
          );

          return (
            <div
              key={filiere.id}
              className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
            >
              <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-white ${filiereColor(filiere.position)}`}
                >
                  {filiere.name.charAt(0)}
                </span>
                {filiere.name}
              </h2>

              <div className="mt-3 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                {filiereLecons.map((lecon) => (
                  <div
                    key={lecon.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {lecon.position}. {lecon.title}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/lecons/${lecon.id}`}
                        className="text-sm font-medium text-orange-500 hover:text-orange-600"
                      >
                        Gérer
                      </Link>
                      <DeleteButton
                        onDelete={deleteLecon.bind(null, lecon.id)}
                        confirmMessage={`Supprimer la leçon "${lecon.title}" et toutes ses questions ?`}
                      />
                    </div>
                  </div>
                ))}
                {filiereLecons.length === 0 && (
                  <p className="py-2.5 text-sm text-zinc-400">
                    Aucune leçon pour l&apos;instant.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
