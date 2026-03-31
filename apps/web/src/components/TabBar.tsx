import { useLocale } from '../i18n';
import { GoldIcon, NewsIcon } from './Icons';

export type Tab = 'prices' | 'news';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-ink/8 dark:border-white/8 safe-area-bottom">
      <div className="max-w-5xl mx-auto flex">
        <button
          onClick={() => onTabChange('prices')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors duration-200 ${
            activeTab === 'prices'
              ? 'text-gold-500'
              : 'text-ink-muted dark:text-ink-faint'
          }`}
        >
          <GoldIcon className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-wide">{t.prices}</span>
        </button>
        <button
          onClick={() => onTabChange('news')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors duration-200 ${
            activeTab === 'news'
              ? 'text-gold-500'
              : 'text-ink-muted dark:text-ink-faint'
          }`}
        >
          <NewsIcon className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-wide">{t.news}</span>
        </button>
      </div>
    </nav>
  );
}
