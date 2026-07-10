import { Mascot } from "@/components/Mascot";

export default function HorsLigne() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-cream px-6 py-12 text-center dark:bg-black">
      <Mascot mood="incorrect" size={96} />
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        Vous êtes hors ligne
      </h1>
      <p className="max-w-xs text-base text-zinc-600 dark:text-zinc-400">
        Reconnectez-vous à Internet pour continuer à utiliser Chef Théo.
      </p>
    </div>
  );
}
