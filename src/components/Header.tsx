"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress-context";
import { SideMenu } from "@/components/SideMenu";

export function Header() {
  const { currentStreak, xpTotal } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-orange-500"
              >
                <path d="M12 2c1 3-2 4-2 7a2 2 0 1 0 4 0c1.5 1 3 3.5 3 6a7 7 0 1 1-14 0c0-4 3-5 4-9 .5 2 1 3 2 3 0-3-1-5 3-7z" />
              </svg>
              <span className="font-bold text-zinc-900 dark:text-zinc-50">
                {currentStreak}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-orange-500"
              >
                <path d="M12 2l2.8 6.2L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.2-.8z" />
              </svg>
              <span className="font-bold text-zinc-900 dark:text-zinc-50">
                {xpTotal} XP
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
