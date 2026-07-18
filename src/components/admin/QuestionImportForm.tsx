"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importQuestions, type ImportResult } from "@/app/admin/actions";
import { buttonClasses } from "@/lib/button-styles";

export function QuestionImportForm({ leconId }: { leconId: string }) {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setResult(null);
    setFileName(file.name);
    setFileText(await file.text());
  }

  async function handleImport() {
    if (!fileName || !fileText) return;
    setImporting(true);
    const res = await importQuestions(leconId, fileName, fileText);
    setImporting(false);
    setResult(res);
    if (res.imported > 0) router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Fichier .json ou .csv
        </label>
        <input
          type="file"
          accept=".json,.csv"
          onChange={handleFileChange}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <button
        type="button"
        disabled={!fileText || importing}
        onClick={handleImport}
        className={buttonClasses("primary", "disabled:opacity-50")}
      >
        {importing ? "Import en cours..." : "Importer les questions"}
      </button>

      {result && (
        <div className="flex flex-col gap-2">
          {result.imported > 0 && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {result.imported} question{result.imported > 1 ? "s" : ""} importée
              {result.imported > 1 ? "s" : ""}.
            </p>
          )}
          {result.errors.length > 0 && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              <p className="font-medium">
                {result.errors.length} ligne{result.errors.length > 1 ? "s" : ""} ignorée
                {result.errors.length > 1 ? "s" : ""} :
              </p>
              <ul className="mt-1 list-inside list-disc">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    {e.index > 0 ? `Ligne ${e.index} : ` : ""}
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
