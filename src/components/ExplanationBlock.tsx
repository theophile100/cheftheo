import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { buttonClasses } from "@/lib/button-styles";

const TRUNCATE_LENGTH = 60;

// La bonne reponse reste toujours visible (deja mise en evidence par
// l'exercice lui-meme) : seule l'explication detaillee est reservee a
// l'energie illimitee (admin ou achat actif), pour donner un aperçu sans
// jamais bloquer la comprehension de base.
export function ExplanationBlock({
  explanation,
  lastCorrect,
  hasFullAccess,
}: {
  explanation: string;
  lastCorrect: boolean;
  hasFullAccess: boolean;
}) {
  const colorClasses = lastCorrect
    ? "bg-green-50 dark:bg-green-900/30"
    : "bg-red-50 dark:bg-red-900/30";
  const textClasses = lastCorrect
    ? "text-green-700 dark:text-green-300"
    : "text-red-700 dark:text-red-300";

  if (hasFullAccess) {
    return (
      <div className={`mt-3 rounded-3xl p-4 ${colorClasses}`}>
        <p className={`text-sm font-medium ${textClasses}`}>{explanation}</p>
      </div>
    );
  }

  const truncated =
    explanation.length > TRUNCATE_LENGTH
      ? `${explanation.slice(0, TRUNCATE_LENGTH).trimEnd()}...`
      : explanation;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className={`rounded-3xl p-4 ${colorClasses}`}>
        <p className={`text-sm font-medium ${textClasses}`}>{truncated}</p>
      </div>
      <div className="flex items-center gap-3 rounded-3xl bg-orange-50 p-4 dark:bg-zinc-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-orange-500 dark:bg-zinc-900">
          <IconLock size={18} stroke={1.75} />
        </div>
        <p className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Débloquez les explications complètes avec l&apos;énergie illimitée.
        </p>
      </div>
      <Link href="/decouvrir" className={buttonClasses("secondary", "w-full")}>
        Découvrir
      </Link>
    </div>
  );
}
