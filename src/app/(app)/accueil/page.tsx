import { createClient } from "@/lib/supabase/server";
import { FiliereGrid } from "@/components/FiliereGrid";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import { getEncouragementMessage } from "@/lib/mascot-messages";

export default async function Accueil() {
  const supabase = await createClient();

  const [{ data: filieres }, { data: lecons }] = await Promise.all([
    supabase
      .from("filieres")
      .select("id, slug, name, icon, position")
      .order("position"),
    supabase.from("lecons").select("id, filiere_id"),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="flex items-center gap-3">
        <Mascot mood="idle" size={64} />
        <SpeechBubble>{getEncouragementMessage()}</SpeechBubble>
      </div>

      <h1 className="mt-8 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        Choisissez une filière
      </h1>

      <FiliereGrid filieres={filieres ?? []} lecons={lecons ?? []} />
    </main>
  );
}
