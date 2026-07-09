"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress-context";
import { useSoundSettings } from "@/lib/sound-settings";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound";
import { SoundToggle } from "@/components/SoundToggle";
import { BackButton } from "@/components/BackButton";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import {
  getCorrectMessage,
  getIncorrectMessage,
  getCelebrateMessage,
} from "@/lib/mascot-messages";
import { buttonClasses } from "@/lib/button-styles";
import type { Question } from "@/lib/types";
import { Qcm } from "@/components/exercises/Qcm";
import { Associer } from "@/components/exercises/Associer";
import { Ordonner } from "@/components/exercises/Ordonner";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

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
  const { soundEnabled, vibrationEnabled } = useSoundSettings();
  const totalQuestions = questions.length;

  const [queue, setQueue] = useState<Question[]>(questions);
  const [completed, setCompleted] = useState(0);
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
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
        if (soundEnabled) playCompleteSound();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setLastCorrect(isCorrect);
    setFeedbackMessage(isCorrect ? getCorrectMessage() : getIncorrectMessage());

    if (isCorrect) {
      if (soundEnabled) playCorrectSound();
      if (vibrationEnabled) vibrate(15);
    } else {
      if (soundEnabled) playIncorrectSound();
      if (vibrationEnabled) vibrate(40);
    }
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
        <Mascot mood="celebrate" size={110} />

        <h1 className="animate-fade-up text-2xl font-extrabold text-zinc-900 [animation-delay:150ms] dark:text-zinc-50">
          Félicitations !
        </h1>
        <p className="animate-fade-up text-lg text-zinc-600 [animation-delay:220ms] dark:text-zinc-400">
          {getCelebrateMessage()}
        </p>

        <div className="animate-fade-up rounded-3xl bg-white px-7 py-5 shadow-lg shadow-zinc-900/5 [animation-delay:290ms] dark:bg-zinc-900">
          <span className="text-2xl font-extrabold text-orange-500">
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
          className={buttonClasses(
            "primary",
            "mt-2 w-full max-w-xs animate-fade-up [animation-delay:360ms]",
          )}
        >
          Retour à la filière
        </Link>
      </div>
    );
  }

  const roundKey = `${current.id}-${round}`;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-6 pt-6">
        <BackButton href={`/filiere/${filiereSlug}`} />
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${(completed / totalQuestions) * 100}%` }}
          />
        </div>
        <SoundToggle />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
        {current.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.image_url}
            alt=""
            className="mb-5 max-h-56 w-full rounded-3xl object-cover"
          />
        )}

        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
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
          <div className="mt-6 flex items-center gap-3">
            <Mascot mood={lastCorrect ? "correct" : "incorrect"} size={56} />
            <SpeechBubble>{feedbackMessage}</SpeechBubble>
          </div>
        )}

        {answered && current.explanation && (
          <div
            className={`mt-3 rounded-3xl p-4 ${
              lastCorrect
                ? "bg-green-50 dark:bg-green-900/30"
                : "bg-red-50 dark:bg-red-900/30"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                lastCorrect
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {current.explanation}
            </p>
          </div>
        )}

        <div className="flex-1" />

        {answered && (
          <button
            type="button"
            onClick={handleContinue}
            className={buttonClasses(lastCorrect ? "success" : "danger", "mt-6 w-full")}
          >
            Continuer
          </button>
        )}
      </main>
    </div>
  );
}
