import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { createQuestion } from "@/app/admin/actions";

export default async function NewQuestion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lecon } = await supabase
    .from("lecons")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!lecon) notFound();

  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("lecon_id", id);

  return (
    <div className="mx-auto max-w-xl">
      <AdminBackLink href={`/admin/lecons/${id}`} />
      <p className="text-sm text-zinc-400">{lecon.title}</p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Nouvelle question
      </h1>

      <div className="mt-6">
        <QuestionForm
          leconId={id}
          defaultPosition={(count ?? 0) + 1}
          onSubmit={createQuestion}
        />
      </div>
    </div>
  );
}
