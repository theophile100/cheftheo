"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACTIVE_LOCALES, LOCALE_COOKIE, isLocale } from "./config";

export async function setLocale(locale: string): Promise<{ error?: string }> {
  if (!isLocale(locale) || !ACTIVE_LOCALES.includes(locale)) {
    return { error: "Cette langue n'est pas encore disponible." };
  }

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return {};
}
