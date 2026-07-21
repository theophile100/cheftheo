"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSeeding, IconChefHat, IconTrophy } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { useProgress, type NiveauUtilisateur } from "@/lib/progress-context";
import { StatPanel } from "@/components/StatPanel";
import { NiveauUtilisateurOptions } from "@/components/NiveauUtilisateurOptions";

const BADGE: Record<Exclude<NiveauUtilisateur, null>, { label: string; icon: typeof IconSeeding }> = {
  debutant: { label: "Débutant", icon: IconSeeding },
  intermediaire: { label: "Intermédiaire", icon: IconChefHat },
  avance: { label: "Avancé", icon: IconTrophy },
};

// Badge de coin sur l'accueil : meme niveau (debutant/intermediaire/avance)
// que le panneau du profil, mais visible et modifiable directement depuis
// l'ecran d'accueil, sans devoir aller sur le profil.
export function NiveauUtilisateurBadge() {
  const { niveauUtilisateur, setNiveauUtilisateur } = useProgress();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!niveauUtilisateur) return null;

  const { label, icon: Icon } = BADGE[niveauUtilisateur];

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
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Changer de niveau"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-extrabold text-orange-600 transition-colors active:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:active:bg-orange-500/20"
      >
        <Icon size={16} />
        {label}
      </button>

      {open && (
        <StatPanel title="Niveau" onClose={() => setOpen(false)}>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Change à tout moment pour découvrir le contenu des autres niveaux. Ta progression
            est conservée.
          </p>
          <NiveauUtilisateurOptions
            value={niveauUtilisateur}
            onSelect={handleSelect}
            disabled={saving}
          />
        </StatPanel>
      )}
    </>
  );
}
