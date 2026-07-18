"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBoltFilled, IconClock } from "@tabler/icons-react";
import { Mascot } from "@/components/Mascot";
import { BackButton } from "@/components/BackButton";
import { buttonClasses } from "@/lib/button-styles";
import { secondsUntilNextPoint, formatEta } from "@/lib/energy";

export function EnergyBlockedScreen({
  filiereSlug,
  energy,
  energyUpdatedAt,
}: {
  filiereSlug: string;
  energy: number;
  energyUpdatedAt: string;
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

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Mascot mood="idle" size={90} />
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Énergie épuisée pour l&apos;instant
        </h1>
        <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
          Belle séance ! Continuez sans attendre avec l&apos;énergie illimitée, ou faites
          une pause : elle remonte toute seule avec le temps.
        </p>

        <div className="mt-2 flex w-full max-w-xs flex-col gap-4">
          <Link
            href="/decouvrir"
            className={buttonClasses(
              "primary",
              "flex w-full items-center justify-center gap-2",
            )}
          >
            <IconBoltFilled size={20} />
            Débloque l&apos;énergie illimitée
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
              <IconClock size={20} stroke={1.75} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Ou attendez la recharge
              </p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Prochain point dans {formatEta(eta)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
