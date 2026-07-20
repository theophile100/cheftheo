"use client";

import { useEffect, useState } from "react";
import { COURSE_LANGUAGES } from "@/lib/course-languages";

interface Filiere {
  id: string;
  slug: string;
  name: string;
}

export interface FiliereScope {
  filiereId: string;
  isLangues: boolean;
  niveauEtude: string;
  langueCode: string;
  parcoursNiveau: 1 | 2;
  niveauDifficulte: string;
}

const selectClasses =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

// Champs partages par les formulaires de creation d'unite ET de leçon :
// une leçon/unite appartient toujours a une filiere, un parcours_niveau
// (1 ou 2), et selon la filiere soit une langue (Langues) soit un niveau
// d'etudes CAP/BTS (les 5 autres filieres). onScopeChange permet au
// formulaire de leçon de filtrer sa liste d'unites en fonction de ces choix.
export function FiliereScopeFields({
  filieres,
  defaultFiliereId,
  onScopeChange,
}: {
  filieres: Filiere[];
  defaultFiliereId?: string;
  onScopeChange?: (scope: FiliereScope) => void;
}) {
  const [filiereId, setFiliereId] = useState(defaultFiliereId ?? filieres[0]?.id ?? "");
  const [niveauEtude, setNiveauEtude] = useState("cap");
  const [langueCode, setLangueCode] = useState(COURSE_LANGUAGES[0].code as string);
  const [parcoursNiveau, setParcoursNiveau] = useState<1 | 2>(1);
  const [niveauDifficulte, setNiveauDifficulte] = useState("");
  const isLangues = filieres.find((f) => f.id === filiereId)?.slug === "langues";

  useEffect(() => {
    onScopeChange?.({ filiereId, isLangues, niveauEtude, langueCode, parcoursNiveau, niveauDifficulte });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filiereId, isLangues, niveauEtude, langueCode, parcoursNiveau, niveauDifficulte]);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Filière
        </label>
        <select
          name="filiere_id"
          required
          value={filiereId}
          onChange={(e) => setFiliereId(e.target.value)}
          className={selectClasses}
        >
          {filieres.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Niveau du parcours
        </label>
        <select
          name="parcours_niveau"
          required
          value={parcoursNiveau}
          onChange={(e) => setParcoursNiveau(Number(e.target.value) as 1 | 2)}
          className={selectClasses}
        >
          <option value={1}>Niveau 1 (parcours actuel)</option>
          <option value={2}>Niveau 2 (réservé, à venir)</option>
        </select>
      </div>

      {isLangues && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Langue
          </label>
          <select
            name="langue_code"
            required
            value={langueCode}
            onChange={(e) => setLangueCode(e.target.value)}
            className={selectClasses}
          >
            {COURSE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isLangues && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Niveau d&apos;études
          </label>
          <select
            name="niveau_etude"
            required
            value={niveauEtude}
            onChange={(e) => setNiveauEtude(e.target.value)}
            className={selectClasses}
          >
            <option value="cap">CAP</option>
            <option value="bts">BTS</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Niveau d&apos;utilisateur (facultatif)
        </label>
        <select
          name="niveau_difficulte"
          value={niveauDifficulte}
          onChange={(e) => setNiveauDifficulte(e.target.value)}
          className={selectClasses}
        >
          <option value="">Tous niveaux</option>
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="avance">Avancé</option>
        </select>
      </div>
    </>
  );
}
