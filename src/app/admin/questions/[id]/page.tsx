import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { updateQuestion } from "@/app/admin/actions";
import type { Question } from "@/lib/types";

export default async function EditQuestion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: question } = await supabase
    .from("questions")
    .select(
      "id, lecon_id, type, prompt, explanation, position, image_url, data, lecons(title)",
    )
    .eq("id", id)
    .single();

  if (!question) notFound();

  const leconTitle = Array.isArray(question.lecons)
    ? question.lecons[0]?.title
    : (question.lecons as { title: string } | null)?.title;

  return (
    <div className="mx-auto max-w-xl">
      <AdminBackLink href={`/admin/lecons/${question.lecon_id}`} />
      <p className="text-sm text-zinc-400">{leconTitle}</p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Modifier la question
      </h1>

      <div className="mt-6">
        <QuestionForm
          leconId={question.lecon_id}
          initialQuestion={question as unknown as Question & { position: number }}
          onSubmit={updateQuestion.bind(null, id)}
        />
      </div>
    </div>
  );
}
