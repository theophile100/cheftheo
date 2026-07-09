"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "cheftheo:sound-muted";

interface SoundSettingsValue {
  muted: boolean;
  toggleMuted: () => void;
}

const SoundSettingsContext = createContext<SoundSettingsValue | null>(null);

export function SoundSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the server
    // and first client render agree on "unmuted", avoiding a hydration
    // mismatch — same tradeoff next-themes makes for the theme class.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "true") setMuted(true);
  }, []);

  function toggleMuted() {
    setMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <SoundSettingsContext.Provider value={{ muted, toggleMuted }}>
      {children}
    </SoundSettingsContext.Provider>
  );
}

export function useSoundSettings() {
  const ctx = useContext(SoundSettingsContext);
  if (!ctx) {
    throw new Error("useSoundSettings must be used within a SoundSettingsProvider");
  }
  return ctx;
}
