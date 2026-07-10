import { Mascot } from "@/components/Mascot";
import { BackButton } from "@/components/BackButton";
import { ENERGY_PER_LESSON } from "@/lib/energy";

export function EnergyBlockedScreen({
  filiereSlug,
  energy,
  availableAt,
}: {
  filiereSlug: string;
  energy: number;
  availableAt: string;
}) {
  const time = new Date(availableAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col px-6 py-6 md:max-w-xl lg:max-w-2xl">
      <BackButton href={`/filiere/${filiereSlug}`} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <Mascot mood="idle" size={88} />
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Plus assez d&apos;énergie
        </h1>
        <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
          Il faut {ENERGY_PER_LESSON}{" "}
          points d&apos;énergie pour lancer une leçon. Vous en avez {energy}.
          Elle se recharge automatiquement — revenez vers{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {time}
          </span>
          , ou obtenez un produit gratuit dans Découvrir pour en regagner
          tout de suite.
        </p>
      </div>
    </div>
  );
}
