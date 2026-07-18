import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { BackButton } from "@/components/BackButton";
import { buttonClasses } from "@/lib/button-styles";

// Affiche au moment ou un visiteur non connecte essaie reellement de
// commencer une lecon (pas avant : accueil et filieres restent libres).
// Le param "next" ramene automatiquement vers cette meme lecon une fois
// connecte/inscrit.
export function AuthRequiredScreen({ next }: { next: string }) {
  const encodedNext = encodeURIComponent(next);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-125px)] max-w-md flex-col px-6 py-6 md:max-w-xl lg:max-w-2xl">
      <BackButton href="/accueil" />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Mascot mood="idle" size={90} />
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Créez un compte pour continuer
        </h1>
        <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
          Vous avez découvert la filière — pour commencer cette leçon, suivre votre
          progression et la retrouver plus tard, créez un compte gratuit ou connectez-vous.
        </p>

        <div className="mt-4 flex w-full max-w-xs flex-col gap-3">
          <Link
            href={`/inscription?next=${encodedNext}`}
            className={buttonClasses("primary", "w-full")}
          >
            Créer un compte gratuit
          </Link>
          <Link
            href={`/connexion?next=${encodedNext}`}
            className={buttonClasses("secondary", "w-full")}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
