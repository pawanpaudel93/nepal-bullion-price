interface SparklineProps {
  data: number[];
  color: 'gold' | 'silver';
  labels?: string[];
  className?: string;
}

export function Sparkline({ data, color, labels, className = '' }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 200;
  const chartHeight = 32;
  const labelHeight = labels ? 12 : 0;
  const height = chartHeight + labelHeight;
  const padY = 4;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xPositions = data.map((_, i) => (i / (data.length - 1)) * width);

  const points = data.map((val, i) => {
    const y = padY + ((max - val) / range) * (chartHeight - padY * 2);
    return `${xPositions[i]},${y}`;
  }).join(' ');

  // Build the fill path (area under the line)
  const fillD = data.map((val, i) => {
    const y = padY + ((max - val) / range) * (chartHeight - padY * 2);
    return `${xPositions[i]},${y}`;
  });
  const fillPath = `M${fillD[0]} L${fillD.join(' L')} L${width},${chartHeight} L0,${chartHeight}Z`;

  const lastX = xPositions[xPositions.length - 1];
  const lastY = padY + ((max - data[data.length - 1]) / range) * (chartHeight - padY * 2);

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
      style={{ width: '100%' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColorStart} stopOpacity={0.2} />
          <stop offset="100%" stopColor={fillColorStart} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={3} fill={strokeColor} />
      {labels ? labels.map((label, i) => (
        <text
          key={i}
          x={xPositions[i]}
          y={chartHeight + labelHeight}
          textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
          fill="var(--color-ink-faint)"
          fontSize={5}
        >
          {label}
        </text>
      )) : null}
    </svg>
  );
}
