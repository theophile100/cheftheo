export const LOCALES = ["fr", "en", "de", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

// Langues pas encore traduites (dictionnaire vide) : affichees dans le
// selecteur mais desactivees, pour ne jamais montrer une interface a moitie
// traduite a un utilisateur.
export const ACTIVE_LOCALES: Locale[] = ["fr", "en"];

export const RTL_LOCALES: Locale[] = ["ar"];

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
  ar: "العربية",
};

export const LOCALE_COOKIE = "chef-theo-locale";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
