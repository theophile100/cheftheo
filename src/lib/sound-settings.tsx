"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SOUND_KEY = "cheftheo:sound-enabled";
const VIBRATION_KEY = "cheftheo:vibration-enabled";

interface SoundSettingsValue {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
}

const SoundSettingsContext = createContext<SoundSettingsValue | null>(null);

export function SoundSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the server
    // and first client render agree on "enabled", avoiding a hydration
    // mismatch — same tradeoff next-themes makes for the theme class.
    const storedSound = window.localStorage.getItem(SOUND_KEY);
    const storedVibration = window.localStorage.getItem(VIBRATION_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedSound === "false") setSoundEnabled(false);
    if (storedVibration === "false") setVibrationEnabled(false);
  }, []);

  function toggleSound() {
    setSoundEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(SOUND_KEY, String(next));
      return next;
    });
  }

  function toggleVibration() {
    setVibrationEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(VIBRATION_KEY, String(next));
      return next;
    });
  }

  return (
    <SoundSettingsContext.Provider
      value={{ soundEnabled, vibrationEnabled, toggleSound, toggleVibration }}
    >
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
