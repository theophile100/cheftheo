import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeconTree } from "@/components/LeconTree";
import { filiereColor } from "@/lib/filiere-style";

export default async function Filiere({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: filiere } = await supabase
    .from("filieres")
    .select("id, name, position")
    .eq("slug", slug)
    .single();

  if (!filiere) {
    notFound();
  }

  const { data: lecons } = await supabase
    .from("lecons")
    .select("id, title, position")
    .eq("filiere_id", filiere.id)
    .order("position");

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white ${filiereColor(filiere.position)}`}
        >
          {filiere.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {filiere.name}
        </h1>
      </div>

      <LeconTree lecons={lecons ?? []} />
    </main>
  );
}
