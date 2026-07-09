"use client";

import { useState } from "react";
import { updateLogo, updateFiliereIcon } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FiliereIcon } from "@/components/FiliereIcon";

interface Filiere {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
}

export function LogoSection({ initialLogoUrl }: { initialLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(url: string | null) {
    setSaving(true);
    setError(null);
    const result = await updateLogo(url);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setLogoUrl(url);
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Logo de l&apos;application</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Ce logo s&apos;affiche sur l&apos;accueil, la connexion et partout où la mascotte
        apparaît. Sans image, le logo par défaut est utilisé.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <ImageUpload value={logoUrl} onChange={handleChange} bucket="branding" size={24} />
        {saving && <span className="text-xs text-zinc-400">Enregistrement...</span>}
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function FiliereIconsSection({ filieres }: { filieres: Filiere[] }) {
  const [icons, setIcons] = useState<Record<string, string | null>>(
    Object.fromEntries(filieres.map((f) => [f.id, f.icon_url])),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(filiereId: string, url: string | null) {
    setSavingId(filiereId);
    setError(null);
    const result = await updateFiliereIcon(filiereId, url);
    setSavingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setIcons((prev) => ({ ...prev, [filiereId]: url }));
  }

  return (
    <div className="mt-6 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Icônes des filières</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Chaque filière a une icône moderne par défaut. Vous pouvez la remplacer par votre
        propre image, ou revenir à l&apos;icône par défaut à tout moment.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {filieres.map((filiere) => (
          <div key={filiere.id} className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
              <FiliereIcon slug={filiere.slug} iconUrl={icons[filiere.id]} size={30} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{filiere.name}</p>
              <p className="text-xs text-zinc-400">
                {icons[filiere.id] ? "Image personnalisée" : "Icône par défaut"}
              </p>
            </div>
            <ImageUpload
              value={icons[filiere.id]}
              onChange={(url) => handleChange(filiere.id, url)}
              bucket="branding"
              size={14}
            />
            {savingId === filiere.id && (
              <span className="text-xs text-zinc-400">...</span>
            )}
          </div>
        ))}
      </div>
      {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
