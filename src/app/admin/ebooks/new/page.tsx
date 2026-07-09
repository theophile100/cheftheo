import { createClient } from "@/lib/supabase/server";
import { EbookForm } from "@/components/admin/EbookForm";
import { createEbook } from "../actions";

export default async function NewEbook() {
  const supabase = await createClient();
  const { data: ebooks } = await supabase
    .from("ebooks")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  const defaultPosition = (ebooks?.[0]?.position ?? 0) + 1;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Nouvel ebook
      </h1>
      <div className="mt-6">
        <EbookForm defaultPosition={defaultPosition} onSubmit={createEbook} />
      </div>
    </div>
  );
}
