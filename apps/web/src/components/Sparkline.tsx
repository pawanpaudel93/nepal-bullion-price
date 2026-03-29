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
  const tooltipHeight = formattedPrices ? 10 : 0;
  const chartTop = tooltipHeight;
  const chartHeight = 48;
  const labelGap = labels ? 6 : 0;
  const labelHeight = labels ? 10 : 0;
  const height = tooltipHeight + chartHeight + labelGap + labelHeight;
  const padX = 5;
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
  const tooltipBg = color === 'gold'
    ? 'var(--color-gold-700)'
    : 'var(--color-silver-500)';

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
        .spark-pt .spark-tip { opacity: 0; transition: opacity 0.15s; }
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
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Interactive data points with hover tooltips */}
      {data.map((val, i) => {
        const cx = xPositions[i];
        const cy = getY(val);
        const isLast = i === data.length - 1;
        const anchor = i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle';
        return (
          <g key={i} className="spark-pt">
            {/* Invisible larger hit area */}
            <circle cx={cx} cy={cy} r={8} fill="transparent" />
            {/* Visible dot */}
            {isLast ? (
              <>
                <circle cx={cx} cy={cy} r={4} fill={strokeColor} />
                <circle cx={cx} cy={cy} r={2} fill="var(--color-paper, #FAFAF9)" />
              </>
            ) : (
              <>
                <circle cx={cx} cy={cy} r={1.5} fill={strokeColor} opacity={0.4} />
                <circle className="spark-dot-hover" cx={cx} cy={cy} r={3} fill={strokeColor} opacity={0} />
              </>
            )}
            {/* Tooltip on hover */}
            {formattedPrices?.[i] ? (
              <g className="spark-tip">
                <rect
                  x={cx - (anchor === 'middle' ? 20 : anchor === 'start' ? 0 : 40)}
                  y={cy - (tooltipHeight ? cy - chartTop + 12 : 14)}
                  width={40}
                  height={9}
                  rx={2}
                  fill={tooltipBg}
                  opacity={0.9}
                />
                <text
                  x={cx}
                  y={cy - (tooltipHeight ? cy - chartTop + 5 : 7)}
                  textAnchor={anchor}
                  fill="white"
                  fontSize={5.5}
                  fontFamily="ui-monospace, monospace"
                  fontWeight={600}
                >
                  {formattedPrices[i]}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
      {labels ? labels.map((label, i) => (
        <text
          key={i}
          x={xPositions[i]}
          y={chartBottom + labelGap + labelHeight}
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
