"use client";

import { useState } from "react";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";

export interface CommentRow {
  id: string;
  author_label: string;
  text: string;
  parent_comment_id: string | null;
  status: "en_attente" | "approuve" | "refuse";
  user_id: string;
  likes_count: number;
  liked_by_me: boolean;
}

function StatusBadge({ status }: { status: CommentRow["status"] }) {
  if (status === "en_attente") {
    return (
      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        En attente de validation
      </span>
    );
  }
  if (status === "refuse") {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">
        Refusé
      </span>
    );
  }
  return null;
}

function CommentActions({
  comment,
  onReply,
}: {
  comment: CommentRow;
  onReply: () => void;
}) {
  const [liked, setLiked] = useState(comment.liked_by_me);
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [busy, setBusy] = useState(false);

  async function handleLike() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("toggle_commentaire_like", {
      p_commentaire_id: comment.id,
    });
    setBusy(false);
    if (error) return;
    setLiked(data.liked);
    setLikesCount(data.likes_count);
  }

  async function handleShare() {
    const url = `${window.location.href}#comment-${comment.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: comment.text, url });
      } catch {
        // cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
      <button type="button" onClick={handleLike} disabled={busy} className="flex items-center gap-1">
        {liked ? (
          <IconHeartFilled size={15} className="text-orange-500" />
        ) : (
          <IconHeart size={15} stroke={1.75} />
        )}
        {likesCount > 0 && <span>{likesCount}</span>}
      </button>
      <button type="button" onClick={onReply}>
        Répondre
      </button>
      <button type="button" onClick={handleShare}>
        Partager
      </button>
    </div>
  );
}

function CommentRowView({
  comment,
  onSubmitReply,
}: {
  comment: CommentRow;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!replyText.trim()) return;
    setBusy(true);
    await onSubmitReply(comment.id, replyText.trim());
    setBusy(false);
    setReplyText("");
    setReplying(false);
  }

  return (
    <div id={`comment-${comment.id}`}>
      <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            {comment.author_label}
          </p>
          <StatusBadge status={comment.status} />
        </div>
        <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-200">{comment.text}</p>
        <CommentActions comment={comment} onReply={() => setReplying((r) => !r)} />
      </div>

      {replying && (
        <form onSubmit={handleSubmit} className="ml-4 mt-2 flex flex-col gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Répondre à ${comment.author_label}...`}
            rows={2}
            maxLength={500}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={busy || !replyText.trim()}
            className="self-start rounded-xl bg-orange-500 px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "..." : "Répondre"}
          </button>
        </form>
      )}
    </div>
  );
}

export function ProduitComments({
  produitId,
  initialComments,
}: {
  produitId: string;
  initialComments: CommentRow[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [newText, setNewText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitComment(text: string, parentCommentId: string | null) {
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("add_produit_comment", {
      p_produit_id: produitId,
      p_text: text,
      p_parent_comment_id: parentCommentId,
    });
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setComments((prev) => [
      ...prev,
      { ...(data as CommentRow), likes_count: 0, liked_by_me: false },
    ]);
  }

  async function handleNewComment(event: React.FormEvent) {
    event.preventDefault();
    if (!newText.trim()) return;
    setBusy(true);
    await submitComment(newText.trim(), null);
    setBusy(false);
    setNewText("");
  }

  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const repliesByParent = new Map<string, CommentRow[]>();
  for (const c of comments) {
    if (c.parent_comment_id) {
      const list = repliesByParent.get(c.parent_comment_id) ?? [];
      list.push(c);
      repliesByParent.set(c.parent_comment_id, list);
    }
  }

  return (
    <div id="commentaires">
      <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">Commentaires</h2>

      <form onSubmit={handleNewComment} className="mt-3 flex flex-col gap-2">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={2}
          maxLength={500}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !newText.trim()}
          className="self-start rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "..." : "Envoyer"}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-4">
        {topLevel.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-2">
            <CommentRowView
              comment={comment}
              onSubmitReply={(parentId, text) => submitComment(text, parentId)}
            />
            {(repliesByParent.get(comment.id) ?? []).map((reply) => (
              <div key={reply.id} className="ml-5">
                <CommentRowView
                  comment={reply}
                  onSubmitReply={(parentId, text) => submitComment(text, parentId)}
                />
              </div>
            ))}
          </div>
        ))}
        {topLevel.length === 0 && (
          <p className="text-sm text-zinc-400">Aucun commentaire pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
