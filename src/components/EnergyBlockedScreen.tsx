"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconRefresh, IconBoltFilled } from "@tabler/icons-react";
import { Mascot } from "@/components/Mascot";
import { BackButton } from "@/components/BackButton";
import {
  secondsUntilNextPoint,
  formatEta,
  ENERGY_REVIEW_COMPLETION_BONUS,
} from "@/lib/energy";

interface CompletedLesson {
  id: string;
  title: string;
  filiereName: string;
}

export function EnergyBlockedScreen({
  filiereSlug,
  energy,
  energyUpdatedAt,
  completedLessons,
}: {
  filiereSlug: string;
  energy: number;
  energyUpdatedAt: string;
  completedLessons: CompletedLesson[];
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const eta = secondsUntilNextPoint(energy, energyUpdatedAt, now);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-125px)] max-w-md flex-col px-6 py-6 md:max-w-xl lg:max-w-2xl">
      <BackButton href={`/filiere/${filiereSlug}`} />

      <div className="flex flex-col items-center gap-4 pt-4 text-center">
        <Mascot mood="idle" size={80} />
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Plus d&apos;énergie pour l&apos;instant
        </h1>
        <p className="max-w-sm text-zinc-600 dark:text-zinc-400">
          Elle remonte toute seule avec le temps — prochain point dans{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {formatEta(eta)}
          </span>
          . En attendant, révisez une leçon déjà réussie : ça ne coûte rien et
          ça vous redonne{" "}
          <span className="font-semibold text-orange-500">
            +{ENERGY_REVIEW_COMPLETION_BONUS} énergie
          </span>
          .
        </p>
      </div>

      {completedLessons.length > 0 ? (
        <div className="mt-6 flex flex-col gap-2">
          {completedLessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lecon/${lesson.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
                <IconRefresh size={20} stroke={1.75} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">
                  {lesson.filiereName}
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {lesson.title}
                </p>
              </div>
              <IconBoltFilled size={16} className="shrink-0 text-orange-400" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-zinc-400">
          Terminez une première leçon pour pouvoir en réviser une plus tard.
        </p>
      )}
    </div>
  );
}
