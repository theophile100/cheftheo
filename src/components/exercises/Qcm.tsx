"use client";

import { useState } from "react";
import type { QcmData } from "@/lib/types";

export function Qcm({
  data,
  onAnswer,
}: {
  data: QcmData;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  function handleSelect(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    onAnswer(optionId === data.correct_option_id);
  }

  return (
    <div className="flex flex-col gap-3">
      {data.options.map((option) => {
        let stateClasses =
          "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

        if (answered) {
          if (option.id === data.correct_option_id) {
            stateClasses =
              "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
          } else if (option.id === selected) {
            stateClasses =
              "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
          } else {
            stateClasses =
              "border-zinc-200 bg-white text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900";
          }
        }

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            disabled={answered}
            className={`rounded-2xl border-2 px-5 py-4 text-left font-medium transition-colors ${stateClasses}`}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}
