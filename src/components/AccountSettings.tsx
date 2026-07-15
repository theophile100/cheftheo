"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress-context";
import { useSoundSettings } from "@/lib/sound-settings";
import { useTranslation } from "@/lib/i18n-context";
import { LanguageSelector } from "@/components/LanguageSelector";

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-orange-500" : "bg-zinc-200 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function AccountSettings() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useProgress();
  const { soundEnabled, vibrationEnabled, toggleSound, toggleVibration } =
    useSoundSettings();
  const { t } = useTranslation();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      {isAdmin && (
        <Link
          href="/admin"
          className="mb-1 block rounded-2xl px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("sideMenu.admin")}
        </Link>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between rounded-2xl px-3 py-2.5">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {t("sideMenu.darkMode")}
          </span>
          <Switch
            on={theme === "dark"}
            onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </div>
        <div className="flex items-center justify-between rounded-2xl px-3 py-2.5">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {t("sideMenu.sound")}
          </span>
          <Switch on={soundEnabled} onToggle={toggleSound} />
        </div>
        <div className="flex items-center justify-between rounded-2xl px-3 py-2.5">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {t("sideMenu.vibrations")}
          </span>
          <Switch on={vibrationEnabled} onToggle={toggleVibration} />
        </div>
        <LanguageSelector />
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-3 w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        {t("sideMenu.signOut")}
      </button>
    </div>
  );
}
