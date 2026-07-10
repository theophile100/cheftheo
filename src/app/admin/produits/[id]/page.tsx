import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProduitForm } from "@/components/admin/ProduitForm";
import { updateProduit } from "../actions";

export default async function EditProduit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: produit }, { data: filieres }] = await Promise.all([
    supabase
      .from("produits")
      .select(
        "title, description, cover_url, filiere_id, type, price, cta_type, chariow_url, chariow_embed_code, free_type, free_file_url, free_link_url, likes_enabled, comments_enabled, position",
      )
      .eq("id", id)
      .single(),
    supabase.from("filieres").select("id, name").order("position"),
  ]);

  if (!produit) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Modifier le produit
      </h1>
      <div className="mt-6">
        <ProduitForm
          filieres={filieres ?? []}
          initialProduit={produit}
          onSubmit={updateProduit.bind(null, id)}
        />
      </div>
    </div>
  );
}
