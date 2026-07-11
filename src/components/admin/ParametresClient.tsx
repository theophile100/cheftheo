"use client";

import { useState } from "react";
import { updateLogo, updateFiliereIcon } from "@/app/admin/actions";
import { FiliereIcon } from "@/components/FiliereIcon";
import { ImageSlot } from "@/components/admin/ImageSlot";

interface Filiere {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
}

export function LogoSection({ initialLogoUrl }: { initialLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Logo de l&apos;application</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Ce logo s&apos;affiche sur l&apos;accueil, la connexion et partout où la mascotte
        apparaît. Sans image, le logo par défaut est utilisé.
      </p>
      <div className="mt-4">
        <ImageSlot
          value={logoUrl}
          onSave={async (url) => {
            const result = await updateLogo(url);
            if (!result.error) setLogoUrl(url);
            return result;
          }}
          boxSize={72}
          placeholder={<span className="text-xs text-zinc-400">Défaut</span>}
        />
      </div>
    </div>
  );
}

export function FiliereIconsSection({ filieres }: { filieres: Filiere[] }) {
  const [icons, setIcons] = useState<Record<string, string | null>>(
    Object.fromEntries(filieres.map((f) => [f.id, f.icon_url])),
  );

  return (
    <div className="mt-6 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Icônes des filières</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Chaque filière a une icône moderne par défaut. Vous pouvez la remplacer par votre
        propre image, ou revenir à l&apos;icône par défaut à tout moment.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {filieres.map((filiere) => (
          <div key={filiere.id} className="flex items-center gap-4 border-t border-zinc-100 pt-5 first:border-t-0 first:pt-0 dark:border-zinc-800">
            <div className="flex-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{filiere.name}</p>
              <p className="text-xs text-zinc-400">
                {icons[filiere.id] ? "Image personnalisée" : "Icône par défaut"}
              </p>
            </div>
            <ImageSlot
              value={icons[filiere.id]}
              onSave={async (url) => {
                const result = await updateFiliereIcon(filiere.id, url);
                if (!result.error) {
                  setIcons((prev) => ({ ...prev, [filiere.id]: url }));
                }
                return result;
              }}
              boxSize={56}
              placeholder={<FiliereIcon slug={filiere.slug} iconUrl={null} size={28} />}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
