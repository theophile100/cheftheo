import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/accueil");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-bold text-zinc-900 dark:text-zinc-50">
            Chef Théo — Admin
          </Link>
          <Link
            href="/accueil"
            className="text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            Retour à l&apos;app
          </Link>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-5 px-6 pb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <Link href="/admin" className="hover:text-orange-500">
            Filières &amp; leçons
          </Link>
          <Link href="/admin/parametres" className="hover:text-orange-500">
            Apparence
          </Link>
          <Link href="/admin/produits" className="hover:text-orange-500">
            Découvrir
          </Link>
          <Link href="/admin/analytics" className="hover:text-orange-500">
            Analytics
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
