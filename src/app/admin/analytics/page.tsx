import { createAdminClient } from "@/lib/supabase/admin";
import { StatTile } from "@/components/admin/StatTile";
import { BarChart } from "@/components/admin/BarChart";

export default async function AdminAnalytics() {
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: lecons },
    { data: userLecons },
    { data: ebooks },
  ] = await Promise.all([
    admin.from("profiles").select("id, country"),
    admin.from("lecons").select("id, title, filieres(name)"),
    admin.from("user_lecons").select("lecon_id"),
    admin.from("ebooks").select("id, title, clicks").order("clicks", { ascending: false }),
  ]);

  const totalUsers = profiles?.length ?? 0;
  const totalLecons = lecons?.length ?? 0;
  const totalCompletions = userLecons?.length ?? 0;

  // Utilisateurs par pays — top 8, le reste regroupé dans "Autres".
  const countryCounts = new Map<string, number>();
  for (const p of profiles ?? []) {
    const country = p.country?.trim() || "Non renseigné";
    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
  }
  const sortedCountries = [...countryCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topCountries = sortedCountries.slice(0, 8);
  const otherCountriesTotal = sortedCountries
    .slice(8)
    .reduce((sum, [, count]) => sum + count, 0);
  const byCountry = [
    ...topCountries.map(([label, value]) => ({ label, value })),
    ...(otherCountriesTotal > 0 ? [{ label: "Autres", value: otherCountriesTotal }] : []),
  ];

  // Leçons les plus jouées — nombre de complétions par leçon.
  const completionsByLecon = new Map<string, number>();
  for (const uc of userLecons ?? []) {
    completionsByLecon.set(uc.lecon_id, (completionsByLecon.get(uc.lecon_id) ?? 0) + 1);
  }
  const mostPlayed = (lecons ?? [])
    .map((l) => {
      const filiereName = Array.isArray(l.filieres)
        ? l.filieres[0]?.name
        : (l.filieres as { name: string } | null)?.name;
      return {
        label: filiereName ? `${filiereName} — ${l.title}` : l.title,
        value: completionsByLecon.get(l.id) ?? 0,
      };
    })
    .filter((l) => l.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Taux de progression moyen : proportion des leçons possibles (utilisateurs × leçons)
  // effectivement complétées. Chef Théo ne suit pas les tentatives ratées individuelles,
  // donc ce chiffre reflète la progression globale, pas un taux de bonnes réponses.
  const possibleCompletions = totalUsers * totalLecons;
  const avgCompletionRate =
    possibleCompletions > 0 ? (totalCompletions / possibleCompletions) * 100 : 0;

  const totalEbookClicks = (ebooks ?? []).reduce((sum, e) => sum + e.clicks, 0);
  const ebookClicks = (ebooks ?? []).map((e) => ({ label: e.title, value: e.clicks }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Analytics</h1>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatTile label="Utilisateurs inscrits" value={String(totalUsers)} />
        <StatTile
          label="Taux de progression moyen"
          value={`${avgCompletionRate.toFixed(0)}%`}
          hint="Part des leçons complétées sur l'ensemble des leçons possibles"
        />
        <StatTile label="Leçons complétées (total)" value={String(totalCompletions)} />
        <StatTile
          label="Clics « Obtenir » sur les ebooks"
          value={String(totalEbookClicks)}
          hint="Chariow ne renvoie pas encore les ventes confirmées à l'app"
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <BarChart title="Utilisateurs par pays" data={byCountry} />
        <BarChart
          title="Leçons les plus jouées"
          data={mostPlayed}
          emptyMessage="Aucune leçon complétée pour l'instant."
        />
        <BarChart
          title="Ebooks — clics sur « Obtenir »"
          data={ebookClicks}
          emptyMessage="Aucun ebook publié pour l'instant."
        />
      </div>
    </div>
  );
}
