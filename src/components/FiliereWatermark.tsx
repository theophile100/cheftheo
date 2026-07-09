import {
  IconToolsKitchen2,
  IconSoup,
  IconChefHat,
  IconCake,
  IconCookie,
  IconIceCream2,
  IconGlassCocktail,
  IconBottle,
  IconGlassChampagne,
  IconBellRinging,
  IconToolsKitchen,
  IconCoffee,
  IconBed,
  IconKey,
  IconLuggage,
  type Icon,
} from "@tabler/icons-react";

const WATERMARK_ICONS: Record<string, Icon[]> = {
  cuisine: [IconToolsKitchen2, IconSoup, IconChefHat],
  patisserie: [IconCake, IconCookie, IconIceCream2],
  "bar-et-vins": [IconGlassCocktail, IconBottle, IconGlassChampagne],
  service: [IconBellRinging, IconToolsKitchen, IconCoffee],
  hotellerie: [IconBed, IconKey, IconLuggage],
};

// Deterministic pseudo-random layout from a seed string — never Math.random(),
// so server and client render the exact same positions (no hydration mismatch).
function seededPositions(seed: string, count: number, width: number, height: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const next = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };

  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      left: 8 + next() * Math.max(0, width - 50),
      top: 8 + next() * Math.max(0, height - 50),
      rotate: next() * 40 - 20,
    });
  }
  return positions;
}

export function FiliereWatermark({
  slug,
  seed,
  width,
  height,
}: {
  slug: string;
  seed: string;
  width: number;
  height: number;
}) {
  const icons = WATERMARK_ICONS[slug];
  if (!icons || height < 60) return null;

  const count = Math.max(2, Math.min(5, Math.round(height / 130)));
  const positions = seededPositions(seed, count, width, height);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {positions.map((pos, i) => {
        const WatermarkIcon = icons[i % icons.length];
        return (
          <WatermarkIcon
            key={i}
            size={34}
            stroke={1.5}
            className="absolute text-orange-500/10 dark:text-orange-400/10"
            style={{ left: pos.left, top: pos.top, transform: `rotate(${pos.rotate}deg)` }}
          />
        );
      })}
    </div>
  );
}
