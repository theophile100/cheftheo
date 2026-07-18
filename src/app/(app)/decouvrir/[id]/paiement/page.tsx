import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/BackButton";
import { TrustedEmbed } from "@/components/TrustedEmbed";
import { formatPrice } from "@/lib/currency";

// Page dediee au paiement : le snap Chariow ne s'affiche jamais sur la
// fiche produit elle-meme, seulement ici, apres que l'utilisateur ait
// cliqué sur "Obtenir".
export default async function Paiement({
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
    redirect(`/connexion?next=/decouvrir/${id}/paiement`);
  }

  const [{ data: produit }, { data: profile }] = await Promise.all([
    supabase
      .from("produits")
      .select("id, title, cover_url, price, cta_type, chariow_embed_code")
      .eq("id", id)
      .single(),
    supabase.from("profiles").select("country").eq("id", user.id).single(),
  ]);

  if (!produit || produit.cta_type !== "embed" || !produit.chariow_embed_code) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-xl lg:max-w-2xl">
      <BackButton href={`/decouvrir/${id}`} />

      <div className="mt-4 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        {produit.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produit.cover_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
          />
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Paiement
          </p>
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
            {produit.title}
          </h1>
          <p className="text-base font-bold text-orange-500">
            {formatPrice(produit.price ?? 0, profile?.country ?? null)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <TrustedEmbed html={produit.chariow_embed_code} />
      </div>
    </main>
  );
}
