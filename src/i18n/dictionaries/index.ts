import fr from "./fr.json";
import en from "./en.json";
import de from "./de.json";
import type { Locale } from "../config";

// Le francais est la reference : sa forme (les cles) fait foi pour le
// typage. Les autres fichiers n'ont besoin de contenir QUE ce qui a deja
// ete traduit — toute cle absente ou vide retombe automatiquement sur le
// francais (voir deepMerge), donc jamais de texte vide a l'ecran.
export type Dictionary = typeof fr;

const RAW: Record<Locale, unknown> = { fr, en, de };

function deepMerge<T>(base: T, override: unknown): T {
  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return (typeof override === "string" && override.length > 0 ? override : base) as T;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  const overrideObj = (override && typeof override === "object" ? override : {}) as Record<
    string,
    unknown
  >;
  for (const key of Object.keys(result)) {
    result[key] = deepMerge((base as Record<string, unknown>)[key], overrideObj[key]);
  }
  return result as T;
}

export function getDictionaryForLocale(locale: Locale): Dictionary {
  return deepMerge(fr, RAW[locale]);
}
