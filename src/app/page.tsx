import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-amber-50 px-4 py-12 dark:bg-black">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image src="/logo.svg" alt="Chef Théo" width={88} height={88} priority />
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Chef Théo
        </h1>
        <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
          Apprenez les métiers de l&apos;hôtellerie et de la restauration,
          leçon par leçon.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/inscription"
          className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Créer un compte
        </Link>
        <Link
          href="/connexion"
          className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base font-semibold text-zinc-900 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
