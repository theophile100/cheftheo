import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/BackButton";
import { EbookCta } from "@/components/EbookCta";
import { formatPrice } from "@/lib/currency";

export default async function EbookDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: ebook }, { data: profile }] = await Promise.all([
    supabase
      .from("ebooks")
      .select(
        "id, title, description, price, cover_url, cta_type, chariow_url, chariow_embed_code",
      )
      .eq("id", id)
      .single(),
    supabase.from("profiles").select("country").eq("id", user!.id).single(),
  ]);

  if (!ebook) notFound();

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <BackButton href="/decouvrir" />

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        {ebook.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ebook.cover_url} alt="" className="h-auto w-full" />
        )}
        <div className="flex flex-col gap-3 p-5">
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {ebook.title}
          </h1>
          {ebook.description && (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {ebook.description}
            </p>
          )}
          <p className="text-2xl font-extrabold text-orange-500">
            {formatPrice(ebook.price, profile?.country ?? null)}
          </p>
          <EbookCta
            ebookId={ebook.id}
            ctaType={ebook.cta_type}
            chariowUrl={ebook.chariow_url}
            chariowEmbedCode={ebook.chariow_embed_code}
          />
        </div>
      </div>
    </main>
  );
}
