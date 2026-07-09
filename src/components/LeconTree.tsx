"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress-context";

interface Lecon {
  id: string;
  title: string;
  position: number;
}

export function LeconTree({ lecons }: { lecons: Lecon[] }) {
  const { completedLeconIds } = useProgress();

  return (
    <div className="mt-10 flex flex-col items-center">
      {lecons.map((lecon, index) => {
        const isCompleted = completedLeconIds.has(lecon.id);
        const previousLecon = index > 0 ? lecons[index - 1] : null;
        const isUnlocked =
          index === 0 || (previousLecon && completedLeconIds.has(previousLecon.id));

        let circleClasses =
          "flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600";
        if (isCompleted) {
          circleClasses =
            "flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105";
        } else if (isUnlocked) {
          circleClasses =
            "flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105";
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
          <div key={lecon.id} className="flex flex-col items-center">
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
              <div className="h-8 w-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            )}
          </div>
        );
      })}
    </div>
  );
}
