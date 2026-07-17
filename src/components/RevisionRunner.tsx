"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSoundSettings } from "@/lib/sound-settings";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound";
import { SoundToggle } from "@/components/SoundToggle";
import { BackButton } from "@/components/BackButton";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import { getCorrectMessage, getIncorrectMessage, getCelebrateMessage } from "@/lib/mascot-messages";
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

// Session de revision (repetition espacee) : parcourt une seule fois les
// questions dues aujourd'hui, sans cout d'energie ni XP -- c'est une
// habitude quotidienne gratuite, distincte d'une lecon normale. Chaque
// reponse met a jour le palier de repetition espacee de la question via
// record_review (au lieu de complete_lecon/record_answer pour les lecons).
export function RevisionRunner({
  questions,
  sessionSeed,
}: {
  questions: Question[];
  sessionSeed: string;
}) {
  const { soundEnabled, vibrationEnabled } = useSoundSettings();
  const total = questions.length;

  const [queue, setQueue] = useState<Question[]>(questions);
  const [completed, setCompleted] = useState(0);
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const current = queue[0];

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

    (async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("record_review", {
        p_question_id: current.id,
        p_is_correct: isCorrect,
      });
      if (error) {
        console.error("record_review failed", error);
      }
    })();
  }

  function handleContinue() {
    const rest = queue.slice(1);
    setCompleted((c) => c + 1);
    setQueue(rest);
    setAnswered(false);
    setRound((r) => r + 1);
    if (rest.length === 0 && soundEnabled) playCompleteSound();
  }

  if (!current) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-125px)] max-w-md flex-col items-center justify-center gap-6 px-6 text-center md:max-w-xl lg:max-w-2xl">
        <Mascot mood="celebrate" size={110} />
        <h1 className="animate-fade-up text-2xl font-extrabold text-zinc-900 [animation-delay:150ms] dark:text-zinc-50">
          Révision terminée !
        </h1>
        <p className="animate-fade-up text-lg text-zinc-600 [animation-delay:220ms] dark:text-zinc-400">
          {getCelebrateMessage()}
        </p>
        <div className="animate-fade-up rounded-3xl bg-white px-7 py-5 shadow-lg shadow-zinc-900/5 [animation-delay:290ms] dark:bg-zinc-900">
          <span className="text-2xl font-extrabold text-orange-500">
            {total} notion{total > 1 ? "s" : ""} revue{total > 1 ? "s" : ""}
          </span>
        </div>
        <Link
          href="/accueil"
          className={buttonClasses(
            "primary",
            "mt-2 w-full max-w-xs animate-fade-up [animation-delay:360ms]",
          )}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const roundKey = `${sessionSeed}-${current.id}-${round}`;

  return (
    <div className="flex min-h-[calc(100vh-125px)] flex-col">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-6 pt-6 md:max-w-xl lg:max-w-2xl">
        <BackButton href="/accueil" />
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
        <SoundToggle />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8 md:max-w-xl lg:max-w-2xl">
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
            <Qcm key={roundKey} data={current.data} seed={roundKey} onAnswer={handleAnswer} />
          )}
          {current.type === "associer" && (
            <Associer key={roundKey} data={current.data} seed={roundKey} onAnswer={handleAnswer} />
          )}
          {current.type === "ordonner" && (
            <Ordonner key={roundKey} data={current.data} seed={roundKey} onAnswer={handleAnswer} />
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
              lastCorrect ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                lastCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
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
