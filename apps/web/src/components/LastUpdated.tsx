interface SourceTimestamp {
  label: string;
  source: string;
  updatedAt: string;
  isStale: boolean;
}

interface LastUpdatedProps {
  sources: SourceTimestamp[];
}

export function LastUpdated({ sources }: LastUpdatedProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Data Sources
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-500 text-xs">{s.source}</span>
              {s.isStale && (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" title="Stale data" />
              )}
              {!s.isStale && (
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="Fresh" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
