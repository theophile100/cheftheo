"use client";

import { useState } from "react";

// Etat de selection multiple partage par les listes admin (unites, leçons,
// questions) qui proposent une suppression groupee en plus du bouton
// "Supprimer" individuel deja existant sur chaque ligne.
export function useBulkSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[]) {
    setSelected((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }

  function clear() {
    setSelected(new Set());
  }

  return { selected, toggle, toggleAll, clear };
}
