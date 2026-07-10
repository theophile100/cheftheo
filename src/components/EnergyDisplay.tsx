"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress-context";
import { computeCurrentEnergy, ENERGY_MAX } from "@/lib/energy";

export function EnergyDisplay() {
  const { energy, energyUpdatedAt } = useProgress();
  const [displayEnergy, setDisplayEnergy] = useState(() =>
    computeCurrentEnergy(energy, energyUpdatedAt),
  );

  useEffect(() => {
    function tick() {
      setDisplayEnergy(computeCurrentEnergy(energy, energyUpdatedAt));
    }
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [energy, energyUpdatedAt]);

  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-orange-500">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
      <span className="font-bold text-zinc-900 dark:text-zinc-50">
        {displayEnergy}/{ENERGY_MAX}
      </span>
    </div>
  );
}
