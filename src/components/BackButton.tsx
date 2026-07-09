import Link from "next/link";

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Retour"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-lg shadow-zinc-900/5 transition-transform active:scale-95 dark:bg-zinc-900 dark:text-zinc-200"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
