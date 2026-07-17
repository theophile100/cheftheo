import { createClient } from "@/lib/supabase/server";
import { FiliereGrid } from "@/components/FiliereGrid";
import { DueReviewCard } from "@/components/DueReviewCard";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import { getEncouragementMessage } from "@/lib/mascot-messages";
import { getServerTranslation } from "@/i18n/server";

export default async function Accueil() {
  const supabase = await createClient();
  const { t } = await getServerTranslation();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: filieres }, { count: dueCount }] = await Promise.all([
    supabase.from("filieres").select("id, slug, name, icon_url, position").order("position"),
    supabase
      .from("question_reviews")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .lte("next_review_date", new Date().toISOString().slice(0, 10)),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-2xl lg:max-w-4xl">
      <div className="flex items-center gap-3">
        <Mascot mood="idle" size={64} />
        <SpeechBubble>{getEncouragementMessage()}</SpeechBubble>
      </div>

      <DueReviewCard count={dueCount ?? 0} />

      <h1 className="mt-8 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        {t("accueil.chooseFiliere")}
      </h1>

      <FiliereGrid filieres={filieres ?? []} />
    </main>
  );
}
