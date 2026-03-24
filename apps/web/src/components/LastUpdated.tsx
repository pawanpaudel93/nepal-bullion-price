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
    <div className="mt-8 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
      <h3 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
        Data Sources
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm py-1">
            <span className="text-slate-600 dark:text-slate-400 font-medium">{s.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500 text-xs">{s.source}</span>
              <span
                className={`inline-block w-2 h-2 rounded-full ${s.isStale ? 'bg-amber-400' : 'bg-emerald-400'}`}
                title={s.isStale ? 'Stale data' : 'Fresh'}
                role="status"
                aria-label={`${s.label}: ${s.isStale ? 'stale' : 'fresh'}`}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
