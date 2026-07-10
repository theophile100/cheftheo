"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Installation echouee (ex: navigateur sans support) : l'app reste
      // utilisable normalement, juste sans les benefices hors-ligne/PWA.
    });
  }, []);

  return null;
}
