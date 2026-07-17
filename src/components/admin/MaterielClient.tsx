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
  categorie: string | null;
  sous_groupe: string | null;
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

  const ungrouped = activeItems.filter((i) => !i.categorie);

  // Ordre de premiere apparition (les items arrivent deja tries par
  // position, donc l'ordre d'iteration reflete l'ordre voulu des groupes).
  const categories: { name: string; sousGroupes: { name: string | null; items: MaterielItem[] }[] }[] = [];
  for (const item of activeItems) {
    if (!item.categorie) continue;
    let categorie = categories.find((c) => c.name === item.categorie);
    if (!categorie) {
      categorie = { name: item.categorie, sousGroupes: [] };
      categories.push(categorie);
    }
    let sousGroupe = categorie.sousGroupes.find((sg) => sg.name === item.sous_groupe);
    if (!sousGroupe) {
      sousGroupe = { name: item.sous_groupe, items: [] };
      categorie.sousGroupes.push(sousGroupe);
    }
    sousGroupe.items.push(item);
  }

  function renderItemCard(item: MaterielItem) {
    return (
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
    );
  }

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

      {ungrouped.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ungrouped.map((item) => renderItemCard(item))}
        </div>
      )}

      {categories.map((categorie) => (
        <div key={categorie.name} className="mt-8">
          <h2 className="rounded-2xl bg-gradient-to-r from-orange-50 to-cream px-4 py-2.5 text-lg font-extrabold text-zinc-900 dark:from-zinc-900 dark:to-zinc-900 dark:text-zinc-50">
            {categorie.name}
          </h2>
          {categorie.sousGroupes.map((sousGroupe) => (
            <div key={sousGroupe.name ?? "__none__"} className="mt-4">
              {sousGroupe.name && (
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                  {sousGroupe.name}
                </h3>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sousGroupe.items.map((item) => renderItemCard(item))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
