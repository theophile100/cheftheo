"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconBoltFilled } from "@tabler/icons-react";
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
import { ENERGY_STREAK_BONUS_AMOUNT } from "@/lib/energy";
import type { Question } from "@/lib/types";
import { Qcm } from "@/components/exercises/Qcm";
import { Associer } from "@/components/exercises/Associer";
import { Ordonner } from "@/components/exercises/Ordonner";
import { EnergyBlockedScreen } from "@/components/EnergyBlockedScreen";
import { ExplanationBlock } from "@/components/ExplanationBlock";
import { isUnlimitedEnergyActive } from "@/lib/energy";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function LeconRunner({
  leconId,
  filiereSlug,
  questions,
  sessionSeed,
  energyAfterStart,
  alreadyCompleted,
}: {
  leconId: string;
  filiereSlug: string;
  questions: Question[];
  sessionSeed: string;
  energyAfterStart: { energy: number; energyUpdatedAt: string };
  alreadyCompleted: boolean;
}) {
  const { applyCompletion, setEnergy, energy, energyUpdatedAt, isAdmin, unlimitedEnergyUntil } =
    useProgress();
  const hasFullExplanationAccess = isAdmin || isUnlimitedEnergyActive(unlimitedEnergyUntil);
  const { soundEnabled, vibrationEnabled } = useSoundSettings();
  const totalQuestions = questions.length;
  const [showEnergyBonus, setShowEnergyBonus] = useState(false);
  // Revoir une leçon déjà réussie ne coûte jamais d'énergie (voir
  // record_answer côté serveur) : ce blocage ne s'applique donc jamais à
  // une relecture, seulement à une leçon suivie pour la première fois.
  const [energyDepleted, setEnergyDepleted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setEnergy(energyAfterStart.energy, energyAfterStart.energyUpdatedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        applyCompletion(data, leconId, totalQuestions * 10);
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

    // L'énergie baisse (ou remonte, en cas de bonus de série) au fil des
    // réponses plutôt qu'en un forfait unique au lancement de la leçon —
    // jamais bloquant : même à 0, la leçon en cours se termine normalement.
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("record_answer", {
        p_lecon_id: leconId,
        p_is_correct: isCorrect,
      });
      if (error || !data) return;
      setEnergy(data.energy, data.energy_updated_at);
      if (data.bonus_awarded) {
        setShowEnergyBonus(true);
        setTimeout(() => setShowEnergyBonus(false), 2500);
      }
      if (!alreadyCompleted && !data.unlimited && data.energy <= 0) {
        setEnergyDepleted(true);
      }
    })();

    // Chaque question vue entre (ou avance) dans la répétition espacée,
    // indépendamment de l'énergie/XP de la leçon elle-même.
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

    // L'énergie vient de tomber à zéro : on arrête avant d'afficher la
    // question suivante plutôt qu'au milieu d'une question déjà commencée.
    if (energyDepleted && rest.length > 0) {
      setBlocked(true);
      return;
    }

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

  if (blocked) {
    return (
      <EnergyBlockedScreen
        filiereSlug={filiereSlug}
        energy={energy}
        energyUpdatedAt={energyUpdatedAt}
      />
    );
  }

  if (!current) {
    const xpEarned = totalQuestions * 10;

    return (
      <div className="mx-auto flex min-h-[calc(100vh-125px)] max-w-md flex-col items-center justify-center gap-6 px-6 text-center md:max-w-xl lg:max-w-2xl">
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

  const roundKey = `${sessionSeed}-${current.id}-${round}`;

  return (
    <div className="flex min-h-[calc(100vh-125px)] flex-col">
      {showEnergyBonus && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-fade-up">
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-900/20">
            <IconBoltFilled size={16} />
            +{ENERGY_STREAK_BONUS_AMOUNT} énergie — belle série !
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-6 pt-6 md:max-w-xl lg:max-w-2xl">
        <BackButton href={`/filiere/${filiereSlug}`} />
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${(completed / totalQuestions) * 100}%` }}
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
            <Qcm
              key={roundKey}
              data={current.data}
              seed={roundKey}
              onAnswer={handleAnswer}
            />
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
          <ExplanationBlock
            explanation={current.explanation}
            lastCorrect={lastCorrect}
            hasFullAccess={hasFullExplanationAccess}
          />
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
