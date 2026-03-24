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
    <div className="mt-10 px-1">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint dark:text-ink-faint mb-3">
        Sources
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.isStale ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
              role="status"
              aria-label={`${s.label}: ${s.isStale ? 'stale' : 'fresh'}`}
            />
            <span className="text-ink-muted dark:text-ink-faint truncate">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
