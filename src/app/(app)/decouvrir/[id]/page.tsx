import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/BackButton";
import { ProduitCta } from "@/components/ProduitCta";
import { ProduitSocial } from "@/components/ProduitSocial";
import { ProduitDescription } from "@/components/ProduitDescription";
import { ProduitComments, type CommentRow } from "@/components/ProduitComments";
import { IconBolt } from "@tabler/icons-react";
import { formatPrice } from "@/lib/currency";

export default async function ProduitDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/connexion?next=/decouvrir/${id}`);
  }

  const [
    { data: produit },
    { data: profile },
    { data: ownLike },
    { data: rawComments },
  ] = await Promise.all([
    supabase
      .from("produits")
      .select(
        "id, title, description, cover_url, type, price, cta_type, chariow_url, chariow_embed_code, likes_enabled, comments_enabled, filieres(name)",
      )
      .eq("id", id)
      .single(),
    supabase.from("profiles").select("country").eq("id", user!.id).single(),
    supabase
      .from("produit_likes")
      .select("user_id")
      .eq("produit_id", id)
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("produit_commentaires")
      .select("id, author_label, text, parent_comment_id, status, user_id, created_at")
      .eq("produit_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!produit) notFound();

  const commentIds = (rawComments ?? []).map((c) => c.id);
  const { data: allLikes } = commentIds.length
    ? await supabase
        .from("commentaire_likes")
        .select("commentaire_id, user_id")
        .in("commentaire_id", commentIds)
    : { data: [] as { commentaire_id: string; user_id: string }[] };

  const comments: CommentRow[] = (rawComments ?? []).map((c) => {
    const likesForComment = (allLikes ?? []).filter((l) => l.commentaire_id === c.id);
    return {
      id: c.id,
      author_label: c.author_label,
      text: c.text,
      parent_comment_id: c.parent_comment_id,
      status: c.status,
      user_id: c.user_id,
      likes_count: likesForComment.length,
      liked_by_me: likesForComment.some((l) => l.user_id === user!.id),
    };
  });

  const filiereName = Array.isArray(produit.filieres)
    ? produit.filieres[0]?.name
    : (produit.filieres as { name: string } | null)?.name;

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-xl lg:max-w-2xl">
      <BackButton href="/decouvrir" />

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        {produit.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produit.cover_url} alt="" className="h-auto w-full" />
        )}
        <div className="flex flex-col gap-4 p-5">
          {filiereName && (
            <span className="self-start rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
              {filiereName}
            </span>
          )}

          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {produit.title}
          </h1>

          <div className="flex items-center gap-3">
            <p className="text-2xl font-extrabold text-orange-500">
              {produit.type === "gratuit"
                ? "Gratuit"
                : formatPrice(produit.price ?? 0, profile?.country ?? null)}
            </p>
            <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
              <IconBolt size={14} stroke={2} />
              {produit.type === "gratuit" ? "+10" : "Plein"}
            </span>
          </div>

          <ProduitSocial
            produitId={produit.id}
            likesEnabled={produit.likes_enabled}
            commentsEnabled={produit.comments_enabled}
            initialLiked={!!ownLike}
          />

          {produit.description && <ProduitDescription text={produit.description} />}

          {produit.comments_enabled && (
            <ProduitComments produitId={produit.id} initialComments={comments} />
          )}

          <ProduitCta
            produitId={produit.id}
            type={produit.type}
            ctaType={produit.cta_type}
            chariowUrl={produit.chariow_url}
            chariowEmbedCode={produit.chariow_embed_code}
            userId={user!.id}
          />
        </div>
      </div>
    </main>
  );
}
