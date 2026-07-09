"use client";

import { useEffect } from "react";
import { useSoundSettings } from "@/lib/sound-settings";
import { playTapSound } from "@/lib/sound";

const INTERACTIVE_SELECTOR = 'button:not(:disabled), a[href], [role="switch"]';

export function TapFeedback() {
  const { muted } = useSoundSettings();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const target = event.target as HTMLElement | null;
      const interactive = target?.closest(INTERACTIVE_SELECTOR);
      if (!interactive) return;
      if (interactive.closest('[data-tap-feedback="off"]')) return;

      if (!muted) playTapSound();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [muted]);

  return null;
}
