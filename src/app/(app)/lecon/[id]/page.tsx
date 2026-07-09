import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeconRunner } from "@/components/LeconRunner";
import type { Question } from "@/lib/types";

export default async function Lecon({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lecon } = await supabase
    .from("lecons")
    .select("id, filiere_id, filieres(slug)")
    .eq("id", id)
    .single();

  if (!lecon) {
    notFound();
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, prompt, explanation, image_url, data")
    .eq("lecon_id", id)
    .order("position");

  if (!questions || questions.length === 0) {
    notFound();
  }

  const filiereRelation = lecon.filieres as { slug: string } | { slug: string }[];
  const slug = Array.isArray(filiereRelation)
    ? filiereRelation[0]?.slug
    : filiereRelation?.slug;

  return (
    <LeconRunner
      leconId={lecon.id}
      filiereSlug={slug ?? ""}
      questions={questions as Question[]}
    />
  );
}
