"use client";

import { useMemo, useState } from "react";
import { IconFlameFilled, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { CompletionRecord } from "@/lib/progress-context";

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Grille de 6 semaines (toujours 42 cases) commençant un lundi, pour que le
// calendrier ait une hauteur stable d'un mois à l'autre.
function buildMonthGrid(viewedMonth: Date): Date[] {
  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay();
  const mondayOffset = firstWeekday === 0 ? -6 : 1 - firstWeekday;
  const gridStart = new Date(year, month, 1 + mondayOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
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
  longestStreak,
  completions,
}: {
  currentStreak: number;
  longestStreak: number;
  completions: CompletionRecord[];
}) {
  const today = new Date();
  const [viewedMonth, setViewedMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const activeDates = useMemo(
    () => completions.map((c) => new Date(c.completedAt)),
    [completions],
  );

  const grid = useMemo(() => buildMonthGrid(viewedMonth), [viewedMonth]);

  function isActive(date: Date) {
    return activeDates.some((d) => isSameDay(d, date));
  }

  function goToPreviousMonth() {
    setViewedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setViewedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex w-full justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <IconFlameFilled size={28} className="text-orange-500" />
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {currentStreak}
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Série actuelle
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <IconFlameFilled size={28} className="text-orange-300" />
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {longestStreak}
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Meilleure série
          </p>
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Mois précédent"
            onClick={goToPreviousMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <IconChevronLeft size={20} />
          </button>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            {MONTH_LABELS[viewedMonth.getMonth()]} {viewedMonth.getFullYear()}
          </p>
          <button
            type="button"
            aria-label="Mois suivant"
            onClick={goToNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <IconChevronRight size={20} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-y-1.5">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="text-xs font-semibold text-zinc-400">
              {label}
            </span>
          ))}

          {grid.map((date, i) => {
            const inMonth = isSameMonth(date, viewedMonth);
            const isToday = isSameDay(date, today);
            const active = isActive(date);

            let circleClasses =
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold";
            if (active) {
              circleClasses += " bg-orange-500 text-white";
            } else if (inMonth) {
              circleClasses += " bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
            } else {
              circleClasses += " text-zinc-300 dark:text-zinc-700";
            }
            if (isToday) {
              circleClasses +=
                " ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900";
            }

            return (
              <div key={i} className="flex flex-col items-center justify-center py-0.5">
                <div className={circleClasses}>
                  {active ? (
                    <IconFlameFilled size={16} />
                  ) : (
                    <span>{date.getDate()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
        {encouragementFor(currentStreak)}
      </p>
    </div>
  );
}
