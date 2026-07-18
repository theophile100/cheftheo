"use client";

import { useState } from "react";
import { uploadImage, listUploadedImages } from "@/app/admin/actions";
import { checkImageSize } from "@/lib/upload-constraints";

export function ImageUpload({
  value,
  onChange,
  label,
  bucket = "lesson-images",
  size = 28,
  showGallery = false,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  bucket?: "lesson-images" | "branding";
  size?: number;
  showGallery?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{ url: string; name: string }[] | null>(null);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const boxSize = `${size * 0.25}rem`;

  async function openGallery() {
    setLoadingGallery(true);
    const images = await listUploadedImages(bucket as "lesson-images");
    setGallery(images);
    setLoadingGallery(false);
  }

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
        <div className="flex items-start gap-2">
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
          {showGallery && (
            <button
              type="button"
              onClick={openGallery}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 text-xs font-medium text-zinc-400 hover:border-orange-400 dark:border-zinc-700"
              style={{ width: boxSize, height: boxSize }}
            >
              {loadingGallery ? "..." : "Galerie"}
            </button>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      {gallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGallery(null)}>
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-lg dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                Images déjà téléversées
              </h3>
              <button
                type="button"
                onClick={() => setGallery(null)}
                aria-label="Fermer"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            {gallery.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-400">Aucune image téléversée pour l&apos;instant.</p>
            ) : (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {gallery.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => {
                      onChange(img.url);
                      setGallery(null);
                    }}
                    className="aspect-square overflow-hidden rounded-xl border border-zinc-200 hover:border-orange-400 dark:border-zinc-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
