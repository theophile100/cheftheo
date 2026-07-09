import Link from "next/link";
import { formatPrice } from "@/lib/currency";

export interface EbookSummary {
  id: string;
  title: string;
  price: number;
  cover_url: string | null;
}

export function EbookTile({
  ebook,
  country,
}: {
  ebook: EbookSummary;
  country: string | null;
}) {
  return (
    <Link
      href={`/decouvrir/${ebook.id}`}
      className="mb-3 block break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
    >
      {ebook.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ebook.cover_url} alt="" className="h-auto w-full" />
      ) : (
        <div className="aspect-[3/4] w-full bg-zinc-100 dark:bg-zinc-800" />
      )}
      <div className="p-3">
        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
          {ebook.title}
        </p>
        <p className="mt-0.5 text-sm font-extrabold text-orange-500">
          {formatPrice(ebook.price, country)}
        </p>
      </div>
    </Link>
  );
}
