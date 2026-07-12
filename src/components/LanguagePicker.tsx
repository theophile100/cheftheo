import Link from "next/link";
import { IconLanguage } from "@tabler/icons-react";
import { COURSE_LANGUAGES } from "@/lib/course-languages";

export function LanguagePicker() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {COURSE_LANGUAGES.map((lang) => (
        <Link
          key={lang.code}
          href={`/filiere/langues/${lang.code}`}
          className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 transition-transform active:scale-[0.98] dark:bg-zinc-900"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-zinc-800 dark:text-orange-400">
            <IconLanguage size={28} stroke={1.75} />
          </div>
          <p className="flex-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {lang.label}
          </p>
        </Link>
      ))}
    </div>
  );
}
