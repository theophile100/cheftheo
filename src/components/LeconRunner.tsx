"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress-context";
import type { Question } from "@/lib/types";
import { Qcm } from "@/components/exercises/Qcm";
import { Associer } from "@/components/exercises/Associer";
import { Ordonner } from "@/components/exercises/Ordonner";

export function LeconRunner({
  leconId,
  filiereSlug,
  questions,
}: {
  leconId: string;
  filiereSlug: string;
  questions: Question[];
}) {
  const { applyCompletion } = useProgress();
  const totalQuestions = questions.length;

  const [queue, setQueue] = useState<Question[]>(questions);
  const [completed, setCompleted] = useState(0);
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = queue[0];
  const savedRef = useRef(false);

  useEffect(() => {
    if (current || savedRef.current) return;
    savedRef.current = true;

    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("complete_lecon", {
        p_lecon_id: leconId,
      });

      if (error) {
        setSaveError(error.message);
        return;
      }
      if (data) {
        applyCompletion(data, leconId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setLastCorrect(isCorrect);
  }

  function handleContinue() {
    const rest = queue.slice(1);

    if (lastCorrect) {
      setCompleted((c) => c + 1);
      setQueue(rest);
    } else {
      const insertAt = Math.min(2, rest.length);
      const requeued = [...rest];
      requeued.splice(insertAt, 0, current);
      setQueue(requeued);
    }

    setAnswered(false);
    setRound((r) => r + 1);
  }

  if (!current) {
    const xpEarned = totalQuestions * 10;

    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 px-6 text-center">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-20 w-20 text-amber-400">
          <path d="M12 2l2.8 6.2L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.2-.8z" />
        </svg>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Félicitations !
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Vous avez terminé la leçon.
        </p>

        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-zinc-900">
          <span className="text-xl font-bold text-orange-500">
            +{xpEarned} XP
          </span>
        </div>

        {saveError && (
          <p className="max-w-xs text-sm text-red-600 dark:text-red-400">
            La sauvegarde de votre progression a échoué : {saveError}
          </p>
        )}

        <Link
          href={`/filiere/${filiereSlug}`}
          className="mt-2 w-full max-w-xs rounded-xl bg-orange-500 px-4 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Retour à la filière
        </Link>
      </div>
    );
  }

  const roundKey = `${current.id}-${round}`;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      <div className="mx-auto w-full max-w-md px-6 pt-6">
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${(completed / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {current.prompt}
        </h1>

        <div className="mt-6">
          {current.type === "qcm" && (
            <Qcm key={roundKey} data={current.data} onAnswer={handleAnswer} />
          )}
          {current.type === "associer" && (
            <Associer
              key={roundKey}
              data={current.data}
              seed={roundKey}
              onAnswer={handleAnswer}
            />
          )}
          {current.type === "ordonner" && (
            <Ordonner
              key={roundKey}
              data={current.data}
              seed={roundKey}
              onAnswer={handleAnswer}
            />
          )}
        </div>

        {answered && (
          <div
            className={`mt-6 rounded-2xl p-4 ${
              lastCorrect
                ? "bg-green-50 dark:bg-green-900/30"
                : "bg-red-50 dark:bg-red-900/30"
            }`}
          >
            <p
              className={`font-bold ${
                lastCorrect
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {lastCorrect ? "Correct !" : "Incorrect"}
            </p>
            {current.explanation && (
              <p
                className={`mt-1 text-sm ${
                  lastCorrect
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {current.explanation}
              </p>
            )}
          </div>
        )}

        <div className="flex-1" />

        {answered && (
          <button
            type="button"
            onClick={handleContinue}
            className={`w-full rounded-xl px-4 py-3 text-base font-semibold text-white transition-colors ${
              lastCorrect
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Continuer
          </button>
        )}
      </main>
    </div>
  );
}
