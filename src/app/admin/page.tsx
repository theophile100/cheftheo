import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { FiliereIcon } from "@/components/FiliereIcon";
import { buttonClasses } from "@/lib/button-styles";
import { courseLanguageLabel } from "@/lib/course-languages";
import {
  deleteLecon,
  deleteUnite,
  swapLeconPosition,
  swapUnitePosition,
} from "./actions";

interface Unite {
  id: string;
  filiere_id: string;
  title: string;
  position: number;
  niveau_etude: string | null;
  langue_code: string | null;
  parcours_niveau: number;
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-orange-500 text-white shadow-[0_2px_0_0_#a75a18]"
          : "bg-white text-zinc-500 hover:text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ diplome?: string; niveau?: string }>;
}) {
  const { diplome: diplomeParam, niveau: niveauParam } = await searchParams;
  const diplome = diplomeParam === "bts" ? "bts" : "cap";
  const parcoursNiveau = niveauParam === "2" ? 2 : 1;

  const supabase = await createClient();

  const [{ data: filieres }, { data: allUnites }, { data: allLecons }] =
    await Promise.all([
      supabase
        .from("filieres")
        .select("id, slug, name, icon_url, position")
        .order("position"),
      supabase
        .from("unites")
        .select(
          "id, filiere_id, title, position, niveau_etude, langue_code, parcours_niveau",
        )
        .eq("parcours_niveau", parcoursNiveau)
        .order("position"),
      supabase
        .from("lecons")
        .select(
          "id, filiere_id, unite_id, title, position, niveau_etude, langue_code, parcours_niveau",
        )
        .eq("parcours_niveau", parcoursNiveau)
        .order("position"),
    ]);

  const otherParams = (overrides: { diplome?: string; niveau?: string }) => {
    const p = new URLSearchParams({ diplome, niveau: String(parcoursNiveau), ...overrides });
    return `/admin?${p.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Filières, unités &amp; leçons
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/unites/import"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          >
            Importer une unité
          </Link>
          <Link href="/admin/unites/new" className={buttonClasses("dark", "text-sm px-5 py-2.5")}>
            + Nouvelle unité
          </Link>
          <Link href="/admin/lecons/new" className={buttonClasses("primary", "text-sm px-5 py-2.5")}>
            + Nouvelle leçon
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          <TabLink href={otherParams({ diplome: "cap" })} active={diplome === "cap"}>
            CAP
          </TabLink>
          <TabLink href={otherParams({ diplome: "bts" })} active={diplome === "bts"}>
            BTS
          </TabLink>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          <TabLink href={otherParams({ niveau: "1" })} active={parcoursNiveau === 1}>
            Niveau 1
          </TabLink>
          <TabLink href={otherParams({ niveau: "2" })} active={parcoursNiveau === 2}>
            Niveau 2
          </TabLink>
        </div>
        <p className="text-xs text-zinc-400">
          Langues ignore le diplôme (CAP/BTS) : contenu commun aux deux.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {(filieres ?? []).map((filiere) => {
          const isLangues = filiere.slug === "langues";

          const unites = (allUnites ?? [])
            .filter((u) => u.filiere_id === filiere.id)
            .filter((u) => (isLangues ? true : u.niveau_etude === diplome));
          const lecons = (allLecons ?? [])
            .filter((l) => l.filiere_id === filiere.id)
            .filter((l) => (isLangues ? true : l.niveau_etude === diplome));

          const uniteGroups = unites.map((u) => ({
            unite: u as Unite,
            lecons: lecons
              .filter((l) => l.unite_id === u.id)
              .sort((a, b) => a.position - b.position),
          }));
          const unassignedLecons = lecons
            .filter((l) => !l.unite_id || !unites.some((u) => u.id === l.unite_id))
            .sort((a, b) => a.position - b.position);

          return (
            <div
              key={filiere.id}
              className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
                  <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
                    <FiliereIcon slug={filiere.slug} iconUrl={filiere.icon_url} size={14} />
                  </span>
                  {filiere.name}
                </h2>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/unites/new?filiere_id=${filiere.id}`}
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                  >
                    + Unité
                  </Link>
                  <Link
                    href={`/admin/lecons/new?filiere_id=${filiere.id}`}
                    className="text-sm font-medium text-orange-500 hover:text-orange-600"
                  >
                    + Leçon
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                {uniteGroups.map(({ unite, lecons: uniteLecons }, uIndex) => (
                  <div
                    key={unite.id}
                    className="rounded-2xl border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ReorderButtons
                          onUp={
                            uIndex > 0
                              ? swapUnitePosition.bind(
                                  null,
                                  unite.id,
                                  unite.position,
                                  uniteGroups[uIndex - 1].unite.id,
                                  uniteGroups[uIndex - 1].unite.position,
                                )
                              : undefined
                          }
                          onDown={
                            uIndex < uniteGroups.length - 1
                              ? swapUnitePosition.bind(
                                  null,
                                  unite.id,
                                  unite.position,
                                  uniteGroups[uIndex + 1].unite.id,
                                  uniteGroups[uIndex + 1].unite.position,
                                )
                              : undefined
                          }
                        />
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                          {unite.title}
                        </p>
                        {isLangues && unite.langue_code && (
                          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                            {courseLanguageLabel(unite.langue_code)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/unites/${unite.id}`}
                          className="text-sm font-medium text-orange-500 hover:text-orange-600"
                        >
                          Modifier
                        </Link>
                        <DeleteButton
                          onDelete={deleteUnite.bind(null, unite.id)}
                          confirmMessage={`Supprimer l'unité "${unite.title}" et toutes ses leçons ?`}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                      {uniteLecons.map((lecon, lIndex) => (
                        <div key={lecon.id} className="flex items-center justify-between py-2 pl-8">
                          <span className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            {lecon.title}
                            {isLangues && lecon.langue_code && (
                              <span className="text-xs text-zinc-400">
                                ({courseLanguageLabel(lecon.langue_code)})
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-3">
                            <ReorderButtons
                              onUp={
                                lIndex > 0
                                  ? swapLeconPosition.bind(
                                      null,
                                      lecon.id,
                                      lecon.position,
                                      uniteLecons[lIndex - 1].id,
                                      uniteLecons[lIndex - 1].position,
                                    )
                                  : undefined
                              }
                              onDown={
                                lIndex < uniteLecons.length - 1
                                  ? swapLeconPosition.bind(
                                      null,
                                      lecon.id,
                                      lecon.position,
                                      uniteLecons[lIndex + 1].id,
                                      uniteLecons[lIndex + 1].position,
                                    )
                                  : undefined
                              }
                            />
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
                      {uniteLecons.length === 0 && (
                        <p className="py-2 pl-8 text-xs text-zinc-400">Aucune leçon.</p>
                      )}
                    </div>
                  </div>
                ))}

                {unassignedLecons.length > 0 && (
                  <div className="rounded-2xl border border-dashed border-zinc-200 p-3 dark:border-zinc-700">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Sans unité
                    </p>
                    <div className="mt-2 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                      {unassignedLecons.map((lecon) => (
                        <div key={lecon.id} className="flex items-center justify-between py-2">
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {lecon.title}
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
                    </div>
                  </div>
                )}

                {uniteGroups.length === 0 && unassignedLecons.length === 0 && (
                  <p className="py-2 text-sm text-zinc-400">
                    {parcoursNiveau === 2
                      ? "Niveau 2 réservé — aucun contenu pour l'instant."
                      : "Aucune unité ni leçon pour l'instant."}
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
