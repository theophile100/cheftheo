"use client";

import { useState } from "react";
import { IconHeart, IconHeartFilled, IconMessageCircle, IconShare2 } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";

interface Comment {
  id: string;
  author_label: string;
  text: string;
  created_at: string;
}

export function ProduitSocial({
  produitId,
  likesEnabled,
  commentsEnabled,
  initialLiked,
  initialLikesCount,
  initialComments,
}: {
  produitId: string;
  likesEnabled: boolean;
  commentsEnabled: boolean;
  initialLiked: boolean;
  initialLikesCount: number;
  initialComments: Comment[];
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [likeBusy, setLikeBusy] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

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
    setLikesCount(data.likes_count);
  }

  async function handleAddComment(event: React.FormEvent) {
    event.preventDefault();
    if (!commentText.trim()) return;
    setCommentBusy(true);
    setCommentError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("add_produit_comment", {
      p_produit_id: produitId,
      p_text: commentText.trim(),
    });
    setCommentBusy(false);
    if (error) {
      setCommentError(error.message);
      return;
    }
    setComments((prev) => [data as Comment, ...prev]);
    setCommentText("");
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
    <div>
      <div className="flex items-center gap-5">
        {likesEnabled && (
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={likeBusy}
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 disabled:opacity-60 dark:text-zinc-300"
          >
            {liked ? (
              <IconHeartFilled size={22} className="text-orange-500" />
            ) : (
              <IconHeart size={22} stroke={1.75} />
            )}
            {likesCount}
          </button>
        )}

        {commentsEnabled && (
          <button
            type="button"
            onClick={() => setCommentsOpen((open) => !open)}
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 dark:text-zinc-300"
          >
            <IconMessageCircle size={22} stroke={1.75} />
            {comments.length}
          </button>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 dark:text-zinc-300"
        >
          <IconShare2 size={22} stroke={1.75} />
          Partager
        </button>

        {shareMessage && (
          <span className="text-sm font-semibold text-orange-500">{shareMessage}</span>
        )}
      </div>

      {commentsEnabled && commentsOpen && (
        <div className="mt-4 flex flex-col gap-3">
          <form onSubmit={handleAddComment} className="flex flex-col gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ajouter un commentaire..."
              rows={2}
              maxLength={500}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            {commentError && (
              <p className="text-xs text-red-600 dark:text-red-400">{commentError}</p>
            )}
            <button
              type="submit"
              disabled={commentBusy || !commentText.trim()}
              className="self-start rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {commentBusy ? "..." : "Envoyer"}
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {comment.author_label}
                </p>
                <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-200">
                  {comment.text}
                </p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-zinc-400">Aucun commentaire pour l&apos;instant.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
