"use client";

import { useEffect, useState } from "react";
import { IconBoltFilled } from "@tabler/icons-react";
import { useProgress } from "@/lib/progress-context";
import { computeCurrentEnergy, isUnlimitedEnergyActive, ENERGY_MAX } from "@/lib/energy";

export function EnergyDisplay() {
  const { energy, energyUpdatedAt, isAdmin, unlimitedEnergyUntil } = useProgress();
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

  const unlimited = isAdmin || isUnlimitedEnergyActive(unlimitedEnergyUntil);
  const fillPercent = unlimited ? 100 : Math.max(0, Math.min(100, (displayEnergy / ENERGY_MAX) * 100));

  return (
    <div
      className="flex items-center gap-1.5"
      title={unlimited ? "Énergie illimitée" : `${displayEnergy}/${ENERGY_MAX} énergie`}
    >
      <IconBoltFilled size={14} className="shrink-0 text-orange-500" />

      <div className="flex items-center">
        <div className="relative h-3.5 w-8 rounded-[3px] border-[1.5px] border-zinc-400 p-[1.5px] dark:border-zinc-500">
          <div
            className="h-full rounded-[1px] bg-orange-500 transition-all duration-700 ease-out"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="h-1.5 w-[2.5px] rounded-r-[1px] bg-zinc-400 dark:bg-zinc-500" />
      </div>

      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
        {unlimited ? "∞" : `${displayEnergy}/${ENERGY_MAX}`}
      </span>
    </div>
  );
}
