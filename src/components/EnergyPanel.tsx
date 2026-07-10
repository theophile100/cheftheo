"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBoltFilled, IconArrowRight } from "@tabler/icons-react";
import {
  computeCurrentEnergy,
  secondsUntilNextPoint,
  formatEta,
  ENERGY_MAX,
} from "@/lib/energy";

export function EnergyPanel({
  energy,
  energyUpdatedAt,
  onNavigate,
}: {
  energy: number;
  energyUpdatedAt: string;
  onNavigate: () => void;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentEnergy = computeCurrentEnergy(energy, energyUpdatedAt, now);
  const eta = secondsUntilNextPoint(energy, energyUpdatedAt, now);
  const isFull = currentEnergy >= ENERGY_MAX;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-2">
        <IconBoltFilled size={40} className="text-orange-500" />
        <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {currentEnergy}/{ENERGY_MAX}
        </span>
      </div>

      {isFull ? (
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Énergie complète !
        </p>
      ) : (
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Prochain point dans{" "}
          <span className="font-extrabold text-orange-500">{formatEta(eta)}</span>
        </p>
      )}

      <Link
        href="/decouvrir"
        onClick={onNavigate}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#c86f1e] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#c86f1e]"
      >
        Gagner de l&apos;énergie
        <IconArrowRight size={18} />
      </Link>
    </div>
  );
}
