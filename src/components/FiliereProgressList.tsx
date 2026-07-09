"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress-context";
import { FiliereIcon } from "@/components/FiliereIcon";

interface Filiere {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
}

interface Lecon {
  id: string;
  filiere_id: string;
}

export function FiliereProgressList({
  filieres,
  lecons,
}: {
  filieres: Filiere[];
  lecons: Lecon[];
}) {
  const { completedLeconIds } = useProgress();

  return (
    <div className="mt-2 flex flex-col gap-3">
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
            className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
              <FiliereIcon slug={filiere.slug} iconUrl={filiere.icon_url} size={26} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-50">
                {filiere.name}
              </p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
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
