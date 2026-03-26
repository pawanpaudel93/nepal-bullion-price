interface IconProps {
  className?: string;
}

export function GoldIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="1 3 22 20" fill="none" className={className} aria-hidden="true">
      {/* Bucket body */}
      <path d="M3 11h18l-2 10H5L3 11z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
      {/* Bucket rim */}
      <path d="M2.5 10.5h19a1 1 0 0 1 0 2h-19a1 1 0 0 1 0-2z" fill="#CA8A04" stroke="#A16207" strokeWidth="0.75" />
      {/* Vertical rivet lines on bucket */}
      <path d="M8 12v8.5M16 12v8.5" stroke="#CA8A04" strokeWidth="0.5" opacity="0.3" />
      {/* Gold balls overflowing — back row */}
      <circle cx="9" cy="7.5" r="2" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.75" />
      <circle cx="15" cy="7.5" r="2" fill="#EAB308" stroke="#A16207" strokeWidth="0.75" />
      {/* Gold balls — front row */}
      <circle cx="12" cy="6" r="2.2" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.75" />
      {/* Gold bar peeking out */}
      <rect x="7" y="9" width="10" height="2.5" rx="0.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.5" />
      {/* Shine on top ball */}
      <circle cx="11.2" cy="5.2" r="0.6" fill="white" opacity="0.5" />
    </svg>
  );
}

export function SilverIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="1 3 22 20" fill="none" className={className} aria-hidden="true">
      {/* Bucket body */}
      <path d="M3 11h18l-2 10H5L3 11z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Bucket rim */}
      <path d="M2.5 10.5h19a1 1 0 0 1 0 2h-19a1 1 0 0 1 0-2z" fill="#94A3B8" stroke="#64748B" strokeWidth="0.75" />
      {/* Vertical rivet lines on bucket */}
      <path d="M8 12v8.5M16 12v8.5" stroke="#94A3B8" strokeWidth="0.5" opacity="0.3" />
      {/* Silver balls overflowing — back row */}
      <circle cx="9" cy="7.5" r="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.75" />
      <circle cx="15" cy="7.5" r="2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.75" />
      {/* Silver balls — front row */}
      <circle cx="12" cy="6" r="2.2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.75" />
      {/* Silver bar peeking out */}
      <rect x="7" y="9" width="10" height="2.5" rx="0.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.5" />
      {/* Shine on top ball */}
      <circle cx="11.2" cy="5.2" r="0.6" fill="white" opacity="0.6" />
    </svg>
  );
}

export function SunIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function MoonIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function RefreshIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export function ChevronDownIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
