import { createClient } from "@/lib/supabase/server";
import { RevisionRunner } from "@/components/RevisionRunner";
import { BackButton } from "@/components/BackButton";
import { Mascot } from "@/components/Mascot";
import { randomSeed } from "@/lib/shuffle";
import type { Question } from "@/lib/types";

export default async function Revision() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: dueReviews } = await supabase
    .from("question_reviews")
    .select("question_id")
    .eq("user_id", user!.id)
    .lte("next_review_date", new Date().toISOString().slice(0, 10));

  const dueIds = (dueReviews ?? []).map((r) => r.question_id);

  const { data: questions } = dueIds.length
    ? await supabase
        .from("questions")
        .select("id, type, prompt, explanation, image_url, data")
        .in("id", dueIds)
    : { data: [] };

  if (!questions || questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-125px)] max-w-md flex-col px-6 py-6 md:max-w-xl lg:max-w-2xl">
        <BackButton href="/accueil" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Mascot mood="celebrate" size={90} />
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Rien à réviser aujourd&apos;hui
          </h1>
          <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
            Continuez à apprendre de nouvelles leçons — elles reviendront ici au bon moment
            pour que vous les reteniez durablement.
          </p>
        </div>
      </main>
    );
  }

  const sessionSeed = randomSeed();

  return <RevisionRunner questions={questions as Question[]} sessionSeed={sessionSeed} />;
}
