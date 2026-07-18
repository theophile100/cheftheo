import { IconSeeding, IconChefHat, IconTrophy, IconCheck } from "@tabler/icons-react";
import type { NiveauUtilisateur } from "@/lib/progress-context";

const OPTIONS: {
  value: NiveauUtilisateur;
  label: string;
  description: string;
  icon: typeof IconSeeding;
}[] = [
  {
    value: "debutant",
    label: "Débutant",
    description: "Je découvre le métier",
    icon: IconSeeding,
  },
  {
    value: "intermediaire",
    label: "Intermédiaire",
    description: "J'ai déjà quelques bases",
    icon: IconChefHat,
  },
  {
    value: "avance",
    label: "Avancé",
    description: "Je suis à l'aise, je veux aller plus loin",
    icon: IconTrophy,
  },
];

export function NiveauUtilisateurOptions({
  value,
  onSelect,
  disabled,
}: {
  value: NiveauUtilisateur;
  onSelect: (value: NiveauUtilisateur) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-colors disabled:opacity-60 ${
              isActive
                ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              }`}
            >
              <Icon size={22} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-zinc-900 dark:text-zinc-50">{option.label}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{option.description}</p>
            </div>
            {isActive && <IconCheck size={22} className="shrink-0 text-orange-500" />}
          </button>
        );
      })}
    </div>
  );
}
