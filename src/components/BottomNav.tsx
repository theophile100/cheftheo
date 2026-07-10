"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconCompass, IconUser, type Icon } from "@tabler/icons-react";

interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  isActive: (pathname: string) => boolean;
}

// Add a new entry here (e.g. Classement / IconTrophy) to extend the bar —
// the layout below adapts to however many items are in this list.
const NAV_ITEMS: NavItem[] = [
  {
    href: "/accueil",
    label: "Apprendre",
    icon: IconHome,
    isActive: (pathname) =>
      pathname === "/accueil" ||
      pathname.startsWith("/filiere") ||
      pathname.startsWith("/lecon"),
  },
  {
    href: "/decouvrir",
    label: "Découvrir",
    icon: IconCompass,
    isActive: (pathname) => pathname.startsWith("/decouvrir"),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: IconUser,
    isActive: (pathname) => pathname.startsWith("/profil"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 rounded-t-3xl border-t border-zinc-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-black/95">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 md:max-w-2xl lg:max-w-4xl">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const ItemIcon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <ItemIcon
                size={26}
                stroke={1.75}
                className={active ? "text-orange-500" : "text-zinc-400 dark:text-zinc-500"}
              />
              <span
                className={`text-xs font-semibold ${
                  active ? "text-orange-500" : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
