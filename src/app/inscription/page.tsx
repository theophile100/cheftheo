"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { countries } from "@/data/countries";
import { buttonClasses } from "@/lib/button-styles";
import { Mascot } from "@/components/Mascot";

const inputClasses =
  "rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-900 outline-none transition-colors focus:border-orange-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function Inscription() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
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
      options: { data: { country, phone } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off: signUp already returned an active session.
      router.push("/accueil");
      router.refresh();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-amber-50 px-4 py-12 dark:bg-black">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
          <Mascot mood="idle" size={80} className="mx-auto" />
          <h1 className="mt-6 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Vérifiez vos emails
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Nous avons envoyé un lien de confirmation à{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {email}
            </span>
            . Cliquez dessus pour activer votre compte, puis connectez-vous.
          </p>
          <Link
            href="/connexion"
            className={buttonClasses("primary", "mt-7 w-full")}
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-amber-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-6">
          <Mascot mood="idle" size={80} />

          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Créer un compte
          </h1>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="pays"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pays
              </label>
              <select
                id="pays"
                name="pays"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClasses}
              >
                <option value="" disabled>
                  Sélectionnez votre pays
                </option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="telephone"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Numéro de téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
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
              {loading ? "Création en cours..." : "Continuer"}
            </button>

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Déjà un compte ?{" "}
              <Link
                href="/connexion"
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
