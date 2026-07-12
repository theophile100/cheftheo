import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, dirFor, type Locale } from "./config";
import { getDictionaryForLocale } from "./dictionaries";
import { createTranslator } from "./translate";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function getServerTranslation() {
  const locale = await getServerLocale();
  const dict = getDictionaryForLocale(locale);
  return { locale, dir: dirFor(locale), dict, t: createTranslator(dict) };
}
