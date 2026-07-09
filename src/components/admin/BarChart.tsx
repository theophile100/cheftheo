export function BarChart({
  title,
  data,
  emptyMessage,
}: {
  title: string;
  data: { label: string; value: number }[];
  emptyMessage?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {data.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">
          {emptyMessage ?? "Aucune donnée pour l'instant."}
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm text-zinc-600 dark:text-zinc-400">
                {d.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-orange-500 dark:bg-orange-400"
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
