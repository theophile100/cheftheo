"use client";

import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { BulkDeleteBar } from "@/components/admin/BulkDeleteBar";
import { useBulkSelection } from "@/lib/use-bulk-selection";
import { deleteLecon, deleteLecons } from "@/app/admin/actions";

interface Lecon {
  id: string;
  title: string;
  position: number;
}

export function UniteLeconList({ uniteId, lecons }: { uniteId: string; lecons: Lecon[] }) {
  const ids = lecons.map((l) => l.id);
  const { selected, toggle, toggleAll, clear } = useBulkSelection();

  if (lecons.length === 0) {
    return <p className="text-sm text-zinc-400">Aucune leçon dans cette unité pour l&apos;instant.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={ids.length > 0 && ids.every((id) => selected.has(id))}
            onChange={() => toggleAll(ids)}
            className="h-3.5 w-3.5 accent-orange-500"
          />
          Tout sélectionner
        </label>
        <BulkDeleteBar
          count={selected.size}
          itemLabel="leçon"
          onDelete={async () => {
            await deleteLecons(Array.from(selected), uniteId);
            clear();
          }}
        />
      </div>

      {lecons.map((lecon) => (
        <div
          key={lecon.id}
          className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
        >
          <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={selected.has(lecon.id)}
              onChange={() => toggle(lecon.id)}
              className="h-3.5 w-3.5 accent-orange-500"
            />
            {lecon.position}. {lecon.title}
          </label>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/lecons/${lecon.id}`}
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Gérer
            </Link>
            <DeleteButton
              onDelete={deleteLecon.bind(null, lecon.id, uniteId)}
              confirmMessage={`Supprimer la leçon "${lecon.title}" et toutes ses questions ?`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
