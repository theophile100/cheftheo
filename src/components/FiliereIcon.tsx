import {
  IconChefHat,
  IconCake,
  IconGlassCocktail,
  IconBell,
  IconBed,
  type Icon,
} from "@tabler/icons-react";

const DEFAULT_ICONS: Record<string, Icon> = {
  cuisine: IconChefHat,
  patisserie: IconCake,
  "bar-et-vins": IconGlassCocktail,
  service: IconBell,
  hotellerie: IconBed,
};

export function FiliereIcon({
  slug,
  iconUrl,
  size = 32,
  className = "",
}: {
  slug: string;
  iconUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt=""
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const Icon = DEFAULT_ICONS[slug];
  if (!Icon) return null;

  return <Icon size={size} stroke={1.75} className={className} />;
}
