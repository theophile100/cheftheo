"use client";

import { useTransition } from "react";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";

// Boutons haut/bas pour réordonner un élément (unité, leçon, question) par
// rapport à son voisin immédiat -- onUp/onDown sont absents (undefined) aux
// extrémités de la liste, ce qui désactive le bouton correspondant.
export function ReorderButtons({
  onUp,
  onDown,
}: {
  onUp?: () => Promise<void>;
  onDown?: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={!onUp || pending}
        onClick={() => onUp && startTransition(() => onUp())}
        aria-label="Monter"
        className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <IconChevronUp size={16} />
      </button>
      <button
        type="button"
        disabled={!onDown || pending}
        onClick={() => onDown && startTransition(() => onDown())}
        aria-label="Descendre"
        className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <IconChevronDown size={16} />
      </button>
    </div>
  );
}
