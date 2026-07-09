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

  const hasImages = data.options.some((option) => option.image_url);

  function handleSelect(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    onAnswer(optionId === data.correct_option_id);
  }

  return (
    <div className={hasImages ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
      {data.options.map((option) => {
        let stateClasses =
          "border-zinc-200 bg-white text-zinc-900 shadow-[0_3px_0_0_#e4e4e7] hover:border-zinc-300 active:translate-y-[3px] active:shadow-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-[0_3px_0_0_#3f3f46]";
        let isCorrectAnswered = false;

        if (answered) {
          if (option.id === data.correct_option_id) {
            stateClasses =
              "border-green-500 bg-green-50 text-green-700 shadow-[0_3px_0_0_#86efac] dark:bg-green-900/30 dark:text-green-300 dark:shadow-[0_3px_0_0_#166534]";
            isCorrectAnswered = true;
          } else if (option.id === selected) {
            stateClasses =
              "border-red-500 bg-red-50 text-red-700 shadow-[0_3px_0_0_#fca5a5] dark:bg-red-900/30 dark:text-red-300 dark:shadow-[0_3px_0_0_#7f1d1d]";
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
            className={`overflow-hidden rounded-2xl border-2 text-left text-base font-semibold transition-all ${
              hasImages ? "" : "px-5 py-4"
            } ${stateClasses} ${isCorrectAnswered ? "animate-pulse-once" : ""}`}
          >
            {option.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={option.image_url}
                alt={option.text}
                className="aspect-square w-full object-cover"
              />
            )}
            {option.text && (
              <span className={hasImages ? "block px-3 py-2" : ""}>
                {option.text}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
