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

// One icon roughly every ROW_SPACING px, so coverage stays even regardless
// of how tall the tree is — a short filiere gets a few icons, a long one
// gets proportionally more, instead of always capping out at a handful.
const ROW_SPACING = 78;
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
  if (!icons || height < ROW_SPACING) return null;

  const next = seededRandom(seed);
  const rowCount = Math.max(1, Math.round(height / ROW_SPACING));
  const rowHeight = height / rowCount;

  const marks = Array.from({ length: rowCount }, (_, i) => {
    const jitterY = (next() - 0.5) * rowHeight * 0.6;
    const top = Math.min(
      height - ICON_SIZE,
      Math.max(0, (i + 0.5) * rowHeight + jitterY),
    );
    const left = 6 + next() * Math.max(0, width - ICON_SIZE - 12);
    const rotate = next() * 40 - 20;
    const WatermarkIcon = icons[i % icons.length];
    return { top, left, rotate, WatermarkIcon };
  });

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
