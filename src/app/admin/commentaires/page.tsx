import { createAdminClient } from "@/lib/supabase/admin";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { buttonClasses } from "@/lib/button-styles";
import { approveComment, rejectComment } from "./actions";

export default async function AdminCommentaires() {
  // Regular RLS only lets each user see approved comments plus their own
  // pending ones — moderation needs to see everyone's, hence service role.
  const supabase = createAdminClient();

  const { data: comments } = await supabase
    .from("produit_commentaires")
    .select("id, author_label, text, parent_comment_id, created_at, produits(title)")
    .eq("status", "en_attente")
    .order("created_at");

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Commentaires à valider
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        {(comments ?? []).map((comment) => {
          const produitTitle = Array.isArray(comment.produits)
            ? comment.produits[0]?.title
            : (comment.produits as { title: string } | null)?.title;

          return (
            <div
              key={comment.id}
              className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {produitTitle ?? "Produit supprimé"}
                {comment.parent_comment_id ? " · réponse à un commentaire" : ""}
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-700 dark:text-zinc-200">
                {comment.author_label}
              </p>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{comment.text}</p>

              <div className="mt-4 flex items-center gap-3">
                <form action={approveComment.bind(null, comment.id)}>
                  <button type="submit" className={buttonClasses("success", "text-sm px-4 py-2")}>
                    Approuver
                  </button>
                </form>
                <DeleteButton
                  onDelete={rejectComment.bind(null, comment.id)}
                  confirmMessage="Refuser ce commentaire ?"
                  label="Refuser"
                />
              </div>
            </div>
          );
        })}
        {(comments ?? []).length === 0 && (
          <p className="rounded-3xl bg-white p-5 text-sm text-zinc-400 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
            Aucun commentaire en attente.
          </p>
        )}
      </div>
    </div>
  );
}
