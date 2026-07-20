import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FiliereUniteCard } from "@/components/admin/FiliereUniteCard";
import { buttonClasses } from "@/lib/button-styles";

interface Unite {
  id: string;
  filiere_id: string;
  title: string;
  position: number;
  niveau_etude: string | null;
  langue_code: string | null;
  parcours_niveau: number;
  niveau_difficulte: string | null;
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-orange-500 text-white shadow-[0_2px_0_0_#a75a18]"
          : "bg-white text-zinc-500 hover:text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      }`}
    >
      {children}
    </Link>
  );
}

const NIVEAU_DIFFICULTE_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
];

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ diplome?: string; niveau?: string; categorie?: string }>;
}) {
  const { diplome: diplomeParam, niveau: niveauParam, categorie: categorieParam } = await searchParams;
  const diplome = diplomeParam === "bts" ? "bts" : "cap";
  const parcoursNiveau = niveauParam === "2" ? 2 : 1;
  const categorie = NIVEAU_DIFFICULTE_OPTIONS.some((o) => o.value === categorieParam) ? (categorieParam ?? "") : "";

  const supabase = await createClient();

  const [{ data: filieres }, { data: allUnites }, { data: allLecons }] =
    await Promise.all([
      supabase
        .from("filieres")
        .select("id, slug, name, icon_url, position")
        .order("position"),
      supabase
        .from("unites")
        .select(
          "id, filiere_id, title, position, niveau_etude, langue_code, parcours_niveau, niveau_difficulte",
        )
        .eq("parcours_niveau", parcoursNiveau)
        .order("position"),
      supabase
        .from("lecons")
        .select(
          "id, filiere_id, unite_id, title, position, niveau_etude, langue_code, parcours_niveau, niveau_difficulte",
        )
        .eq("parcours_niveau", parcoursNiveau)
        .order("position"),
    ]);

  const otherParams = (overrides: { diplome?: string; niveau?: string; categorie?: string }) => {
    const p = new URLSearchParams({
      diplome,
      niveau: String(parcoursNiveau),
      ...(categorie ? { categorie } : {}),
      ...overrides,
    });
    if (!p.get("categorie")) p.delete("categorie");
    return `/admin?${p.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Filières, unités &amp; leçons
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/unites/import"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          >
            Importer une unité
          </Link>
          <Link href="/admin/unites/new" className={buttonClasses("dark", "text-sm px-5 py-2.5")}>
            + Nouvelle unité
          </Link>
          <Link href="/admin/lecons/new" className={buttonClasses("primary", "text-sm px-5 py-2.5")}>
            + Nouvelle leçon
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          <TabLink href={otherParams({ diplome: "cap" })} active={diplome === "cap"}>
            CAP
          </TabLink>
          <TabLink href={otherParams({ diplome: "bts" })} active={diplome === "bts"}>
            BTS
          </TabLink>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          <TabLink href={otherParams({ niveau: "1" })} active={parcoursNiveau === 1}>
            Niveau 1
          </TabLink>
          <TabLink href={otherParams({ niveau: "2" })} active={parcoursNiveau === 2}>
            Niveau 2
          </TabLink>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          {NIVEAU_DIFFICULTE_OPTIONS.map((o) => (
            <TabLink key={o.value} href={otherParams({ categorie: o.value })} active={categorie === o.value}>
              {o.label}
            </TabLink>
          ))}
        </div>
        <p className="text-xs text-zinc-400">
          Langues ignore le diplôme (CAP/BTS) : contenu commun aux deux.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {(filieres ?? []).map((filiere) => {
          const isLangues = filiere.slug === "langues";

          const unites = (allUnites ?? [])
            .filter((u) => u.filiere_id === filiere.id)
            .filter((u) => (isLangues ? true : u.niveau_etude === diplome))
            .filter((u) => !categorie || u.niveau_difficulte === categorie);
          const lecons = (allLecons ?? [])
            .filter((l) => l.filiere_id === filiere.id)
            .filter((l) => (isLangues ? true : l.niveau_etude === diplome))
            .filter((l) => !categorie || l.niveau_difficulte === categorie);

          const uniteGroups = unites.map((u) => ({
            unite: u as Unite,
            lecons: lecons
              .filter((l) => l.unite_id === u.id)
              .sort((a, b) => a.position - b.position),
          }));
          const unassignedLecons = lecons
            .filter((l) => !l.unite_id || !unites.some((u) => u.id === l.unite_id))
            .sort((a, b) => a.position - b.position);

          return (
            <FiliereUniteCard
              key={filiere.id}
              filiere={filiere}
              isLangues={isLangues}
              uniteGroups={uniteGroups}
              unassignedLecons={unassignedLecons}
              parcoursNiveau={parcoursNiveau}
            />
          );
        })}
      </div>
    </div>
  );
}
