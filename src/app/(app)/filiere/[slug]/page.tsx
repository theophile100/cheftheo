import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeconTree } from "@/components/LeconTree";

export default async function Filiere({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: filiere } = await supabase
    .from("filieres")
    .select("id, name, icon")
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
      <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {filiere.icon} {filiere.name}
      </h1>

      <LeconTree lecons={lecons ?? []} />
    </main>
  );
}
