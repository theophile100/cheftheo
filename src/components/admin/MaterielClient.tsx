"use client";

import { useState } from "react";
import { IconPhoto } from "@tabler/icons-react";
import { updateMaterielImage } from "@/app/admin/actions";
import { ImageSlot } from "@/components/admin/ImageSlot";
import { FiliereIcon } from "@/components/FiliereIcon";

interface Filiere {
  id: string;
  slug: string;
  name: string;
}

interface MaterielItem {
  id: string;
  filiere_id: string;
  name: string;
  position: number;
  image_url: string | null;
}

export function MaterielClient({
  filieres,
  items,
}: {
  filieres: Filiere[];
  items: MaterielItem[];
}) {
  const defaultFiliere = filieres.find((f) => f.slug === "service") ?? filieres[0];
  const [activeFiliereId, setActiveFiliereId] = useState(defaultFiliere?.id ?? "");
  const [imagesByItem, setImagesByItem] = useState<Record<string, string | null>>(
    Object.fromEntries(items.map((i) => [i.id, i.image_url])),
  );

  const activeItems = items
    .filter((i) => i.filiere_id === activeFiliereId)
    .sort((a, b) => a.position - b.position);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filieres.map((f) => {
          const itemsForFiliere = items.filter((i) => i.filiere_id === f.id);
          const filled = itemsForFiliere.filter((i) => imagesByItem[i.id]).length;
          const isActive = f.id === activeFiliereId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFiliereId(f.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "bg-white text-zinc-600 hover:bg-orange-50 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              <FiliereIcon slug={f.slug} iconUrl={null} size={18} />
              {f.name}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  isActive
                    ? "bg-white/20"
                    : "bg-orange-100 text-orange-600 dark:bg-zinc-800 dark:text-orange-400"
                }`}
              >
                {filled}/{itemsForFiliere.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
          >
            <p className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</p>
            <ImageSlot
              value={imagesByItem[item.id] ?? null}
              bucket="materiel"
              boxSize={64}
              placeholder={<IconPhoto size={26} stroke={1.5} />}
              onSave={async (url) => {
                const result = await updateMaterielImage(item.id, url);
                if (!result.error) {
                  setImagesByItem((prev) => ({ ...prev, [item.id]: url }));
                }
                return result;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
