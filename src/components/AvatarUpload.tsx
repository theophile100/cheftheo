"use client";

import { useState } from "react";
import { uploadAvatar } from "@/app/(app)/profil/actions";

export function AvatarUpload({ initialUrl }: { initialUrl: string | null }) {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadAvatar(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setAvatarUrl(result.url ?? null);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500 shadow-lg shadow-zinc-900/5 dark:bg-zinc-800 dark:text-orange-400">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-10 w-10">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
          </svg>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
            Envoi...
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      <span className="text-xs font-medium text-orange-500">
        {avatarUrl ? "Changer la photo" : "Ajouter une photo"}
      </span>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
