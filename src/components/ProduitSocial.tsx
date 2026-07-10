"use client";

import { useState } from "react";
import { IconHeart, IconHeartFilled, IconMessageCircle, IconShare2 } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";

export function ProduitSocial({
  produitId,
  likesEnabled,
  commentsEnabled,
  initialLiked,
}: {
  produitId: string;
  likesEnabled: boolean;
  commentsEnabled: boolean;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeBusy, setLikeBusy] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  async function handleToggleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("toggle_produit_like", {
      p_produit_id: produitId,
    });
    setLikeBusy(false);
    if (error) return;
    setLiked(data.liked);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Lien copié !");
      setTimeout(() => setShareMessage(null), 2000);
    } catch {
      setShareMessage("Impossible de copier le lien.");
      setTimeout(() => setShareMessage(null), 2000);
    }
  }

  return (
    <div className="flex items-center gap-5">
      {likesEnabled && (
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={likeBusy}
          aria-label={liked ? "Retirer le like" : "Aimer"}
          className="disabled:opacity-60"
        >
          {liked ? (
            <IconHeartFilled size={22} className="text-orange-500" />
          ) : (
            <IconHeart size={22} stroke={1.75} className="text-zinc-600 dark:text-zinc-300" />
          )}
        </button>
      )}

      {commentsEnabled && (
        <a href="#commentaires" aria-label="Voir les commentaires">
          <IconMessageCircle size={22} stroke={1.75} className="text-zinc-600 dark:text-zinc-300" />
        </a>
      )}

      <button type="button" onClick={handleShare} aria-label="Partager">
        <IconShare2 size={22} stroke={1.75} className="text-zinc-600 dark:text-zinc-300" />
      </button>

      {shareMessage && (
        <span className="text-sm font-semibold text-orange-500">{shareMessage}</span>
      )}
    </div>
  );
}
