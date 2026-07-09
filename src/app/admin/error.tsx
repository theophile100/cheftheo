"use client";

import { buttonClasses } from "@/lib/button-styles";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
        Un problème est survenu
      </h1>
      <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
        Impossible de charger cette page d&apos;administration.
      </p>
      <button
        type="button"
        onClick={reset}
        className={buttonClasses("dark", "w-full max-w-xs")}
      >
        Réessayer
      </button>
    </div>
  );
}
