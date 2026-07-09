export function SpeechBubble({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative animate-bubble-in rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-[0_4px_0_0_#e4e4e7] dark:bg-zinc-900 dark:text-zinc-200 dark:shadow-[0_4px_0_0_#3f3f46] ${className}`}
    >
      <span
        className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 bg-white dark:bg-zinc-900"
        aria-hidden
      />
      {children}
    </div>
  );
}
