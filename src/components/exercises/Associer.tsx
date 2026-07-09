"use client";

import { useMemo, useState } from "react";
import type { AssocierData } from "@/lib/types";
import { seededShuffle } from "@/lib/shuffle";

export function Associer({
  data,
  seed,
  onAnswer,
}: {
  data: AssocierData;
  seed: string;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const rightItems = useMemo(
    () => seededShuffle(data.pairs.map((p) => p.right), seed),
    [data, seed],
  );

  const correctRightForLeft = useMemo(
    () => Object.fromEntries(data.pairs.map((p) => [p.left.id, p.right.id])),
    [data],
  );

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [armedLeftId, setArmedLeftId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const assignedRightIds = new Set(Object.values(assignments));

  function handleLeftClick(leftId: string) {
    if (answered) return;
    setArmedLeftId((current) => (current === leftId ? null : leftId));
  }

  function handleRightClick(rightId: string) {
    if (answered) return;

    if (!armedLeftId) {
      // Tapping an already-assigned right with nothing armed undoes it.
      const leftToClear = Object.keys(assignments).find(
        (leftId) => assignments[leftId] === rightId,
      );
      if (leftToClear) {
        setAssignments((prev) => {
          const next = { ...prev };
          delete next[leftToClear];
          return next;
        });
      }
      return;
    }

    setAssignments((prev) => ({ ...prev, [armedLeftId]: rightId }));
    setArmedLeftId(null);
  }

  function handleVerify() {
    setAnswered(true);
    const isCorrect = data.pairs.every(
      (pair) => assignments[pair.left.id] === correctRightForLeft[pair.left.id],
    );
    onAnswer(isCorrect);
  }

  const allAssigned = data.pairs.every((pair) => assignments[pair.left.id]);

  function leftClasses(leftId: string) {
    if (answered) {
      const isCorrect = assignments[leftId] === correctRightForLeft[leftId];
      return isCorrect
        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        : "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
    if (armedLeftId === leftId) {
      return "border-orange-500 ring-2 ring-orange-300 bg-orange-50 text-zinc-900 dark:bg-orange-900/20 dark:text-zinc-50";
    }
    if (assignments[leftId]) {
      return "border-orange-300 bg-orange-50 text-zinc-900 dark:border-orange-700 dark:bg-orange-900/10 dark:text-zinc-50";
    }
    return "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
  }

  function rightClasses(rightId: string) {
    if (answered) {
      const pairedLeftId = Object.keys(assignments).find(
        (leftId) => assignments[leftId] === rightId,
      );
      if (!pairedLeftId) {
        return "border-zinc-200 bg-white text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900";
      }
      const isCorrect = correctRightForLeft[pairedLeftId] === rightId;
      return isCorrect
        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        : "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
    if (assignedRightIds.has(rightId)) {
      return "border-orange-300 bg-orange-50 text-zinc-900 dark:border-orange-700 dark:bg-orange-900/10 dark:text-zinc-50";
    }
    return "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {data.pairs.map((pair) => (
            <button
              key={pair.left.id}
              type="button"
              disabled={answered}
              onClick={() => handleLeftClick(pair.left.id)}
              className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-colors ${leftClasses(pair.left.id)}`}
            >
              {pair.left.text}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {rightItems.map((right) => (
            <button
              key={right.id}
              type="button"
              disabled={answered}
              onClick={() => handleRightClick(right.id)}
              className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-colors ${rightClasses(right.id)}`}
            >
              {right.text}
            </button>
          ))}
        </div>
      </div>

      {!answered && (
        <button
          type="button"
          onClick={handleVerify}
          disabled={!allAssigned}
          className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
        >
          Vérifier
        </button>
      )}
    </div>
  );
}
