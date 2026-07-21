import { createClient } from "@/lib/supabase/server";
import { FiliereGrid } from "@/components/FiliereGrid";
import { DueReviewCard } from "@/components/DueReviewCard";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import { getEncouragementMessage } from "@/lib/mascot-messages";
import { getServerTranslation } from "@/i18n/server";
import { NiveauOnboarding } from "@/components/NiveauOnboarding";
import { NiveauUtilisateurBadge } from "@/components/NiveauUtilisateurBadge";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export default async function Accueil() {
  const supabase = await createClient();
  const { t } = await getServerTranslation();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: filieres }, { count: dueCount }, { data: profile }] = await Promise.all([
    supabase.from("filieres").select("id, slug, name, icon_url, position").order("position"),
    user
      ? supabase
          .from("question_reviews")
          .select("question_id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .lte("next_review_date", new Date().toISOString().slice(0, 10))
      : Promise.resolve({ count: 0 }),
    user
      ? supabase.from("profiles").select("niveau_utilisateur").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  // A l'entree du jeu, un compte qui n'a encore jamais choisi de niveau
  // passe par l'onboarding avant de voir la liste des filieres.
  if (user && !profile?.niveau_utilisateur) {
    return (
      <main className="mx-auto max-w-md px-0 py-4 md:max-w-2xl lg:max-w-4xl">
        <NiveauOnboarding />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-2xl lg:max-w-4xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mascot mood="idle" size={64} />
          <SpeechBubble>{getEncouragementMessage()}</SpeechBubble>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          {user && <NiveauUtilisateurBadge />}
        </div>
      </div>

      <DueReviewCard count={dueCount ?? 0} />

      <h1 className="mt-8 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        {t("accueil.chooseFiliere")}
      </h1>

      <FiliereGrid filieres={filieres ?? []} />
    </main>
  );
}
