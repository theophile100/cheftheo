import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeconTree } from "@/components/LeconTree";
import { FiliereIcon } from "@/components/FiliereIcon";
import { BackButton } from "@/components/BackButton";
import { LanguagePicker } from "@/components/LanguagePicker";
import { Mascot } from "@/components/Mascot";
import { NiveauParcoursTabs } from "@/components/NiveauParcoursTabs";

export default async function Filiere({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ niveau?: string }>;
}) {
  const { slug } = await params;
  const { niveau: niveauParam } = await searchParams;
  const parcoursNiveau = niveauParam === "2" ? 2 : 1;
  const supabase = await createClient();

  const [{ data: filiere }, { data: { user } }] = await Promise.all([
    supabase
      .from("filieres")
      .select("id, name, slug, icon_url, position")
      .eq("slug", slug)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!filiere) {
    notFound();
  }

  const isLangues = filiere.slug === "langues";

  let niveauEtude: "cap" | "bts" = "cap";
  let niveauUtilisateur: "debutant" | "intermediaire" | "avance" | null = null;
  if (!isLangues && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("niveau_etude, niveau_utilisateur")
      .eq("id", user.id)
      .single();
    niveauEtude = (profile?.niveau_etude as "cap" | "bts") ?? "cap";
    niveauUtilisateur =
      (profile?.niveau_utilisateur as "debutant" | "intermediaire" | "avance" | null) ?? null;
  }

  // Une lecon/unite non marquee (niveau_difficulte nul) reste visible pour
  // tous les niveaux -- pour l'instant, aucun contenu n'est encore reserve
  // a un niveau precis, donc ce filtre ne change rien de visible tant que
  // rien n'est marque depuis l'admin.
  const niveauDifficulteFilter = niveauUtilisateur
    ? `niveau_difficulte.is.null,niveau_difficulte.eq.${niveauUtilisateur}`
    : "niveau_difficulte.is.null";

  const [{ data: lecons }, { data: unites }] = isLangues
    ? [{ data: [] }, { data: [] }]
    : await Promise.all([
        supabase
          .from("lecons")
          .select("id, title, position, unite_id")
          .eq("filiere_id", filiere.id)
          .eq("niveau_etude", niveauEtude)
          .eq("parcours_niveau", parcoursNiveau)
          .or(niveauDifficulteFilter)
          .order("position"),
        supabase
          .from("unites")
          .select("id, title, position")
          .eq("filiere_id", filiere.id)
          .eq("niveau_etude", niveauEtude)
          .eq("parcours_niveau", parcoursNiveau)
          .or(niveauDifficulteFilter)
          .order("position"),
      ]);

  const hasLecons = (lecons?.length ?? 0) > 0;

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-2xl lg:max-w-4xl">
      <BackButton href="/accueil" />

      <div className="mt-2 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
          <FiliereIcon slug={filiere.slug} iconUrl={filiere.icon_url} size={34} />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {filiere.name}
        </h1>
      </div>

      {isLangues ? (
        <LanguagePicker />
      ) : (
        <>
          <NiveauParcoursTabs basePath={`/filiere/${filiere.slug}`} current={parcoursNiveau} />
          {hasLecons ? (
            <LeconTree lecons={lecons ?? []} unites={unites ?? []} filiereSlug={filiere.slug} />
          ) : (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <Mascot mood="idle" size={80} />
              <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
                Contenu bientôt disponible.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
