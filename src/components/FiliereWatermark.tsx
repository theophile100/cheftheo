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
  IconLanguage,
  IconWorld,
  IconVocabulary,
  type Icon,
} from "@tabler/icons-react";

const WATERMARK_ICONS: Record<string, Icon[]> = {
  cuisine: [IconToolsKitchen2, IconSoup, IconChefHat],
  patisserie: [IconCake, IconCookie, IconIceCream2],
  "bar-et-vins": [IconGlassCocktail, IconBottle, IconGlassChampagne],
  service: [IconBellRinging, IconToolsKitchen, IconCoffee],
  hotellerie: [IconBed, IconKey, IconLuggage],
  langues: [IconLanguage, IconWorld, IconVocabulary],
};

// Icons start sparse near the top and get progressively denser toward the
// bottom, so the deeper you scroll into a filiere the richer the backdrop
// feels — a sense of journey rather than a flat repeating pattern.
const MAX_ROW_SPACING = 130;
const MIN_ROW_SPACING = 55;
const ICON_SIZE = 28;

// Deterministic pseudo-random sequence from a seed string — never
// Math.random(), so server and client render the exact same layout
// (no hydration mismatch).
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };
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
  if (!icons || height < MIN_ROW_SPACING) return null;

  const next = seededRandom(seed);
  const marks: { top: number; left: number; rotate: number; WatermarkIcon: Icon }[] = [];

  let y = 30;
  let i = 0;
  while (y < height) {
    const progress = Math.min(1, y / height);
    const spacing = MAX_ROW_SPACING - (MAX_ROW_SPACING - MIN_ROW_SPACING) * progress;
    const jitterY = (next() - 0.5) * spacing * 0.5;
    const top = Math.min(height - ICON_SIZE, Math.max(0, y + jitterY));
    const left = 6 + next() * Math.max(0, width - ICON_SIZE - 12);
    const rotate = next() * 40 - 20;
    const WatermarkIcon = icons[i % icons.length];
    marks.push({ top, left, rotate, WatermarkIcon });
    y += spacing;
    i++;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {marks.map((mark, i) => (
        <mark.WatermarkIcon
          key={i}
          size={ICON_SIZE}
          stroke={1.5}
          className="absolute text-orange-500/10 dark:text-orange-400/10"
          style={{ top: mark.top, left: mark.left, transform: `rotate(${mark.rotate}deg)` }}
        />
      ))}
    </div>
  );
}
