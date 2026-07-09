"use client";

import { buttonClasses } from "@/lib/button-styles";
import { createClient } from "@/lib/supabase/client";

export interface Ebook {
  id: string;
  title: string;
  description: string | null;
  price: number;
  cover_url: string | null;
  chariow_url: string;
}

export function EbookCard({ ebook }: { ebook: Ebook }) {
  function handleObtenirClick() {
    const supabase = createClient();
    void supabase.rpc("increment_ebook_click", { p_ebook_id: ebook.id });
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      {ebook.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ebook.cover_url}
          alt=""
          className="h-56 w-full object-cover"
        />
      )}
      <div className="flex flex-col gap-2 p-5">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          {ebook.title}
        </h2>
        {ebook.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {ebook.description}
          </p>
        )}
        <p className="mt-1 text-xl font-extrabold text-orange-500">
          {ebook.price.toFixed(2).replace(".", ",")} €
        </p>
        <a
          href={ebook.chariow_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleObtenirClick}
          className={buttonClasses("primary", "mt-2 w-full")}
        >
          Obtenir
        </a>
      </div>
    </div>
  );
}
