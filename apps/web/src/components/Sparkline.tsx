interface SparklineProps {
  data: number[];
  color: 'gold' | 'silver';
  className?: string;
}

export function Sparkline({ data, color, className = '' }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 200;
  const height = 32;
  const padY = 4;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padY + ((max - val) / range) * (height - padY * 2);
    return `${x},${y}`;
  }).join(' ');

  // Build the fill path (area under the line)
  const fillPath = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padY + ((max - val) / range) * (height - padY * 2);
    return `${x},${y}`;
  });
  const fillD = `M${fillPath[0]} L${fillPath.join(' L')} L${width},${height} L0,${height}Z`;

  const lastX = width;
  const lastY = padY + ((max - data[data.length - 1]) / range) * (height - padY * 2);

  const gradientId = `spark-fill-${color}`;
  const strokeColor = color === 'gold'
    ? 'var(--color-gold-500)'
    : 'var(--color-silver-500)';
  const fillColorStart = color === 'gold'
    ? 'var(--color-gold-400)'
    : 'var(--color-silver-400)';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`Price trend over ${data.length} days`}
      style={{ width: '100%', height: `${height}px` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColorStart} stopOpacity={0.2} />
          <stop offset="100%" stopColor={fillColorStart} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={3} fill={strokeColor} />
    </svg>
  );
}
