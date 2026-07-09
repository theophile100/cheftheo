import { createClient } from "@/lib/supabase/server";
import { LogoSection, FiliereIconsSection } from "@/components/admin/ParametresClient";

export default async function AdminParametres() {
  const supabase = await createClient();

  const [{ data: settings }, { data: filieres }] = await Promise.all([
    supabase.from("app_settings").select("logo_url").eq("id", 1).single(),
    supabase
      .from("filieres")
      .select("id, slug, name, icon_url")
      .order("position"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Apparence
      </h1>

      <div className="mt-6">
        <LogoSection initialLogoUrl={settings?.logo_url ?? null} />
        <FiliereIconsSection filieres={filieres ?? []} />
      </div>
    </div>
  );
}
