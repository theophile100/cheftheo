"use client";

import { IconStarFilled } from "@tabler/icons-react";
import type { CompletionRecord } from "@/lib/progress-context";

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
}

export function XpPanel({
  xpTotal,
  completions,
}: {
  xpTotal: number;
  completions: CompletionRecord[];
}) {
  const startOfWeek = getStartOfWeek();
  const xpThisWeek = completions
    .filter((c) => new Date(c.completedAt) >= startOfWeek)
    .reduce((sum, c) => sum + c.xpEarned, 0);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-2">
        <IconStarFilled size={40} className="text-orange-500" />
        <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {xpTotal}
        </span>
      </div>
      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">XP au total</p>

      <div className="w-full rounded-2xl bg-orange-50 px-4 py-4 dark:bg-orange-900/30">
        <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-300">
          +{xpThisWeek}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-orange-600/80 dark:text-orange-300/80">
          XP gagnés cette semaine
        </p>
      </div>
    </div>
  );
}
