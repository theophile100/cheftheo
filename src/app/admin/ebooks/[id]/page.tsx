import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EbookForm } from "@/components/admin/EbookForm";
import { updateEbook } from "../actions";

export default async function EditEbook({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ebook } = await supabase
    .from("ebooks")
    .select(
      "title, description, price, cover_url, cta_type, chariow_url, chariow_embed_code, likes_enabled, comments_enabled, position",
    )
    .eq("id", id)
    .single();

  if (!ebook) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Modifier l&apos;ebook
      </h1>
      <div className="mt-6">
        <EbookForm initialEbook={ebook} onSubmit={updateEbook.bind(null, id)} />
      </div>
    </div>
  );
}
