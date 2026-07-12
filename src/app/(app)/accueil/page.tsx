import { createClient } from "@/lib/supabase/server";
import { FiliereGrid } from "@/components/FiliereGrid";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import { getEncouragementMessage } from "@/lib/mascot-messages";
import { getServerTranslation } from "@/i18n/server";

export default async function Accueil() {
  const supabase = await createClient();
  const { t } = await getServerTranslation();

  const { data: filieres } = await supabase
    .from("filieres")
    .select("id, slug, name, icon_url, position")
    .order("position");

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-2xl lg:max-w-4xl">
      <div className="flex items-center gap-3">
        <Mascot mood="idle" size={64} />
        <SpeechBubble>{getEncouragementMessage()}</SpeechBubble>
      </div>

      <h1 className="mt-8 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        {t("accueil.chooseFiliere")}
      </h1>

      <FiliereGrid filieres={filieres ?? []} />
    </main>
  );
}
