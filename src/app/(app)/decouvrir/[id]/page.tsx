import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/BackButton";
import { ProduitCta } from "@/components/ProduitCta";
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

  const [{ data: produit }, { data: profile }] = await Promise.all([
    supabase
      .from("produits")
      .select(
        "id, title, description, cover_url, type, price, cta_type, chariow_url, chariow_embed_code, filieres(name)",
      )
      .eq("id", id)
      .single(),
    supabase.from("profiles").select("country").eq("id", user!.id).single(),
  ]);

  if (!produit) notFound();

  const filiereName = Array.isArray(produit.filieres)
    ? produit.filieres[0]?.name
    : (produit.filieres as { name: string } | null)?.name;

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <BackButton href="/decouvrir" />

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        {produit.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produit.cover_url} alt="" className="h-auto w-full" />
        )}
        <div className="flex flex-col gap-3 p-5">
          {filiereName && (
            <span className="self-start rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
              {filiereName}
            </span>
          )}
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {produit.title}
          </h1>
          {produit.description && (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {produit.description}
            </p>
          )}
          <p className="text-2xl font-extrabold text-orange-500">
            {produit.type === "gratuit"
              ? "Gratuit"
              : formatPrice(produit.price ?? 0, profile?.country ?? null)}
          </p>
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
