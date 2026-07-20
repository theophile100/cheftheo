"use client";

import { useTransition } from "react";

// Barre d'action qui n'apparaît que si au moins un element est coche --
// confirme avant suppression, comme DeleteButton pour une ligne seule.
export function BulkDeleteBar({
  count,
  itemLabel,
  onDelete,
}: {
  count: number;
  itemLabel: string;
  onDelete: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-2.5 dark:bg-red-900/20">
      <span className="text-xs font-medium text-red-700 dark:text-red-300">
        {count} {itemLabel}
        {count > 1 ? "s" : ""} sélectionnée{count > 1 ? "s" : ""}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const message = `Supprimer ${count} ${itemLabel}${count > 1 ? "s" : ""} sélectionnée${count > 1 ? "s" : ""} ?`;
          if (window.confirm(message)) {
            startTransition(async () => {
              await onDelete();
            });
          }
        }}
        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
      >
        {pending ? "..." : "Supprimer la sélection"}
      </button>
    </div>
  );
}
