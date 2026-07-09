import Link from "next/link";

export function AcademyToggle({ active }: { active: "academy" | "decouvrir" }) {
  const base =
    "flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition-colors";
  const activeClasses = "bg-white text-orange-500 shadow-sm dark:bg-zinc-900";
  const inactiveClasses =
    "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200";

  return (
    <div className="mx-auto flex w-full max-w-xs rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800">
      <Link
        href="/accueil"
        className={`${base} ${active === "academy" ? activeClasses : inactiveClasses}`}
      >
        Academy
      </Link>
      <Link
        href="/decouvrir"
        className={`${base} ${active === "decouvrir" ? activeClasses : inactiveClasses}`}
      >
        Découvrir
      </Link>
    </div>
  );
}
