"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProgress, type NiveauUtilisateur } from "@/lib/progress-context";
import { Mascot } from "@/components/Mascot";
import { buttonClasses } from "@/lib/button-styles";
import { NiveauUtilisateurOptions } from "@/components/NiveauUtilisateurOptions";
import { PlacementTestRunner } from "@/components/PlacementTestRunner";
import {
  suggestLevelFromScore,
  type NiveauUtilisateurValue,
} from "@/lib/placement-test-questions";

const LABELS: Record<NiveauUtilisateurValue, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

type Step = "choose" | "testOffer" | "test" | "result";

// Ecran affiche une seule fois, au premier passage sur /accueil, tant que
// profiles.niveau_utilisateur est nul. Rien n'est enregistre avant l'etape
// finale : choisir un niveau puis passer (ou sauter) le test de placement
// ne fait que naviguer entre des etapes locales.
export function NiveauOnboarding() {
  const { setNiveauUtilisateur } = useProgress();
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [chosen, setChosen] = useState<NiveauUtilisateur>(null);
  const [suggested, setSuggested] = useState<NiveauUtilisateurValue | null>(null);
  const [saving, setSaving] = useState(false);

  async function finalize(level: NiveauUtilisateurValue) {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").update({ niveau_utilisateur: level }).eq("id", user.id);
    }

    setNiveauUtilisateur(level);
    router.refresh();
  }

  if (step === "choose") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-10 text-center md:max-w-xl">
        <Mascot mood="idle" size={90} />
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Bienvenue ! Quel est ton niveau ?
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Ça nous aide à te proposer un contenu adapté. Tu pourras en changer à tout moment.
          </p>
        </div>
        <div className="w-full text-left">
          <NiveauUtilisateurOptions
            value={chosen}
            onSelect={(value) => {
              setChosen(value);
              setStep("testOffer");
            }}
          />
        </div>
      </div>
    );
  }

  if (step === "testOffer" && chosen) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-10 text-center md:max-w-xl">
        <Mascot mood="idle" size={90} />
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Envie de vérifier ton niveau ?
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Un petit test de 5 questions, pas plus — entièrement facultatif.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => setStep("test")}
            className={buttonClasses("primary", "w-full")}
          >
            Faire le test de placement
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => finalize(chosen)}
            className={buttonClasses("secondary", "w-full")}
          >
            Non merci, continuer en {LABELS[chosen]}
          </button>
        </div>
      </div>
    );
  }

  if (step === "test") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-10 md:max-w-xl">
        <PlacementTestRunner
          onFinish={(score) => {
            setSuggested(suggestLevelFromScore(score));
            setStep("result");
          }}
        />
      </div>
    );
  }

  if (step === "result" && chosen && suggested) {
    const matches = suggested === chosen;
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-10 text-center md:max-w-xl">
        <Mascot mood="celebrate" size={90} />
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {matches ? "Ton niveau est confirmé !" : "Résultat du test"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {matches
              ? `Le test confirme le niveau ${LABELS[chosen]}.`
              : `D'après le test, tu sembles plutôt niveau ${LABELS[suggested]} plutôt que ${LABELS[chosen]}.`}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          {matches ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => finalize(chosen)}
              className={buttonClasses("primary", "w-full")}
            >
              Continuer
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => finalize(suggested)}
                className={buttonClasses("primary", "w-full")}
              >
                Passer à {LABELS[suggested]}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => finalize(chosen)}
                className={buttonClasses("secondary", "w-full")}
              >
                Garder {LABELS[chosen]}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
