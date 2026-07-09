import { createClient } from "@/lib/supabase/server";
import { AcademyToggle } from "@/components/AcademyToggle";
import { EbookTile } from "@/components/EbookTile";
import { Mascot } from "@/components/Mascot";

export default async function Decouvrir() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: ebooks }, { data: profile }] = await Promise.all([
    supabase
      .from("ebooks")
      .select("id, title, price, cover_url")
      .order("position"),
    supabase.from("profiles").select("country").eq("id", user!.id).single(),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <AcademyToggle active="decouvrir" />

      <h1 className="mt-8 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        À découvrir
      </h1>

      {ebooks && ebooks.length > 0 ? (
        <div className="mt-6 columns-2 gap-3">
          {ebooks.map((ebook) => (
            <EbookTile key={ebook.id} ebook={ebook} country={profile?.country ?? null} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <Mascot mood="idle" size={72} />
          <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
            Rien à découvrir pour l&apos;instant. Revenez bientôt, de
            nouvelles ressources arrivent !
          </p>
        </div>
      )}
    </main>
  );
}
