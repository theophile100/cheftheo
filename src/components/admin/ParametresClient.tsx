"use client";

import { useState } from "react";
import { updateLogo, updateFiliereIcon, uploadImage } from "@/app/admin/actions";
import { FiliereIcon } from "@/components/FiliereIcon";
import { checkImageSize } from "@/lib/upload-constraints";

interface Filiere {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
}

function ImageSlot({
  value,
  onSave,
  boxSize = 72,
  placeholder,
}: {
  value: string | null;
  onSave: (url: string | null) => Promise<{ error?: string }>;
  boxSize?: number;
  placeholder: React.ReactNode;
}) {
  const [pendingUrl, setPendingUrl] = useState<string | null | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const hasPending = pendingUrl !== undefined;
  const displayUrl = hasPending ? pendingUrl : value;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeError = checkImageSize(file);
    if (sizeError) {
      setError(sizeError);
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImage(formData, "branding");
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setPendingUrl(result.url ?? null);
  }

  async function handleSave() {
    if (!hasPending) return;
    setSaving(true);
    setError(null);
    const result = await onSave(pendingUrl ?? null);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setPendingUrl(undefined);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  function handleCancel() {
    setPendingUrl(undefined);
    setError(null);
  }

  async function handleDelete() {
    if (!window.confirm("Supprimer cette image et revenir au réglage par défaut ?")) return;
    setSaving(true);
    setError(null);
    const result = await onSave(null);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setPendingUrl(undefined);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div
          style={{ width: boxSize, height: boxSize }}
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400"
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            placeholder
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <label className="cursor-pointer text-sm font-medium text-orange-500 hover:text-orange-600">
            {uploading ? "Envoi..." : "Choisir une image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading || saving}
              className="hidden"
            />
          </label>
          {hasPending && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-sm font-semibold text-green-600 hover:text-green-700 disabled:opacity-50 dark:text-green-400"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Annuler
              </button>
            </div>
          )}
          {!hasPending && value && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
            >
              {saving ? "..." : "Supprimer"}
            </button>
          )}
        </div>
      </div>
      {savedFlash && (
        <p className="text-xs font-semibold text-green-600 dark:text-green-400">
          Enregistré !
        </p>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function LogoSection({ initialLogoUrl }: { initialLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Logo de l&apos;application</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Ce logo s&apos;affiche sur l&apos;accueil, la connexion et partout où la mascotte
        apparaît. Sans image, le logo par défaut est utilisé.
      </p>
      <div className="mt-4">
        <ImageSlot
          value={logoUrl}
          onSave={async (url) => {
            const result = await updateLogo(url);
            if (!result.error) setLogoUrl(url);
            return result;
          }}
          boxSize={72}
          placeholder={<span className="text-xs text-zinc-400">Défaut</span>}
        />
      </div>
    </div>
  );
}

export function FiliereIconsSection({ filieres }: { filieres: Filiere[] }) {
  const [icons, setIcons] = useState<Record<string, string | null>>(
    Object.fromEntries(filieres.map((f) => [f.id, f.icon_url])),
  );

  return (
    <div className="mt-6 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Icônes des filières</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Chaque filière a une icône moderne par défaut. Vous pouvez la remplacer par votre
        propre image, ou revenir à l&apos;icône par défaut à tout moment.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {filieres.map((filiere) => (
          <div key={filiere.id} className="flex items-center gap-4 border-t border-zinc-100 pt-5 first:border-t-0 first:pt-0 dark:border-zinc-800">
            <div className="flex-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{filiere.name}</p>
              <p className="text-xs text-zinc-400">
                {icons[filiere.id] ? "Image personnalisée" : "Icône par défaut"}
              </p>
            </div>
            <ImageSlot
              value={icons[filiere.id]}
              onSave={async (url) => {
                const result = await updateFiliereIcon(filiere.id, url);
                if (!result.error) {
                  setIcons((prev) => ({ ...prev, [filiere.id]: url }));
                }
                return result;
              }}
              boxSize={56}
              placeholder={<FiliereIcon slug={filiere.slug} iconUrl={null} size={28} />}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
