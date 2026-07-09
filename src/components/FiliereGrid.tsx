"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress-context";

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
    <div className="mt-8 flex flex-col gap-3">
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
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-transform hover:scale-[1.01] dark:bg-zinc-900"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-50 text-2xl dark:bg-zinc-800">
              {filiere.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-50">
                {filiere.name}
              </p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-zinc-400">
              {completedCount}/{total}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
