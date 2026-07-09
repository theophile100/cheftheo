"use client";

import { useTransition } from "react";

export function DeleteButton({
  onDelete,
  confirmMessage,
  label = "Supprimer",
}: {
  onDelete: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(async () => {
            await onDelete();
          });
        }
      }}
      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
    >
      {pending ? "..." : label}
    </button>
  );
}
