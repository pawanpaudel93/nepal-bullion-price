interface SparklineProps {
  data: number[];
  color: 'gold' | 'silver';
  labels?: string[];
  className?: string;
}

export function Sparkline({ data, color, labels, className = '' }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 200;
  const chartHeight = 48;
  const labelGap = labels ? 6 : 0;
  const labelHeight = labels ? 10 : 0;
  const height = chartHeight + labelGap + labelHeight;
  const padX = 5; // room for the end dot (r=4) to not clip
  const padY = 6;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xPositions = data.map((_, i) => padX + (i / (data.length - 1)) * (width - padX * 2));

  const getY = (val: number) => padY + ((max - val) / range) * (chartHeight - padY * 2);

  const points = data.map((val, i) => `${xPositions[i]},${getY(val)}`).join(' ');

  // Area fill path
  const fillD = data.map((val, i) => `${xPositions[i]},${getY(val)}`);
  const lastDataX = xPositions[xPositions.length - 1];
  const firstDataX = xPositions[0];
  const fillPath = `M${fillD[0]} L${fillD.join(' L')} L${lastDataX},${chartHeight} L${firstDataX},${chartHeight}Z`;

  const lastX = xPositions[xPositions.length - 1];
  const lastY = getY(data[data.length - 1]);

  const gradientId = `spark-fill-${color}`;
  const strokeColor = color === 'gold'
    ? 'var(--color-gold-500)'
    : 'var(--color-silver-500)';
  const fillColorStart = color === 'gold'
    ? 'var(--color-gold-400)'
    : 'var(--color-silver-400)';
  const labelFill = 'var(--color-ink-faint)';

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
          <stop offset="0%" stopColor={fillColorStart} stopOpacity={0.35} />
          <stop offset="100%" stopColor={fillColorStart} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small dots on each data point */}
      {data.map((val, i) => (
        i < data.length - 1 ? (
          <circle key={i} cx={xPositions[i]} cy={getY(val)} r={1.5} fill={strokeColor} opacity={0.4} />
        ) : null
      ))}
      {/* Larger dot on today's price */}
      <circle cx={lastX} cy={lastY} r={4} fill={strokeColor} />
      <circle cx={lastX} cy={lastY} r={2} fill="var(--color-paper, #FAFAF9)" />
      {labels ? labels.map((label, i) => (
        <text
          key={i}
          x={xPositions[i]}
          y={chartHeight + labelGap + labelHeight}
          textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
          fill={labelFill}
          fontSize={6.5}
          fontFamily="system-ui, sans-serif"
        >
          {label}
        </text>
      )) : null}
    </svg>
  );
}
