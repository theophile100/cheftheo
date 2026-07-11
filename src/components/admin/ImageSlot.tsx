"use client";

import { useState } from "react";
import { uploadImage } from "@/app/admin/actions";
import { checkImageSize } from "@/lib/upload-constraints";

export function ImageSlot({
  value,
  onSave,
  bucket = "branding",
  boxSize = 72,
  placeholder,
}: {
  value: string | null;
  onSave: (url: string | null) => Promise<{ error?: string }>;
  bucket?: "lesson-images" | "branding" | "materiel";
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
    const result = await uploadImage(formData, bucket);
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
