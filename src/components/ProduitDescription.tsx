"use client";

import { useState } from "react";

const TRUNCATE_THRESHOLD = 150;

export function ProduitDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > TRUNCATE_THRESHOLD;

  return (
    <div>
      <p
        className={`text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 ${
          !expanded && isLong ? "line-clamp-3" : ""
        }`}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-sm font-semibold text-orange-500 hover:text-orange-600"
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}
