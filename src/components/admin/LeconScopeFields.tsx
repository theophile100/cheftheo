"use client";

import { useState } from "react";
import { FiliereScopeFields, type FiliereScope } from "@/components/admin/FiliereScopeFields";

interface Filiere {
  id: string;
  slug: string;
  name: string;
}

interface Unite {
  id: string;
  title: string;
  filiere_id: string;
  niveau_etude: string | null;
  langue_code: string | null;
  parcours_niveau: number;
}

const selectClasses =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

// Ajoute, sous les champs partages (filiere / niveau d'etudes ou langue /
// parcours), un choix d'unite -- filtre pour ne montrer que les unites qui
// appartiennent exactement au meme perimetre que la leçon en cours de
// creation/edition.
export function LeconScopeFields({
  filieres,
  unites,
  defaultFiliereId,
  defaultUniteId,
}: {
  filieres: Filiere[];
  unites: Unite[];
  defaultFiliereId?: string;
  defaultUniteId?: string | null;
}) {
  const [scope, setScope] = useState<FiliereScope | null>(null);
  const [selectedUniteId, setSelectedUniteId] = useState(defaultUniteId ?? "");

  const matchingUnites = scope
    ? unites.filter(
        (u) =>
          u.filiere_id === scope.filiereId &&
          u.parcours_niveau === scope.parcoursNiveau &&
          (scope.isLangues
            ? u.langue_code === scope.langueCode
            : u.niveau_etude === scope.niveauEtude),
      )
    : [];

  return (
    <>
      <FiliereScopeFields
        filieres={filieres}
        defaultFiliereId={defaultFiliereId}
        onScopeChange={setScope}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Unité (facultatif)
        </label>
        <select
          name="unite_id"
          value={selectedUniteId}
          onChange={(e) => setSelectedUniteId(e.target.value)}
          className={selectClasses}
        >
          <option value="">Aucune</option>
          {matchingUnites.map((u) => (
            <option key={u.id} value={u.id}>
              {u.title}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
