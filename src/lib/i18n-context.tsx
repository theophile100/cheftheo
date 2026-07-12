"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/i18n/config";
import { dirFor } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { createTranslator, type Translate } from "@/i18n/translate";

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, dir: dirFor(locale), t: createTranslator(dict) }),
    [locale, dict],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
