import { getSourceUrl } from '../utils/sourceUrls';
import { useLocale } from '../i18n';

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
  const { t } = useLocale();
  if (sources.length === 0) return null;

  return (
    <div className="mt-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-[10px] ne-text-boost font-medium uppercase tracking-[0.25em] text-ink-faint dark:text-ink-faint mb-4 px-1">
        {t.sources}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 px-1">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 text-[12px]">
            <span
              className={`w-[6px] h-[6px] rounded-full shrink-0 ${s.isStale ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
              role="status"
              aria-label={`${s.label}: ${s.isStale ? 'stale' : 'fresh'}`}
            />
            {(() => {
              const url = getSourceUrl(s.source);
              return url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-ink-muted dark:text-ink-faint font-light underline decoration-ink-faint/30 underline-offset-2 hover:text-ink dark:hover:text-white transition-colors duration-200">{s.label}</a>
              ) : (
                <span className="text-ink-muted dark:text-ink-faint font-light">{s.label}</span>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
