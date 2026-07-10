import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { buttonClasses } from "@/lib/button-styles";
import { deleteProduit } from "./actions";

export default async function AdminProduits() {
  const supabase = await createClient();
  const { data: produits } = await supabase
    .from("produits")
    .select("id, title, type, price, cover_url, clicks, position, filieres(name)")
    .order("position");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Découvrir — produits
        </h1>
        <Link href="/admin/produits/new" className={buttonClasses("primary", "text-sm px-5 py-2.5")}>
          + Nouveau produit
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {(produits ?? []).map((produit) => {
          const filiereName = Array.isArray(produit.filieres)
            ? produit.filieres[0]?.name
            : (produit.filieres as { name: string } | null)?.name;

          return (
            <div
              key={produit.id}
              className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
            >
              {produit.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={produit.cover_url}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {produit.title}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {produit.type === "gratuit"
                    ? "Gratuit"
                    : `${(produit.price ?? 0).toFixed(2).replace(".", ",")} €`}
                  {filiereName ? ` · ${filiereName}` : ""} · {produit.clicks} clic
                  {produit.clicks > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/produits/${produit.id}`}
                  className="text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  Modifier
                </Link>
                <DeleteButton
                  onDelete={deleteProduit.bind(null, produit.id)}
                  confirmMessage={`Supprimer le produit "${produit.title}" ?`}
                />
              </div>
            </div>
          );
        })}
        {(produits ?? []).length === 0 && (
          <p className="rounded-3xl bg-white p-5 text-sm text-zinc-400 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
            Aucun produit pour l&apos;instant.
          </p>
        )}
      </div>
    </div>
  );
}
