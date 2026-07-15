"use client";

import { useProgress } from "@/lib/progress-context";
import { AvatarUpload } from "@/components/AvatarUpload";

// Pas de champ "identifiant" separe en base : le @handle est derive du
// pseudo (accents/espaces retires), pour rester coherent si le pseudo
// change plutot que de desynchroniser un deuxieme champ a maintenir.
function toHandle(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return "@" + (normalized || "utilisateur");
}

export function ProfileIdentity({ initialAvatarUrl }: { initialAvatarUrl: string | null }) {
  const { displayName } = useProgress();

  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarUpload initialUrl={initialAvatarUrl} />
      <div className="text-center">
        <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {displayName}
        </p>
        <p className="text-sm font-medium text-zinc-400">{toHandle(displayName)}</p>
      </div>
    </div>
  );
}
