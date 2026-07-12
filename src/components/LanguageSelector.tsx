"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { LOCALES, ACTIVE_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import { useTranslation } from "@/lib/i18n-context";

export function LanguageSelector() {
  const router = useRouter();
  const { locale, t } = useTranslation();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSelect(next: Locale) {
    if (next === locale) return;
    setError(null);
    startTransition(async () => {
      const result = await setLocale(next);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl px-3 py-2.5">
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {t("sideMenu.language")}
      </span>
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((code) => {
          const isActive = ACTIVE_LOCALES.includes(code);
          const isSelected = code === locale;
          return (
            <button
              key={code}
              type="button"
              disabled={!isActive || pending}
              onClick={() => handleSelect(code)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isSelected
                  ? "bg-orange-500 text-white"
                  : isActive
                    ? "bg-zinc-100 text-zinc-700 hover:bg-orange-100 dark:bg-zinc-800 dark:text-zinc-200"
                    : "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              } disabled:cursor-not-allowed`}
            >
              {isSelected && <IconCheck size={13} stroke={3} />}
              {LOCALE_LABELS[code]}
              {!isActive && (
                <span className="text-[10px] font-medium opacity-70">· bientôt</span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
