import Link from "next/link";
import { FiliereIcon } from "@/components/FiliereIcon";

interface Filiere {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
  position: number;
}

export function FiliereGrid({ filieres }: { filieres: Filiere[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filieres.map((filiere) => (
        <Link
          key={filiere.id}
          href={`/filiere/${filiere.slug}`}
          className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
            <FiliereIcon slug={filiere.slug} iconUrl={filiere.icon_url} size={30} />
          </div>
          <p className="flex-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {filiere.name}
          </p>
        </Link>
      ))}
    </div>
  );
}
