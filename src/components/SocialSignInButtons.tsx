"use client";

import { useState } from "react";
import { IconBrandGoogleFilled, IconBrandApple } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n-context";

type Provider = "google" | "apple";

// Boutons de connexion sociale, partages entre inscription et connexion :
// Supabase traite les deux de la meme facon (signInWithOAuth redirige vers
// le fournisseur, puis /auth/callback termine la connexion), donc un compte
// existant se reconnecte simplement avec le meme bouton.
export function SocialSignInButtons({ next }: { next: string | null }) {
  const { t } = useTranslation();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(provider: Provider) {
    setError(null);
    setLoadingProvider(provider);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoadingProvider(null);
    }
    // Sinon le navigateur est en train d'etre redirige vers le fournisseur.
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={() => handleClick("google")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-base font-bold text-zinc-900 shadow-[0_4px_0_0_#e4e4e7] transition-all duration-100 ease-out active:translate-y-1 active:shadow-[0_1px_0_0_#e4e4e7] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-[0_4px_0_0_#3f3f46] dark:active:shadow-[0_1px_0_0_#3f3f46]"
      >
        <IconBrandGoogleFilled size={20} className="text-[#4285F4]" />
        {t("auth.continueWithGoogle")}
      </button>

      <button
        type="button"
        onClick={() => handleClick("apple")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-6 py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#000000] transition-all duration-100 ease-out active:translate-y-1 active:shadow-[0_1px_0_0_#000000] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 dark:bg-zinc-50 dark:text-zinc-900 dark:shadow-[0_4px_0_0_#a1a1aa]"
      >
        <IconBrandApple size={20} />
        {t("auth.continueWithApple")}
      </button>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
