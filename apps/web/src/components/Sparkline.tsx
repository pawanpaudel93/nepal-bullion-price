interface SparklineProps {
  data: number[];
  color: 'gold' | 'silver';
  labels?: string[];
  formattedPrices?: string[];
  className?: string;
}

/**
 * Build a smooth cubic bezier curve through data points.
 * Uses Catmull-Rom → cubic bezier conversion for natural curves.
 */
function buildSmoothPath(xs: number[], ys: number[]): string {
  if (xs.length < 2) return '';
  if (xs.length === 2) return `M${xs[0]},${ys[0]} L${xs[1]},${ys[1]}`;

  const tension = 0.3;
  let d = `M${xs[0]},${ys[0]}`;

  for (let i = 0; i < xs.length - 1; i++) {
    const p0x = xs[Math.max(0, i - 1)];
    const p0y = ys[Math.max(0, i - 1)];
    const p1x = xs[i];
    const p1y = ys[i];
    const p2x = xs[i + 1];
    const p2y = ys[i + 1];
    const p3x = xs[Math.min(xs.length - 1, i + 2)];
    const p3y = ys[Math.min(xs.length - 1, i + 2)];

    const cp1x = p1x + (p2x - p0x) * tension;
    const cp1y = p1y + (p2y - p0y) * tension;
    const cp2x = p2x - (p3x - p1x) * tension;
    const cp2y = p2y - (p3y - p1y) * tension;

    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2x},${p2y}`;
  }

  return d;
}

export function Sparkline({ data, color, labels, formattedPrices, className = '' }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 200;
  const tooltipHeight = formattedPrices ? 12 : 0;
  const chartTop = tooltipHeight;
  const chartHeight = 52;
  const labelGap = labels ? 5 : 0;
  const labelHeight = labels ? 10 : 0;
  const height = tooltipHeight + chartHeight + labelGap + labelHeight;
  const padX = 6;
  const padY = 5;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xPositions = data.map((_, i) => padX + (i / (data.length - 1)) * (width - padX * 2));

  const getY = (val: number) => chartTop + padY + ((max - val) / range) * (chartHeight - padY * 2);

  const xs = xPositions;
  const ys = data.map(getY);

  // Smooth bezier curve
  const linePath = buildSmoothPath(xs, ys);

  // Area fill: line path + close to bottom
  const lastDataX = xs[xs.length - 1];
  const firstDataX = xs[0];
  const chartBottom = chartTop + chartHeight;
  const fillPath = `${linePath} L${lastDataX},${chartBottom} L${firstDataX},${chartBottom}Z`;

  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];

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
        .spark-pt .spark-tip { opacity: 0; transition: opacity 0.15s; pointer-events: none; }
        .spark-pt:hover .spark-tip { opacity: 1; }
        .spark-pt .spark-dot-hover { opacity: 0; transition: opacity 0.15s; }
        .spark-pt:hover .spark-dot-hover { opacity: 1; }
      `}</style>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColorStart} stopOpacity={0.4} />
          <stop offset="80%" stopColor={fillColorStart} stopOpacity={0.08} />
          <stop offset="100%" stopColor={fillColorStart} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Gradient fill under curve */}
      <path d={fillPath} fill={`url(#${gradientId})`} />
      {/* Smooth line */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Interactive data points with hover tooltips */}
      {data.map((val, i) => {
        const cx = xs[i];
        const cy = ys[i];
        const isLast = i === data.length - 1;
        const anchor = i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle';

        // Tooltip position: always above the point, clamped to chart area
        const tipY = chartTop + 2;

        return (
          <g key={i} className="spark-pt" style={{ cursor: 'pointer' }}>
            {/* Invisible larger hit area */}
            <circle cx={cx} cy={cy} r={10} fill="transparent" />
            {/* Visible dot */}
            {isLast ? (
              <>
                <circle cx={cx} cy={cy} r={4.5} fill={strokeColor} />
                <circle cx={cx} cy={cy} r={2} fill="var(--color-paper, #FAFAF9)" />
              </>
            ) : (
              <>
                <circle cx={cx} cy={cy} r={2} fill={strokeColor} opacity={0.5} />
                <circle className="spark-dot-hover" cx={cx} cy={cy} r={3.5} fill={strokeColor} opacity={0} />
              </>
            )}
            {/* Tooltip on hover */}
            {formattedPrices?.[i] ? (
              <g className="spark-tip">
                <rect
                  x={cx - (anchor === 'middle' ? 22 : anchor === 'start' ? -1 : 43)}
                  y={tipY}
                  width={44}
                  height={9}
                  rx={2}
                  fill={tooltipBg}
                  opacity={0.95}
                />
                <text
                  x={cx}
                  y={tipY + 7}
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
          x={xs[i]}
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
