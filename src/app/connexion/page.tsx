"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClasses } from "@/lib/button-styles";
import { Mascot } from "@/components/Mascot";
import { useTranslation } from "@/lib/i18n-context";

const inputClasses =
  "rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-900 outline-none transition-colors focus:border-orange-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function Connexion() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/accueil");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-cream px-4 py-12 dark:bg-black">
      <Mascot mood="idle" size={80} />

      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {t("auth.login.title")}
          </h1>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {t("auth.login.emailLabel")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPlaceholder")}
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {t("auth.login.passwordLabel")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.login.passwordPlaceholder")}
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
              {loading ? t("auth.login.submitLoading") : t("auth.login.submit")}
            </button>

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {t("auth.login.noAccount")}{" "}
              <Link
                href="/inscription"
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                {t("auth.login.signupLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
