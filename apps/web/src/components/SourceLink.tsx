import { getSourceUrl } from '../utils/sourceUrls';

interface SourceLinkProps {
  name: string;
  label?: string;
  className?: string;
}

export function SourceLink({ name, label, className = '' }: SourceLinkProps) {
  const url = getSourceUrl(name);
  const text = label ?? name;
  if (!url) return <span className={className}>{text}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-ink-faint/30 underline-offset-2 hover:text-ink dark:hover:text-white transition-colors duration-200 ${className}`}
    >
      {text}
    </a>
  );
}
