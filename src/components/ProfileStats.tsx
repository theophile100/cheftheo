"use client";

import { useProgress } from "@/lib/progress-context";

export function ProfileStats() {
  const { xpTotal, currentStreak, longestStreak } = useProgress();

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="rounded-2xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <p className="text-2xl font-extrabold text-orange-500">{xpTotal}</p>
        <p className="mt-0.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          XP
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <p className="text-2xl font-extrabold text-orange-500">
          {currentStreak}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Série (jours)
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <p className="text-2xl font-extrabold text-orange-500">
          {longestStreak}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Meilleure série
        </p>
      </div>
    </div>
  );
}
