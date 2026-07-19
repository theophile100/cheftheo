"use client";

import { useState } from "react";

// Bascule entre "deposer un fichier" (n'importe quel type -- la detection
// du format JSON/CSV se fait sur le contenu, pas sur l'extension) et
// "coller le texte" directement, pour ne pas obliger a creer un fichier
// juste pour tester un import.
export function ImportSourceInput({
  onChange,
}: {
  onChange: (text: string | null) => void;
}) {
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [pasted, setPasted] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onChange(await file.text());
  }

  function handlePasteChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.target.value;
    setPasted(text);
    onChange(text.trim() ? text : null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 self-start rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => {
            setMode("file");
            onChange(null);
          }}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            mode === "file"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Fichier
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("paste");
            onChange(pasted.trim() ? pasted : null);
          }}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            mode === "paste"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Coller le texte
        </button>
      </div>

      {mode === "file" ? (
        <input
          type="file"
          onChange={handleFileChange}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      ) : (
        <textarea
          value={pasted}
          onChange={handlePasteChange}
          rows={10}
          placeholder="Collez ici votre contenu JSON ou CSV..."
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      )}
    </div>
  );
}
