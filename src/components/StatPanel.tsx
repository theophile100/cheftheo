"use client";

export function StatPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed inset-0 z-30 animate-fade-in bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-in-bottom rounded-t-3xl bg-white p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-xl dark:bg-zinc-900">
        <div className="mx-auto flex max-w-md items-center justify-between md:max-w-2xl lg:max-w-4xl">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mx-auto mt-4 max-w-md md:max-w-2xl lg:max-w-4xl">{children}</div>
      </div>
    </>
  );
}
