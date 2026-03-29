interface SparklineProps {
  data: number[];
  color: 'gold' | 'silver';
  labels?: string[];
  formattedPrices?: string[];
  className?: string;
}

export function Sparkline({ data, color, labels, formattedPrices, className = '' }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 200;
  const tipSpace = formattedPrices ? 10 : 0;
  const chartTop = tipSpace;
  const chartHeight = 48;
  const tipSpaceBottom = formattedPrices ? 10 : 0;
  const labelGap = labels ? 5 : 0;
  const labelHeight = labels ? 10 : 0;
  const height = tipSpace + chartHeight + tipSpaceBottom + labelGap + labelHeight;
  const padX = 6;
  const padY = 6;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xPositions = data.map((_, i) => padX + (i / (data.length - 1)) * (width - padX * 2));

  const getY = (val: number) => chartTop + padY + ((max - val) / range) * (chartHeight - padY * 2);

  const points = data.map((val, i) => `${xPositions[i]},${getY(val)}`).join(' ');

  // Area fill path
  const fillD = data.map((val, i) => `${xPositions[i]},${getY(val)}`);
  const lastDataX = xPositions[xPositions.length - 1];
  const firstDataX = xPositions[0];
  const chartBottom = chartTop + chartHeight;
  const fillPath = `M${fillD[0]} L${fillD.join(' L')} L${lastDataX},${chartBottom} L${firstDataX},${chartBottom}Z`;

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
      <style>{`
        .spark-pt .spark-tip { opacity: 0; transition: opacity 0.15s; pointer-events: none; }
        .spark-pt:hover .spark-tip { opacity: 1; }
        .spark-pt .spark-dot-hover { opacity: 0; transition: opacity 0.15s; }
        .spark-pt:hover .spark-dot-hover { opacity: 1; }
      `}</style>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColorStart} stopOpacity={0.35} />
          <stop offset="100%" stopColor={fillColorStart} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* Gradient fill */}
      <path d={fillPath} fill={`url(#${gradientId})`} />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots (rendered after line so they sit on top) */}
      {data.map((val, i) => {
        const cx = xPositions[i];
        const cy = getY(val);
        const isLast = i === data.length - 1;
        return isLast ? (
          <g key={i}>
            <circle cx={cx} cy={cy} r={4.5} fill={strokeColor} />
            <circle cx={cx} cy={cy} r={2} fill="var(--color-paper, #FAFAF9)" />
          </g>
        ) : (
          <circle key={i} cx={cx} cy={cy} r={2} fill={strokeColor} opacity={0.5} />
        );
      })}
      {/* Interactive hover areas + tooltips (rendered last = on top of everything) */}
      {data.map((val, i) => {
        const cx = xPositions[i];
        const cy = getY(val);
        const isLast = i === data.length - 1;
        const anchor = i === 0 ? 'start' : isLast ? 'end' : 'middle';
        // Tooltip in reserved space: above chart area or below chart area
        const tipAbove = cy > chartTop + chartHeight * 0.4;
        const tipY = tipAbove ? chartTop - 2 + tipSpace : chartBottom + 8;
        return (
          <g key={i} className="spark-pt" style={{ cursor: 'pointer' }}>
            {/* Invisible hit area */}
            <circle cx={cx} cy={cy} r={12} fill="transparent" />
            {/* Enlarged dot on hover */}
            {!isLast && <circle className="spark-dot-hover" cx={cx} cy={cy} r={3.5} fill={strokeColor} />}
            {/* Price tooltip — in reserved space above or below the chart */}
            {formattedPrices?.[i] ? (
              <text
                className="spark-tip"
                x={cx}
                y={tipY}
                textAnchor={anchor}
                fill={strokeColor}
                fontSize={6}
                fontFamily="ui-monospace, monospace"
                fontWeight={700}
              >
                {formattedPrices[i]}
              </text>
            ) : null}
          </g>
        );
      })}
      {/* Day labels */}
      {labels ? labels.map((label, i) => (
        <text
          key={i}
          x={xPositions[i]}
          y={chartBottom + tipSpaceBottom + labelGap + labelHeight}
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
