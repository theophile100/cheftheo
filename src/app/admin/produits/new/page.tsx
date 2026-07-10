import { createClient } from "@/lib/supabase/server";
import { ProduitForm } from "@/components/admin/ProduitForm";
import { createProduit } from "../actions";

export default async function NewProduit() {
  const supabase = await createClient();

  const [{ data: filieres }, { data: produits }] = await Promise.all([
    supabase.from("filieres").select("id, name").order("position"),
    supabase
      .from("produits")
      .select("position")
      .order("position", { ascending: false })
      .limit(1),
  ]);

  const defaultPosition = (produits?.[0]?.position ?? 0) + 1;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Nouveau produit
      </h1>
      <div className="mt-6">
        <ProduitForm
          filieres={filieres ?? []}
          defaultPosition={defaultPosition}
          onSubmit={createProduit}
        />
      </div>
    </div>
  );
}
