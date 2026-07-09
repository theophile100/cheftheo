"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EbookInput } from "@/app/admin/ebooks/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { buttonClasses } from "@/lib/button-styles";

const inputClasses =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

interface InitialEbook {
  title: string;
  description: string | null;
  price: number;
  cover_url: string | null;
  cta_type: "url" | "embed";
  chariow_url: string | null;
  chariow_embed_code: string | null;
  likes_enabled: boolean;
  comments_enabled: boolean;
  position: number;
}

export function EbookForm({
  initialEbook,
  defaultPosition,
  onSubmit,
}: {
  initialEbook?: InitialEbook;
  defaultPosition?: number;
  onSubmit: (input: EbookInput) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialEbook?.title ?? "");
  const [description, setDescription] = useState(
    initialEbook?.description ?? "",
  );
  const [price, setPrice] = useState(initialEbook?.price ?? 0);
  const [coverUrl, setCoverUrl] = useState<string | null>(
    initialEbook?.cover_url ?? null,
  );
  const [ctaType, setCtaType] = useState<"url" | "embed">(
    initialEbook?.cta_type ?? "url",
  );
  const [chariowUrl, setChariowUrl] = useState(
    initialEbook?.chariow_url ?? "",
  );
  const [chariowEmbedCode, setChariowEmbedCode] = useState(
    initialEbook?.chariow_embed_code ?? "",
  );
  const [likesEnabled, setLikesEnabled] = useState(
    initialEbook?.likes_enabled ?? true,
  );
  const [commentsEnabled, setCommentsEnabled] = useState(
    initialEbook?.comments_enabled ?? true,
  );
  const [position, setPosition] = useState(
    initialEbook?.position ?? defaultPosition ?? 1,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const result = await onSubmit({
      title,
      description,
      price,
      coverUrl,
      ctaType,
      chariowUrl,
      chariowEmbedCode,
      likesEnabled,
      commentsEnabled,
      position,
    });

    setSaving(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/ebooks");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900"
    >
      <ImageUpload value={coverUrl} onChange={setCoverUrl} label="Couverture" size={40} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Titre
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Prix (€)
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          required
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className={`w-32 ${inputClasses}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Bouton « Obtenir »
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="cta_type"
              checked={ctaType === "url"}
              onChange={() => setCtaType("url")}
              className="h-4 w-4 accent-orange-500"
            />
            Lien URL
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="cta_type"
              checked={ctaType === "embed"}
              onChange={() => setCtaType("embed")}
              className="h-4 w-4 accent-orange-500"
            />
            Code d&apos;intégration (Chariow Snap)
          </label>
        </div>

        {ctaType === "url" ? (
          <input
            type="url"
            required
            placeholder="https://chariow.com/..."
            value={chariowUrl}
            onChange={(e) => setChariowUrl(e.target.value)}
            className={inputClasses}
          />
        ) : (
          <textarea
            required
            placeholder="Collez ici le code d'intégration fourni par Chariow Snap"
            value={chariowEmbedCode}
            onChange={(e) => setChariowEmbedCode(e.target.value)}
            rows={4}
            className={`font-mono text-sm ${inputClasses}`}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Position dans le feed
        </label>
        <input
          type="number"
          min={1}
          required
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className={`w-32 ${inputClasses}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={likesEnabled}
            onChange={(e) => setLikesEnabled(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          Likes activés
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={commentsEnabled}
            onChange={(e) => setCommentsEnabled(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          Commentaires activés
        </label>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className={buttonClasses("primary", "mt-2")}
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
