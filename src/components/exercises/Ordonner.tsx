"use client";

import { useMemo, useState } from "react";
import type { OrdonnerData } from "@/lib/types";
import { seededShuffle } from "@/lib/shuffle";

export function Ordonner({
  data,
  seed,
  onAnswer,
}: {
  data: OrdonnerData;
  seed: string;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const shuffledSteps = useMemo(
    () => seededShuffle(data.steps, seed),
    [data, seed],
  );

  const [builtIds, setBuiltIds] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);

  const builtIdSet = new Set(builtIds);
  const pool = shuffledSteps.filter((step) => !builtIdSet.has(step.id));
  const stepById = Object.fromEntries(data.steps.map((s) => [s.id, s]));

  function handlePick(stepId: string) {
    if (answered) return;
    setBuiltIds((prev) => [...prev, stepId]);
  }

  function handleUndo(stepId: string) {
    if (answered) return;
    setBuiltIds((prev) => prev.filter((id) => id !== stepId));
  }

  function handleVerify() {
    setAnswered(true);
    const isCorrect = builtIds.every((id, index) => id === data.steps[index].id);
    onAnswer(isCorrect);
  }

  function builtItemClasses(stepId: string, index: number) {
    if (answered) {
      const isCorrect = data.steps[index]?.id === stepId;
      return isCorrect
        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        : "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
    return "border-orange-300 bg-orange-50 text-zinc-900 dark:border-orange-700 dark:bg-orange-900/10 dark:text-zinc-50";
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Votre ordre
      </p>
      <div className="flex flex-col gap-2">
        {builtIds.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 px-3 py-4 text-center text-sm text-zinc-400 dark:border-zinc-700">
            Sélectionnez les étapes ci-dessous dans l&apos;ordre
          </div>
        )}
        {builtIds.map((stepId, index) => (
          <button
            key={stepId}
            type="button"
            disabled={answered}
            onClick={() => handleUndo(stepId)}
            className={`flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-colors ${builtItemClasses(stepId, index)}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-bold dark:bg-white/10">
              {index + 1}
            </span>
            {stepById[stepId].text}
          </button>
        ))}
      </div>

      {pool.length > 0 && (
        <>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Étapes disponibles
          </p>
          <div className="flex flex-col gap-2">
            {pool.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handlePick(step.id)}
                className="rounded-xl border-2 border-zinc-200 bg-white px-3 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {step.text}
              </button>
            ))}
          </div>
        </>
      )}

      {!answered && pool.length === 0 && (
        <button
          type="button"
          onClick={handleVerify}
          className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
        >
          Vérifier
        </button>
      )}
    </div>
  );
}
