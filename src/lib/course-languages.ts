// Langues proposees dans le parcours "Langues" (vocabulaire metier de
// l'hotellerie-restauration) — distinct de src/i18n (langue de l'interface).
export const COURSE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
] as const;

export type CourseLanguageCode = (typeof COURSE_LANGUAGES)[number]["code"];

export function isCourseLanguageCode(value: string): value is CourseLanguageCode {
  return COURSE_LANGUAGES.some((l) => l.code === value);
}

export function courseLanguageLabel(code: string): string {
  return COURSE_LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
