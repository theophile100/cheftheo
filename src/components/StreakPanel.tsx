"use client";

import { IconFlameFilled } from "@tabler/icons-react";
import type { CompletionRecord } from "@/lib/progress-context";

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekDates(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function encouragementFor(streak: number): string {
  if (streak === 0) return "Terminez une leçon aujourd'hui pour démarrer une série !";
  if (streak < 3) return "Bon début ! Continuez comme ça.";
  if (streak < 7) return "Belle régularité, ne lâchez rien !";
  if (streak < 30) return "Une série impressionnante, bravo !";
  return "Une série exceptionnelle — vous êtes inarrêtable !";
}

export function StreakPanel({
  currentStreak,
  completions,
}: {
  currentStreak: number;
  completions: CompletionRecord[];
}) {
  const weekDates = getWeekDates();
  const today = new Date();

  const activeDays = weekDates.map((date) =>
    completions.some((c) => isSameDay(new Date(c.completedAt), date)),
  );

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-2">
        <IconFlameFilled size={40} className="text-orange-500" />
        <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {currentStreak}
        </span>
      </div>
      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        {currentStreak > 1 ? "jours de série" : "jour de série"}
      </p>

      <div className="flex w-full justify-between gap-1.5">
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-400">{WEEKDAY_LABELS[i]}</span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  activeDays[i]
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                } ${isToday ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900" : ""}`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
        {encouragementFor(currentStreak)}
      </p>
    </div>
  );
}
