"use client";

import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { BulkDeleteBar } from "@/components/admin/BulkDeleteBar";
import { FiliereIcon } from "@/components/FiliereIcon";
import { useBulkSelection } from "@/lib/use-bulk-selection";
import { courseLanguageLabel } from "@/lib/course-languages";
import {
  deleteLecon,
  deleteUnite,
  deleteUnites,
  swapLeconPosition,
  swapUnitePosition,
} from "@/app/admin/actions";

interface Unite {
  id: string;
  filiere_id: string;
  title: string;
  position: number;
  niveau_etude: string | null;
  langue_code: string | null;
  parcours_niveau: number;
  niveau_difficulte: string | null;
}

interface Lecon {
  id: string;
  filiere_id: string;
  unite_id: string | null;
  title: string;
  position: number;
  niveau_etude: string | null;
  langue_code: string | null;
  parcours_niveau: number;
  niveau_difficulte: string | null;
}

interface Filiere {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
}

const NIVEAU_DIFFICULTE_BADGE: Record<string, { label: string; className: string }> = {
  debutant: { label: "Débutant", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" },
  intermediaire: { label: "Intermédiaire", className: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300" },
  avance: { label: "Avancé", className: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300" },
};

function NiveauDifficulteBadge({ value }: { value: string | null }) {
  if (!value || !NIVEAU_DIFFICULTE_BADGE[value]) return null;
  const badge = NIVEAU_DIFFICULTE_BADGE[value];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
      {badge.label}
    </span>
  );
}

export function FiliereUniteCard({
  filiere,
  isLangues,
  uniteGroups,
  unassignedLecons,
  parcoursNiveau,
}: {
  filiere: Filiere;
  isLangues: boolean;
  uniteGroups: { unite: Unite; lecons: Lecon[] }[];
  unassignedLecons: Lecon[];
  parcoursNiveau: number;
}) {
  const uniteIds = uniteGroups.map((g) => g.unite.id);
  const { selected, toggle, toggleAll, clear } = useBulkSelection();

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
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

      {uniteIds.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={uniteIds.length > 0 && uniteIds.every((id) => selected.has(id))}
              onChange={() => toggleAll(uniteIds)}
              className="h-3.5 w-3.5 accent-orange-500"
            />
            Tout sélectionner
          </label>
          <BulkDeleteBar
            count={selected.size}
            itemLabel="unité"
            onDelete={async () => {
              await deleteUnites(Array.from(selected));
              clear();
            }}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {uniteGroups.map(({ unite, lecons: uniteLecons }, uIndex) => (
          <div key={unite.id} className="rounded-2xl border border-zinc-100 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(unite.id)}
                  onChange={() => toggle(unite.id)}
                  className="h-3.5 w-3.5 accent-orange-500"
                  aria-label={`Sélectionner ${unite.title}`}
                />
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
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{unite.title}</p>
                {isLangues && unite.langue_code && (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                    {courseLanguageLabel(unite.langue_code)}
                  </span>
                )}
                <NiveauDifficulteBadge value={unite.niveau_difficulte} />
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
                      <span className="text-xs text-zinc-400">({courseLanguageLabel(lecon.langue_code)})</span>
                    )}
                    <NiveauDifficulteBadge value={lecon.niveau_difficulte} />
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
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Sans unité</p>
            <div className="mt-2 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {unassignedLecons.map((lecon) => (
                <div key={lecon.id} className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {lecon.title}
                    <NiveauDifficulteBadge value={lecon.niveau_difficulte} />
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
}
