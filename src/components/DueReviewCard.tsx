import Link from "next/link";
import { IconRepeat } from "@tabler/icons-react";

export function DueReviewCard({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <Link
      href="/revision"
      className="mt-6 flex items-center gap-4 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-5 text-white shadow-[0_5px_0_0_#a75a18] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#a75a18]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
        <IconRepeat size={26} stroke={2} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-white/80">
          À réviser aujourd&apos;hui
        </p>
        <p className="text-lg font-extrabold">
          {count} notion{count > 1 ? "s" : ""} à revoir
        </p>
      </div>
    </Link>
  );
}
