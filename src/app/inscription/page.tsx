"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClasses } from "@/lib/button-styles";
import { Mascot } from "@/components/Mascot";
import { useTranslation } from "@/lib/i18n-context";
import { safeNextPath } from "@/lib/safe-next-path";
import { SocialSignInButtons } from "@/components/SocialSignInButtons";

const inputClasses =
  "rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-900 outline-none transition-colors focus:border-orange-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function Inscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off: signUp already returned an active session.
      router.push(next ?? "/accueil");
      router.refresh();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    const [confirmBefore, confirmAfter] = t("auth.signup.confirmMessage").split("{email}");
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-cream px-4 py-12 dark:bg-black">
        <Mascot mood="idle" size={80} />

        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {t("auth.signup.confirmTitle")}
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            {confirmBefore}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">{email}</span>
            {confirmAfter}
          </p>
          <Link
            href={next ? `/connexion?next=${encodeURIComponent(next)}` : "/connexion"}
            className={buttonClasses("primary", "mt-7 w-full")}
          >
            {t("auth.signup.confirmCta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-cream px-4 py-12 dark:bg-black">
      <Mascot mood="idle" size={80} />

      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {t("auth.signup.title")}
          </h1>

          <SocialSignInButtons next={next} />

          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {t("auth.orDivider")}
            </span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {t("auth.signup.emailLabel")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.signup.emailPlaceholder")}
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="displayName"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {t("auth.signup.displayNameLabel")}
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                maxLength={30}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("auth.signup.displayNamePlaceholder")}
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {t("auth.signup.passwordLabel")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.signup.passwordPlaceholder")}
                className={inputClasses}
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={buttonClasses("primary", "mt-2 w-full")}
            >
              {loading ? t("auth.signup.submitLoading") : t("auth.signup.submit")}
            </button>

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {t("auth.signup.haveAccount")}{" "}
              <Link
                href={next ? `/connexion?next=${encodeURIComponent(next)}` : "/connexion"}
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                {t("auth.signup.loginLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
