"use client";

import { useEffect } from "react";
import { useSoundSettings } from "@/lib/sound-settings";
import { playTapSound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";

const INTERACTIVE_SELECTOR = 'button:not(:disabled), a[href], [role="switch"]';

export function TapFeedback() {
  const { soundEnabled, vibrationEnabled } = useSoundSettings();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const target = event.target as HTMLElement | null;
      const interactive = target?.closest(INTERACTIVE_SELECTOR);
      if (!interactive) return;
      if (interactive.closest('[data-tap-feedback="off"]')) return;

      if (soundEnabled) playTapSound();
      if (vibrationEnabled) triggerHaptic("tap");
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [soundEnabled, vibrationEnabled]);

  return null;
}
