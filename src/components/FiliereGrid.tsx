"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress-context";
import { filiereColor } from "@/lib/filiere-style";

interface Filiere {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  position: number;
}

interface Lecon {
  id: string;
  filiere_id: string;
}

export function FiliereGrid({
  filieres,
  lecons,
}: {
  filieres: Filiere[];
  lecons: Lecon[];
}) {
  const { completedLeconIds } = useProgress();

  return (
    <div className="mt-8 flex flex-col gap-4">
      {filieres.map((filiere) => {
        const filiereLecons = lecons.filter(
          (l) => l.filiere_id === filiere.id,
        );
        const completedCount = filiereLecons.filter((l) =>
          completedLeconIds.has(l.id),
        ).length;
        const total = filiereLecons.length;
        const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

        return (
          <Link
            key={filiere.id}
            href={`/filiere/${filiere.slug}`}
            className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-white ${filiereColor(filiere.position)}`}
            >
              {filiere.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {filiere.name}
              </p>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-zinc-400">
              {completedCount}/{total}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
