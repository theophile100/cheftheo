"use client";

import { useState } from "react";
import { buttonClasses } from "@/lib/button-styles";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress-context";
import { TrustedEmbed } from "@/components/TrustedEmbed";

interface ClaimResult {
  energy_added: number;
  free_type: "file" | "link";
  free_file_url: string | null;
  free_link_url: string | null;
}

export function ProduitCta({
  produitId,
  type,
  ctaType,
  chariowUrl,
  chariowEmbedCode,
  userId,
}: {
  produitId: string;
  type: "gratuit" | "payant";
  ctaType: "url" | "embed" | null;
  chariowUrl: string | null;
  chariowEmbedCode: string | null;
  userId: string;
}) {
  const { energy, setEnergy } = useProgress();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function trackClick() {
    const supabase = createClient();
    void supabase.rpc("increment_produit_click", { p_produit_id: produitId });
  }

  async function handleFreeClick() {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("claim_free_produit", {
      p_produit_id: produitId,
    });
    setLoading(false);
    trackClick();

    if (error) {
      setMessage("Une erreur est survenue. Réessayez.");
      return;
    }

    const result = data as ClaimResult;

    if (result.energy_added > 0) {
      setEnergy(Math.min(25, energy + result.energy_added));
      setMessage(`+${result.energy_added} énergie !`);
      setTimeout(() => setMessage(null), 3000);
    }

    const url = result.free_type === "file" ? result.free_file_url : result.free_link_url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  if (type === "gratuit") {
    return (
      <div>
        <button
          type="button"
          onClick={handleFreeClick}
          disabled={loading}
          className={buttonClasses("primary", "mt-2 w-full")}
        >
          {loading ? "..." : "Obtenir gratuitement"}
        </button>
        {message && (
          <p className="mt-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (ctaType === "embed" && chariowEmbedCode) {
    return (
      <div onClickCapture={trackClick} className="mt-2">
        <TrustedEmbed html={chariowEmbedCode} />
      </div>
    );
  }

  // Encodes both the buyer and the product into the one passthrough field
  // Chariow is expected to echo back on the webhook (see /api/chariow-webhook).
  const reference = `${userId}::${produitId}`;
  const separator = chariowUrl?.includes("?") ? "&" : "?";
  const href = chariowUrl
    ? `${chariowUrl}${separator}client_reference_id=${encodeURIComponent(reference)}`
    : "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
      className={buttonClasses("primary", "mt-2 w-full")}
    >
      Obtenir
    </a>
  );
}
