"use client";

import { useState } from "react";
import { uploadImage } from "@/app/admin/actions";
import { checkImageSize } from "@/lib/upload-constraints";

export function ImageUpload({
  value,
  onChange,
  label,
  bucket = "lesson-images",
  size = 28,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  bucket?: "lesson-images" | "branding";
  size?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxSize = `${size * 0.25}rem`;

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

    onChange(result.url ?? null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      {value ? (
        <div className="relative" style={{ width: boxSize }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="rounded-xl object-cover"
            style={{ width: boxSize, height: boxSize }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Retirer l'image"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 text-xs font-medium text-zinc-400 hover:border-orange-400 dark:border-zinc-700"
          style={{ width: boxSize, height: boxSize }}
        >
          {uploading ? "Envoi..." : "+ Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
