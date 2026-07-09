"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress-context";

interface Unite {
  id: string;
  title: string;
  position: number;
}

interface Lecon {
  id: string;
  title: string;
  position: number;
  unite_id?: string | null;
}

export function LeconTree({
  lecons,
  unites = [],
}: {
  lecons: Lecon[];
  unites?: Unite[];
}) {
  const { completedLeconIds } = useProgress();
  const uniteById = new Map(unites.map((u) => [u.id, u]));

  return (
    <div className="mt-10 flex flex-col items-center">
      {lecons.map((lecon, index) => {
        const isCompleted = completedLeconIds.has(lecon.id);
        const previousLecon = index > 0 ? lecons[index - 1] : null;
        const isUnlocked =
          index === 0 || (previousLecon && completedLeconIds.has(previousLecon.id));

        const unite = lecon.unite_id ? uniteById.get(lecon.unite_id) : null;
        const showUniteHeader =
          unite && lecon.unite_id !== previousLecon?.unite_id;

        let circleClasses =
          "flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600";
        if (isCompleted) {
          circleClasses =
            "flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_5px_0_0_#15803d] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#15803d]";
        } else if (isUnlocked) {
          circleClasses =
            "flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_5px_0_0_#c2410c] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#c2410c]";
        }

        const icon = isCompleted ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
          </svg>
        ) : isUnlocked ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
            <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3z" />
          </svg>
        );

        return (
          <Fragment key={lecon.id}>
            {showUniteHeader && (
              <div className={`max-w-xs text-center ${index > 0 ? "mt-8" : ""} mb-5`}>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Unité {unite.position}
                </p>
                <p className="mt-0.5 text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {unite.title}
                </p>
              </div>
            )}

            <div className="flex flex-col items-center">
              {isUnlocked ? (
                <Link
                  href={`/lecon/${lecon.id}`}
                  aria-label={lecon.title}
                  className={circleClasses}
                >
                  {icon}
                </Link>
              ) : (
                <div aria-label={`${lecon.title} verrouillée`} className={circleClasses}>
                  {icon}
                </div>
              )}

              {index < lecons.length - 1 && (
                <div className="h-10 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
