"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProduitInput } from "@/app/admin/produits/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { uploadProductFile } from "@/app/admin/actions";
import { checkImageSize } from "@/lib/upload-constraints";
import { buttonClasses } from "@/lib/button-styles";

const inputClasses =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

interface Filiere {
  id: string;
  name: string;
}

interface InitialProduit {
  title: string;
  description: string | null;
  cover_url: string | null;
  filiere_id: string | null;
  type: "gratuit" | "payant";
  price: number | null;
  cta_type: "url" | "embed" | null;
  chariow_url: string | null;
  chariow_embed_code: string | null;
  free_type: "file" | "link" | null;
  free_file_url: string | null;
  free_link_url: string | null;
  cta_label: string | null;
  likes_enabled: boolean;
  comments_enabled: boolean;
  position: number;
}

export function ProduitForm({
  filieres,
  initialProduit,
  defaultPosition,
  onSubmit,
}: {
  filieres: Filiere[];
  initialProduit?: InitialProduit;
  defaultPosition?: number;
  onSubmit: (input: ProduitInput) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialProduit?.title ?? "");
  const [description, setDescription] = useState(initialProduit?.description ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(initialProduit?.cover_url ?? null);
  const [filiereId, setFiliereId] = useState(initialProduit?.filiere_id ?? "");
  const [type, setType] = useState<"gratuit" | "payant">(initialProduit?.type ?? "payant");

  const [price, setPrice] = useState(initialProduit?.price ?? 0);
  const [ctaType, setCtaType] = useState<"url" | "embed">(initialProduit?.cta_type ?? "url");
  const [chariowUrl, setChariowUrl] = useState(initialProduit?.chariow_url ?? "");
  const [chariowEmbedCode, setChariowEmbedCode] = useState(
    initialProduit?.chariow_embed_code ?? "",
  );

  const [freeType, setFreeType] = useState<"file" | "link">(initialProduit?.free_type ?? "file");
  const [freeFileUrl, setFreeFileUrl] = useState<string | null>(
    initialProduit?.free_file_url ?? null,
  );
  const [freeLinkUrl, setFreeLinkUrl] = useState(initialProduit?.free_link_url ?? "");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [ctaLabel, setCtaLabel] = useState(initialProduit?.cta_label ?? "");

  const [likesEnabled, setLikesEnabled] = useState(initialProduit?.likes_enabled ?? true);
  const [commentsEnabled, setCommentsEnabled] = useState(
    initialProduit?.comments_enabled ?? true,
  );
  const [position, setPosition] = useState(initialProduit?.position ?? defaultPosition ?? 1);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFreeFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeError = checkImageSize(file);
    if (sizeError) {
      setError(sizeError);
      event.target.value = "";
      return;
    }

    setUploadingFile(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductFile(formData);
    setUploadingFile(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setFreeFileUrl(result.url ?? null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const result = await onSubmit({
      title,
      description,
      coverUrl,
      filiereId: filiereId || null,
      type,
      price,
      ctaType,
      chariowUrl,
      chariowEmbedCode,
      freeType,
      freeFileUrl,
      freeLinkUrl,
      ctaLabel,
      likesEnabled,
      commentsEnabled,
      position,
    });

    setSaving(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/produits");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
    >
      <ImageUpload value={coverUrl} onChange={setCoverUrl} label="Couverture" size={40} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Titre</label>
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
          Filière ou thème associé
        </label>
        <select
          value={filiereId}
          onChange={(e) => setFiliereId(e.target.value)}
          className={inputClasses}
        >
          <option value="">Aucune / thème général</option>
          {filieres.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="type"
              checked={type === "payant"}
              onChange={() => setType("payant")}
              className="h-4 w-4 accent-orange-500"
            />
            Payant
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="type"
              checked={type === "gratuit"}
              onChange={() => setType("gratuit")}
              className="h-4 w-4 accent-orange-500"
            />
            Gratuit
          </label>
        </div>
      </div>

      {type === "payant" ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ce que l&apos;utilisateur reçoit
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="radio"
                name="free_type"
                checked={freeType === "file"}
                onChange={() => setFreeType("file")}
                className="h-4 w-4 accent-orange-500"
              />
              Image
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="radio"
                name="free_type"
                checked={freeType === "link"}
                onChange={() => setFreeType("link")}
                className="h-4 w-4 accent-orange-500"
              />
              Vidéo
            </label>
          </div>

          {freeType === "file" ? (
            <div className="flex flex-col gap-2">
              {freeFileUrl && (
                <a
                  href={freeFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  Image actuelle
                </a>
              )}
              <label className="cursor-pointer text-sm font-medium text-orange-500 hover:text-orange-600">
                {uploadingFile ? "Envoi..." : freeFileUrl ? "Changer l'image" : "Choisir une image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFreeFileChange}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <input
              type="url"
              required
              placeholder="Lien YouTube, Vimeo, etc."
              value={freeLinkUrl}
              onChange={(e) => setFreeLinkUrl(e.target.value)}
              className={inputClasses}
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Texte du bouton
        </label>
        <input
          value={ctaLabel}
          onChange={(e) => setCtaLabel(e.target.value)}
          placeholder={type === "gratuit" ? "Obtenir gratuitement" : "Obtenir"}
          className={inputClasses}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Laissez vide pour le texte par défaut, ou personnalisez (ex. « Regarder la vidéo »).
        </p>
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

      <button type="submit" disabled={saving} className={buttonClasses("primary", "mt-2")}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
