import { createClient } from "@/lib/supabase/server";
import { ProfileStats } from "@/components/ProfileStats";
import { FiliereGrid } from "@/components/FiliereGrid";

export default async function Profil() {
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
      <h1 className="text-center text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        Profil
      </h1>

      <div className="mt-6">
        <ProfileStats />
      </div>

      <h2 className="mt-9 text-xs font-bold uppercase tracking-wide text-zinc-400">
        Progression par filière
      </h2>
      <FiliereGrid filieres={filieres ?? []} lecons={lecons ?? []} />
    </main>
  );
}
