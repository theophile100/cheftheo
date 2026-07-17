import { createClient } from "@/lib/supabase/server";
import { MaterielClient } from "@/components/admin/MaterielClient";

export default async function AdminMateriel() {
  const supabase = await createClient();

  const [{ data: filieres }, { data: items }] = await Promise.all([
    supabase.from("filieres").select("id, slug, name").order("position"),
    supabase
      .from("materiel_items")
      .select("id, filiere_id, name, position, image_url, categorie, sous_groupe, ingredients")
      .order("position"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Matériel</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Téléversez une image pour chaque emplacement. Tant qu&apos;aucune image n&apos;est
        fournie, l&apos;emplacement reste neutre — les jeux de la filière utiliseront ces
        images une fois en place.
      </p>
      <div className="mt-6">
        <MaterielClient filieres={filieres ?? []} items={items ?? []} />
      </div>
    </div>
  );
}
