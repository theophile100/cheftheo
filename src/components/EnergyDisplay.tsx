"use client";

import { useEffect, useId, useState } from "react";
import { IconBoltFilled } from "@tabler/icons-react";
import { useProgress } from "@/lib/progress-context";
import {
  computeCurrentEnergy,
  isUnlimitedEnergyActive,
  formatEnergy,
  ENERGY_MAX,
} from "@/lib/energy";

// Proportions calquees sur le glyphe de batterie iOS moderne (coque bien
// arrondie, encoche fine) plutot qu'un rectangle "vieux telephone".
const BODY_X = 1;
const BODY_Y = 2;
const BODY_WIDTH = 27;
const BODY_HEIGHT = 14;
const BODY_RADIUS = 4.5;
const STROKE_WIDTH = 1.8;
const FILL_INSET = 2.6;
const FILL_X = BODY_X + FILL_INSET;
const FILL_Y = BODY_Y + FILL_INSET;
const FILL_WIDTH = BODY_WIDTH - FILL_INSET * 2;
const FILL_HEIGHT = BODY_HEIGHT - FILL_INSET * 2;
const FILL_RADIUS = 2;

export function EnergyDisplay() {
  const { energy, energyUpdatedAt, isAdmin, unlimitedEnergyUntil } = useProgress();
  const [displayEnergy, setDisplayEnergy] = useState(() =>
    computeCurrentEnergy(energy, energyUpdatedAt),
  );
  const clipId = useId();

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
      title={unlimited ? "Énergie illimitée" : `${formatEnergy(displayEnergy)}/${ENERGY_MAX} énergie`}
    >
      <IconBoltFilled size={14} className="shrink-0 text-orange-500" />

      <svg width="34" height="18" viewBox="0 0 34 18" className="shrink-0" aria-hidden>
        <defs>
          <clipPath id={clipId}>
            <rect x={FILL_X} y={FILL_Y} width={FILL_WIDTH} height={FILL_HEIGHT} rx={FILL_RADIUS} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <rect
            x={FILL_X}
            y={FILL_Y}
            width={(FILL_WIDTH * fillPercent) / 100}
            height={FILL_HEIGHT}
            className="fill-orange-500 transition-all duration-700 ease-out"
          />
        </g>

        <rect
          x={BODY_X}
          y={BODY_Y}
          width={BODY_WIDTH}
          height={BODY_HEIGHT}
          rx={BODY_RADIUS}
          className="fill-none stroke-zinc-400 dark:stroke-zinc-500"
          strokeWidth={STROKE_WIDTH}
        />
        <rect
          x={BODY_X + BODY_WIDTH + 1.2}
          y={BODY_Y + BODY_HEIGHT / 2 - 2.5}
          width={2.6}
          height={5}
          rx={1.3}
          className="fill-zinc-400 dark:fill-zinc-500"
        />
      </svg>

      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
        {unlimited ? "∞" : Math.floor(displayEnergy)}
      </span>
    </div>
  );
}
