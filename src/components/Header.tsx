"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress-context";
import { SideMenu } from "@/components/SideMenu";
import { EnergyDisplay } from "@/components/EnergyDisplay";
import { StatPanel } from "@/components/StatPanel";
import { StreakPanel } from "@/components/StreakPanel";
import { XpPanel } from "@/components/XpPanel";
import { EnergyPanel } from "@/components/EnergyPanel";

type PanelName = "streak" | "xp" | "energy" | null;

export function Header() {
  const { currentStreak, xpTotal, energy, energyUpdatedAt, completions } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelName>(null);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3 md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePanel("streak")}
              className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
            >
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
            </button>

            <button
              type="button"
              onClick={() => setActivePanel("xp")}
              className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-orange-500"
              >
                <path d="M12 2l2.8 6.2L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.2-.8z" />
              </svg>
              <span className="font-bold text-zinc-900 dark:text-zinc-50">
                {xpTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePanel("energy")}
              className="rounded-full px-1.5 py-0.5 transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              <EnergyDisplay />
            </button>
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

      {activePanel === "streak" && (
        <StatPanel title="Série" onClose={() => setActivePanel(null)}>
          <StreakPanel currentStreak={currentStreak} completions={completions} />
        </StatPanel>
      )}
      {activePanel === "xp" && (
        <StatPanel title="XP" onClose={() => setActivePanel(null)}>
          <XpPanel xpTotal={xpTotal} completions={completions} />
        </StatPanel>
      )}
      {activePanel === "energy" && (
        <StatPanel title="Énergie" onClose={() => setActivePanel(null)}>
          <EnergyPanel
            energy={energy}
            energyUpdatedAt={energyUpdatedAt}
            onNavigate={() => setActivePanel(null)}
          />
        </StatPanel>
      )}
    </>
  );
}
