import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeconTree } from "@/components/LeconTree";
import { BackButton } from "@/components/BackButton";
import { Mascot } from "@/components/Mascot";
import { isCourseLanguageCode, courseLanguageLabel } from "@/lib/course-languages";

export default async function LangueParcours({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;

  if (!isCourseLanguageCode(langue)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: filiere } = await supabase
    .from("filieres")
    .select("id, slug")
    .eq("slug", "langues")
    .single();

  if (!filiere) {
    notFound();
  }

  const [{ data: lecons }, { data: unites }] = await Promise.all([
    supabase
      .from("lecons")
      .select("id, title, position, unite_id")
      .eq("filiere_id", filiere.id)
      .eq("langue_code", langue)
      .order("position"),
    supabase
      .from("unites")
      .select("id, title, position")
      .eq("filiere_id", filiere.id)
      .eq("langue_code", langue)
      .order("position"),
  ]);

  const hasLecons = (lecons?.length ?? 0) > 0;

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-2xl lg:max-w-4xl">
      <BackButton href="/filiere/langues" />

      <div className="mt-2 flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {courseLanguageLabel(langue)}
        </h1>
      </div>

      {hasLecons ? (
        <LeconTree lecons={lecons ?? []} unites={unites ?? []} filiereSlug="langues" />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Mascot mood="idle" size={80} />
          <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
            Contenu à venir pour cette langue. Revenez bientôt !
          </p>
        </div>
      )}
    </main>
  );
}
