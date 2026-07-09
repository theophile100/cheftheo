"use client";

import { Mascot } from "@/components/Mascot";
import { buttonClasses } from "@/lib/button-styles";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-amber-50 px-6 text-center dark:bg-black">
      <Mascot mood="incorrect" size={88} />
      <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
        Un problème est survenu
      </h1>
      <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
        Impossible de charger cette page pour le moment. Vérifiez votre
        connexion et réessayez.
      </p>
      <button
        type="button"
        onClick={reset}
        className={buttonClasses("primary", "w-full max-w-xs")}
      >
        Réessayer
      </button>
    </div>
  );
}
