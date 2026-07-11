"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress-context";
import { FiliereWatermark } from "@/components/FiliereWatermark";
import {
  IconCheck,
  IconLockFilled,
  IconTrophyFilled,
  IconChefHatFilled,
  IconCake,
  IconGlassFullFilled,
  IconBellRingingFilled,
  IconKeyFilled,
  type Icon,
} from "@tabler/icons-react";

// Icone du bouton de leçon active : un objet propre à chaque filière plutôt
// qu'un simple triangle "lecture", pour que le parcours reste identifiable
// comme le nôtre et pas un simple habillage d'un autre gabarit d'app.
const ACTIVE_LESSON_ICONS: Record<string, Icon> = {
  cuisine: IconChefHatFilled,
  patisserie: IconCake,
  "bar-et-vins": IconGlassFullFilled,
  service: IconBellRingingFilled,
  hotellerie: IconKeyFilled,
};

interface Unite {
  id: string;
  title: string;
  position: number;
}

interface Lecon {
  id: string;
  title: string;
  position: number;
  unite_id?: string | null;
}

const NODE_SIZE = 80;
const V_GAP = 112;
const AMPLITUDE = 60;
const WIDTH = AMPLITUDE * 2 + NODE_SIZE;
// Rough estimates used only to size the watermark layer — a pixel or two of
// imprecision here just makes the pattern very slightly more/less dense,
// never affects real layout.
const UNITE_HEADER_HEIGHT = 76;
const UNIT_END_MARKER_HEIGHT = 80;
const GROUP_GAP = 32;
const OUTER_PADDING = 64;

// Sine-based zigzag: position cycles centre → right → centre → left, giving a
// smooth serpentine path instead of a straight column.
function nodeCenterX(indexInGroup: number) {
  return AMPLITUDE + AMPLITUDE * Math.sin((indexInGroup * Math.PI) / 2);
}

function buildPathD(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function LeconTree({
  lecons,
  unites = [],
  filiereSlug,
}: {
  lecons: Lecon[];
  unites?: Unite[];
  filiereSlug: string;
}) {
  const { completedLeconIds } = useProgress();
  const ActiveIcon = ACTIVE_LESSON_ICONS[filiereSlug] ?? IconChefHatFilled;

  const lessonStates = useMemo(() => {
    return lecons.map((lecon, index) => {
      const isCompleted = completedLeconIds.has(lecon.id);
      const previousLecon = index > 0 ? lecons[index - 1] : null;
      const isUnlocked =
        index === 0 || (previousLecon !== null && completedLeconIds.has(previousLecon.id));
      return {
        lecon,
        isCompleted,
        isActive: isUnlocked && !isCompleted,
        isLocked: !isUnlocked,
      };
    });
  }, [lecons, completedLeconIds]);

  const uniteById = new Map(unites.map((u) => [u.id, u]));

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, typeof lessonStates>();
    for (const state of lessonStates) {
      const key = state.lecon.unite_id ?? "__none__";
      if (!map.has(key)) {
        order.push(key);
        map.set(key, []);
      }
      map.get(key)!.push(state);
    }
    return order.map((key) => ({
      key,
      unite: key === "__none__" ? null : (uniteById.get(key) ?? null),
      items: map.get(key)!,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonStates]);

  const totalHeight = groups.reduce((sum, group, i) => {
    const groupHeight = (group.items.length - 1) * V_GAP + NODE_SIZE;
    const headerHeight = group.unite ? UNITE_HEADER_HEIGHT : 0;
    const markerHeight = group.unite ? UNIT_END_MARKER_HEIGHT : 0;
    const gap = i > 0 ? GROUP_GAP : 0;
    return sum + groupHeight + headerHeight + markerHeight + gap;
  }, OUTER_PADDING);

  return (
    <div className="lecon-tree-backdrop relative mt-10 flex flex-col items-center overflow-hidden rounded-[2.5rem] px-4 py-8">
      <FiliereWatermark slug={filiereSlug} seed={filiereSlug} width={WIDTH} height={totalHeight} />

      {groups.map((group, groupIndex) => {
        const points = group.items.map((_, i) => ({
          x: nodeCenterX(i),
          y: i * V_GAP + NODE_SIZE / 2,
        }));
        const height = (group.items.length - 1) * V_GAP + NODE_SIZE;
        const pathD = buildPathD(points);
        const isUnitComplete = group.items.every((item) => item.isCompleted);

        return (
          <div key={group.key} className={`flex flex-col items-center ${groupIndex > 0 ? "mt-8" : ""}`}>
            {group.unite && (
              <div className="mb-6 flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-4 text-center shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-extrabold text-white">
                  {group.unite.position}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">
                    Unité {group.unite.position}
                  </p>
                  <p className="mt-0.5 max-w-[180px] text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    {group.unite.title}
                  </p>
                </div>
              </div>
            )}

            <div className="relative" style={{ width: WIDTH, height }}>
              <svg width={WIDTH} height={height} className="absolute left-0 top-0" aria-hidden>
                <path
                  d={pathD}
                  fill="none"
                  strokeWidth={6}
                  strokeLinecap="round"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
              </svg>

              {group.items.map((state, i) => {
                const { lecon, isCompleted, isActive } = state;
                const center = points[i];

                let circleClasses =
                  "flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600";
                if (isCompleted) {
                  circleClasses =
                    "flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_5px_0_0_#a75a18] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#a75a18]";
                } else if (isActive) {
                  circleClasses =
                    "flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_5px_0_0_#15803d] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#15803d] animate-active-lesson-pulse";
                }

                const icon = isCompleted ? (
                  <IconCheck size={38} strokeWidth={3} />
                ) : isActive ? (
                  <ActiveIcon size={34} strokeWidth={2} />
                ) : (
                  <IconLockFilled size={28} />
                );

                return (
                  <div
                    key={lecon.id}
                    className="absolute"
                    style={{
                      left: center.x - NODE_SIZE / 2,
                      top: center.y - NODE_SIZE / 2,
                    }}
                  >
                    {isCompleted || isActive ? (
                      <Link href={`/lecon/${lecon.id}`} aria-label={lecon.title} className={circleClasses}>
                        {icon}
                      </Link>
                    ) : (
                      <div aria-label={`${lecon.title} verrouillée`} className={circleClasses}>
                        {icon}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {group.unite && (
              <div className="mt-2 flex flex-col items-center gap-1">
                <div className="h-6 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div
                  className={
                    isUnitComplete
                      ? "flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_0_0_#a75a18]"
                      : "flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600"
                  }
                >
                  <IconTrophyFilled size={22} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
