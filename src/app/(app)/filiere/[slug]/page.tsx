import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeconTree } from "@/components/LeconTree";
import { FiliereIcon } from "@/components/FiliereIcon";
import { BackButton } from "@/components/BackButton";

export default async function Filiere({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: filiere } = await supabase
    .from("filieres")
    .select("id, name, slug, icon_url, position")
    .eq("slug", slug)
    .single();

  if (!filiere) {
    notFound();
  }

  const [{ data: lecons }, { data: unites }] = await Promise.all([
    supabase
      .from("lecons")
      .select("id, title, position, unite_id")
      .eq("filiere_id", filiere.id)
      .order("position"),
    supabase
      .from("unites")
      .select("id, title, position")
      .eq("filiere_id", filiere.id)
      .order("position"),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <BackButton href="/accueil" />

      <div className="mt-2 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
          <FiliereIcon slug={filiere.slug} iconUrl={filiere.icon_url} size={34} />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {filiere.name}
        </h1>
      </div>

      <LeconTree lecons={lecons ?? []} unites={unites ?? []} filiereSlug={filiere.slug} />
    </main>
  );
}
