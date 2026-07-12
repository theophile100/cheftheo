import type { Dictionary } from "./dictionaries";

function getPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      obj,
    );
}

export type Translate = (key: string, params?: Record<string, string | number>) => string;

export function createTranslator(dict: Dictionary): Translate {
  return function t(key, params) {
    const value = getPath(dict, key);
    if (typeof value !== "string") {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] Clé de traduction manquante : ${key}`);
      }
      return key;
    }
    if (!params) return value;
    return value.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  };
}
