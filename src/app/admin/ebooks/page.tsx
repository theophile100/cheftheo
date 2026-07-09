import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { buttonClasses } from "@/lib/button-styles";
import { deleteEbook } from "./actions";

export default async function AdminEbooks() {
  const supabase = await createClient();
  const { data: ebooks } = await supabase
    .from("ebooks")
    .select("id, title, price, cover_url, clicks, position")
    .order("position");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Découvrir — ebooks
        </h1>
        <Link href="/admin/ebooks/new" className={buttonClasses("primary", "text-sm px-5 py-2.5")}>
          + Nouvel ebook
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {(ebooks ?? []).map((ebook) => (
          <div
            key={ebook.id}
            className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
          >
            {ebook.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ebook.cover_url}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {ebook.title}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {ebook.price.toFixed(2).replace(".", ",")} € · {ebook.clicks}{" "}
                clic{ebook.clicks > 1 ? "s" : ""} sur « Obtenir »
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/ebooks/${ebook.id}`}
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                Modifier
              </Link>
              <DeleteButton
                onDelete={deleteEbook.bind(null, ebook.id)}
                confirmMessage={`Supprimer l'ebook "${ebook.title}" ?`}
              />
            </div>
          </div>
        ))}
        {(ebooks ?? []).length === 0 && (
          <p className="rounded-3xl bg-white p-5 text-sm text-zinc-400 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
            Aucun ebook pour l&apos;instant.
          </p>
        )}
      </div>
    </div>
  );
}
