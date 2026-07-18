import Link from "next/link";

// Bascule Niveau 1 / Niveau 2 au sein d'une filiere -- volontairement non
// memorisee (juste un lien avec ?niveau=), a la difference du choix
// CAP/BTS : Niveau 2 est vide pour l'instant, revenir a Niveau 1 en un tap
// suffit, pas besoin de retenir ce choix par utilisateur.
export function NiveauParcoursTabs({
  basePath,
  current,
}: {
  basePath: string;
  current: 1 | 2;
}) {
  return (
    <div className="mt-6 flex justify-center">
      <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
        <Link
          href={`${basePath}?niveau=1`}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            current === 1
              ? "bg-orange-500 text-white shadow-[0_2px_0_0_#a75a18]"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          }`}
        >
          Niveau 1
        </Link>
        <Link
          href={`${basePath}?niveau=2`}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            current === 2
              ? "bg-orange-500 text-white shadow-[0_2px_0_0_#a75a18]"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          }`}
        >
          Niveau 2
        </Link>
      </div>
    </div>
  );
}
