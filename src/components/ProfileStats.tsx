"use client";

import { useProgress } from "@/lib/progress-context";

export function ProfileStats() {
  const { email, xpTotal, currentStreak, longestStreak } = useProgress();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-zinc-800">
          <p className="text-xl font-bold text-orange-500">{xpTotal}</p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">XP</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-zinc-800">
          <p className="text-xl font-bold text-orange-500">{currentStreak}</p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Série (jours)
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-zinc-800">
          <p className="text-xl font-bold text-orange-500">{longestStreak}</p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Meilleure série
          </p>
        </div>
      </div>
    </div>
  );
}
