"use client";

import { useState } from "react";
import { Qcm } from "@/components/exercises/Qcm";
import { buttonClasses } from "@/lib/button-styles";
import { PLACEMENT_TEST_QUESTIONS } from "@/lib/placement-test-questions";

// Mini-quiz autonome (5 questions, une par filiere) : ne touche ni a
// l'energie, ni a l'XP, ni a la repetition espacee -- c'est un diagnostic,
// pas une lecon.
export function PlacementTestRunner({ onFinish }: { onFinish: (score: number) => void }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  const current = PLACEMENT_TEST_QUESTIONS[index];
  const isLast = index === PLACEMENT_TEST_QUESTIONS.length - 1;

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setLastCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
  }

  function handleContinue() {
    if (isLast) {
      onFinish(score);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-orange-500 transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / PLACEMENT_TEST_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
        {current.prompt}
      </h2>

      <Qcm key={current.id} data={current.data} seed={current.id} onAnswer={handleAnswer} />

      {answered && (
        <button
          type="button"
          onClick={handleContinue}
          className={buttonClasses(lastCorrect ? "success" : "danger", "w-full")}
        >
          {isLast ? "Voir mon résultat" : "Continuer"}
        </button>
      )}
    </div>
  );
}
