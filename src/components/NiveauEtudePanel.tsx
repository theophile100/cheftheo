"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCertificate, IconCheck } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { useProgress, type NiveauEtude } from "@/lib/progress-context";

const OPTIONS: { value: NiveauEtude; label: string; description: string }[] = [
  { value: "cap", label: "CAP", description: "Certificat d'aptitude professionnelle" },
  { value: "bts", label: "BTS", description: "Brevet de technicien supérieur" },
];

export function NiveauEtudePanel({ onNavigate }: { onNavigate: () => void }) {
  const { niveauEtude, setNiveauEtude } = useProgress();
  const router = useRouter();
  const [saving, setSaving] = useState<NiveauEtude | null>(null);

  async function handleSelect(value: NiveauEtude) {
    if (value === niveauEtude || saving) return;
    setSaving(value);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").update({ niveau_etude: value }).eq("id", user.id);
    }

    setNiveauEtude(value);
    setSaving(null);
    router.refresh();
    onNavigate();
  }

  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map((option) => {
        const isActive = option.value === niveauEtude;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={saving !== null}
            className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-colors disabled:opacity-60 ${
              isActive
                ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              }`}
            >
              <IconCertificate size={22} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-zinc-900 dark:text-zinc-50">{option.label}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{option.description}</p>
            </div>
            {isActive && <IconCheck size={22} className="shrink-0 text-orange-500" />}
          </button>
        );
      })}
    </div>
  );
}
