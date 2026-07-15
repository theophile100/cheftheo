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

const SIZE = 88;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ percent }: { percent: number }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden>
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE_WIDTH}
        className="stroke-orange-50 dark:stroke-zinc-800"
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        className="stroke-orange-500 transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export function FiliereProgressRings({
  filieres,
  lecons,
}: {
  filieres: Filiere[];
  lecons: Lecon[];
}) {
  const { completedLeconIds } = useProgress();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {filieres.map((filiere) => {
        const filiereLecons = lecons.filter((l) => l.filiere_id === filiere.id);
        const completedCount = filiereLecons.filter((l) =>
          completedLeconIds.has(l.id),
        ).length;
        const total = filiereLecons.length;
        const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

        return (
          <Link
            key={filiere.id}
            href={`/filiere/${filiere.slug}`}
            className="flex flex-col items-center gap-2 rounded-3xl bg-white p-4 text-center shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
          >
            <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
              <ProgressRing percent={percent} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <div className="text-orange-500">
                  <FiliereIcon slug={filiere.slug} iconUrl={filiere.icon_url} size={18} />
                </div>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                  {percent}%
                </span>
              </div>
            </div>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
              {filiere.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
