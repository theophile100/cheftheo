import { createClient } from "@/lib/supabase/server";
import { ProfileStats } from "@/components/ProfileStats";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { FiliereGrid } from "@/components/FiliereGrid";
import { BackButton } from "@/components/BackButton";
import { countries } from "@/data/countries";

export default async function Profil() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: filieres }, { data: lecons }] = await Promise.all([
    supabase.from("profiles").select("country, phone").eq("id", user!.id).single(),
    supabase
      .from("filieres")
      .select("id, slug, name, icon, position")
      .order("position"),
    supabase.from("lecons").select("id, filiere_id"),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="flex items-center">
        <BackButton href="/accueil" />
        <h1 className="flex-1 text-center text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Profil
        </h1>
        <div className="w-10" />
      </div>

      <div className="mt-6">
        <ProfileStats />
      </div>

      <h2 className="mt-9 text-xs font-bold uppercase tracking-wide text-zinc-400">
        Mes informations
      </h2>
      <div className="mt-2">
        <ProfileEditForm
          initialCountry={profile?.country ?? ""}
          initialPhone={profile?.phone ?? ""}
          countries={countries}
        />
      </div>

      <h2 className="mt-9 text-xs font-bold uppercase tracking-wide text-zinc-400">
        Progression par filière
      </h2>
      <FiliereGrid filieres={filieres ?? []} lecons={lecons ?? []} />
    </main>
  );
}
