import Link from "next/link";
import { IconBolt } from "@tabler/icons-react";
import { formatPrice } from "@/lib/currency";

export interface ProduitSummary {
  id: string;
  title: string;
  type: "gratuit" | "payant";
  price: number | null;
  cover_url: string | null;
}

export function ProduitTile({
  produit,
  country,
}: {
  produit: ProduitSummary;
  country: string | null;
}) {
  return (
    <Link
      href={`/decouvrir/${produit.id}`}
      className="mb-3 block break-inside-avoid overflow-hidden rounded-3xl bg-white shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
    >
      <div className="relative">
        {produit.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produit.cover_url} alt={produit.title} className="h-auto w-full" />
        ) : (
          <div className="aspect-[3/4] w-full bg-zinc-100 dark:bg-zinc-800" />
        )}

        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-orange-500 shadow-sm dark:bg-zinc-900/90">
            {produit.type === "gratuit" ? "Gratuit" : formatPrice(produit.price ?? 0, country)}
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-1 text-[11px] font-bold text-orange-500 shadow-sm dark:bg-zinc-900/80">
            <IconBolt size={12} stroke={2} />
            {produit.type === "gratuit" ? "+10" : "Plein"}
          </span>
        </div>
      </div>
    </Link>
  );
}
