"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress-context";
import { useSoundSettings } from "@/lib/sound-settings";

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

export function SideMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { email, xpTotal, currentStreak, isAdmin } = useProgress();
  const { muted, toggleMuted } = useSoundSettings();

  if (!open) return null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 z-40 flex h-full w-72 animate-slide-in-right flex-col rounded-l-3xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {email}
          </p>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-2xl bg-amber-50 p-3 text-center dark:bg-zinc-800">
            <p className="text-lg font-bold text-orange-500">{xpTotal}</p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">XP</p>
          </div>
          <div className="flex-1 rounded-2xl bg-amber-50 p-3 text-center dark:bg-zinc-800">
            <p className="text-lg font-bold text-orange-500">{currentStreak}</p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Série</p>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          <Link
            href="/accueil"
            onClick={onClose}
            className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Accueil
          </Link>
          <Link
            href="/profil"
            onClick={onClose}
            className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Profil
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Admin
            </Link>
          )}
        </nav>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Réglages
        </p>
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center justify-between rounded-2xl px-3 py-2.5">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Mode sombre
            </span>
            <Switch
              on={theme === "dark"}
              onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl px-3 py-2.5">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Son
            </span>
            <Switch on={!muted} onToggle={toggleMuted} />
          </div>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Déconnexion
        </button>
      </div>
    </>
  );
}
