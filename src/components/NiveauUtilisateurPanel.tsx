"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProgress, type NiveauUtilisateur } from "@/lib/progress-context";
import { NiveauUtilisateurOptions } from "@/components/NiveauUtilisateurOptions";

// Changer de niveau ici ne touche jamais a la progression (XP, series,
// lecons terminees) : ca ne fait qu'adapter le contenu propose et peut se
// faire a tout moment, pour explorer les autres niveaux.
export function NiveauUtilisateurPanel() {
  const { niveauUtilisateur, setNiveauUtilisateur } = useProgress();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSelect(value: NiveauUtilisateur) {
    if (value === niveauUtilisateur || saving) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").update({ niveau_utilisateur: value }).eq("id", user.id);
    }

    setNiveauUtilisateur(value);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Change à tout moment pour découvrir le contenu des autres niveaux. Ta progression est
        conservée.
      </p>
      <NiveauUtilisateurOptions
        value={niveauUtilisateur}
        onSelect={handleSelect}
        disabled={saving}
      />
    </div>
  );
}
