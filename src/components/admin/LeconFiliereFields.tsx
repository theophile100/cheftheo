"use client";

import { useState } from "react";
import { COURSE_LANGUAGES } from "@/lib/course-languages";

interface Filiere {
  id: string;
  slug: string;
  name: string;
}

const selectClasses =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export function LeconFiliereFields({ filieres }: { filieres: Filiere[] }) {
  const [filiereId, setFiliereId] = useState(filieres[0]?.id ?? "");
  const isLangues = filieres.find((f) => f.id === filiereId)?.slug === "langues";

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

      {isLangues && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Langue
          </label>
          <select name="langue_code" required defaultValue="" className={selectClasses}>
            <option value="" disabled>
              Sélectionnez la langue
            </option>
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
          <select name="niveau_etude" required defaultValue="cap" className={selectClasses}>
            <option value="cap">CAP</option>
            <option value="bts">BTS</option>
          </select>
        </div>
      )}
    </>
  );
}
