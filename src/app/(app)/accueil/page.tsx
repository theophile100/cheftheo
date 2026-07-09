import { createClient } from "@/lib/supabase/server";
import { FiliereGrid } from "@/components/FiliereGrid";

export default async function Accueil() {
  const supabase = await createClient();

  const [{ data: filieres }, { data: lecons }] = await Promise.all([
    supabase
      .from("filieres")
      .select("id, slug, name, icon, position")
      .order("position"),
    supabase.from("lecons").select("id, filiere_id"),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Choisissez une filière
      </h1>

      <FiliereGrid filieres={filieres ?? []} lecons={lecons ?? []} />
    </main>
  );
}
