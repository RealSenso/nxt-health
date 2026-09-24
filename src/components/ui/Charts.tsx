import React from 'react';

interface BarChartDatum {
  label: string;
  value: number;
  color: string;
}

export const SimpleBarChart: React.FC<{ data: BarChartDatum[]; height?: number }> = ({ data, height = 160 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-4 sm:gap-6" style={{ height }}>
      {data.map(d => {
        const barHeight = Math.max((d.value / max) * (height - 28), d.value > 0 ? 4 : 0);
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-xs font-bold text-[var(--nxt-ink)] mb-1">{d.value}</span>
            <div
              className="w-full max-w-12 rounded-t-lg transition-all duration-500"
              style={{ height: barHeight, backgroundColor: d.color }}
            />
            <span className="text-[11px] font-semibold text-[var(--nxt-ink-soft)] mt-2 text-center leading-tight">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface LinePoint {
  label: string;
  value: number;
}

export const SimpleLineChart: React.FC<{ data: LinePoint[]; color?: string; height?: number }> = ({
  data,
  color = 'var(--nxt-blue-strong)',
  height = 160,
}) => {
  const width = 100;
  const max = Math.max(...data.map(d => d.value), 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = data.length > 1 ? i * stepX : width / 2;
    const y = 100 - (d.value / max) * 88 - 6;
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} 100 L ${points[0]?.x ?? 0} 100 Z`;

  return (
    <div style={{ height }} className="w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <path d={areaPath} fill={color} opacity={0.12} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.6} fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between mt-1.5">
        {data.map(d => (
          <span key={d.label} className="text-[11px] font-semibold text-[var(--nxt-ink-soft)]">{d.label}</span>
        ))}
      </div>
    </div>
  );
};

export interface HBarDatum {
  label: string;
  value: number;
  display?: string;
  detail?: string;
}

export const HBarList: React.FC<{ data: HBarDatum[]; max?: number; emptyText?: string }> = ({ data, max, emptyText = 'No data yet.' }) => {
  const [hovered, setHovered] = React.useState<string | null>(null);
  if (data.length === 0) return <p className="text-sm text-[var(--nxt-ink-soft)]">{emptyText}</p>;
  const top = max ?? Math.max(...data.map(d => d.value), 1);
  return (
    <ul className="space-y-2.5" role="list">
      {data.map(d => (
        <li
          key={d.label}
          className="relative"
          onMouseEnter={() => setHovered(d.label)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-[var(--nxt-ink)] truncate">{d.label}</span>
            <span className="font-semibold text-[var(--nxt-ink)] tabular-nums shrink-0">{d.display ?? d.value}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-[var(--nxt-bg-soft)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${top ? Math.max((d.value / top) * 100, d.value > 0 ? 2 : 0) : 0}%`,
                backgroundColor: 'var(--nxt-mint-strong)',
                opacity: hovered && hovered !== d.label ? 0.45 : 1,
              }}
            />
          </div>
          {hovered === d.label && d.detail && (
            <div className="absolute right-0 -top-9 z-10 rounded-lg bg-[var(--nxt-ink)] text-[var(--nxt-surface)] text-xs font-medium px-2.5 py-1.5 shadow-lg whitespace-nowrap pointer-events-none">
              {d.detail}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export const StatTile: React.FC<{ label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: React.ElementType }> = ({
  label, value, sub, icon: Icon,
}) => (
  <div className="rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-4 shadow-sm">
    <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] flex items-center gap-1.5">
      {Icon && <Icon className="w-4 h-4 text-[var(--nxt-mint-strong)]" />} {label}
    </p>
    <p className="font-display text-2xl font-extrabold text-[var(--nxt-ink)] mt-1.5 tabular-nums">{value}</p>
    {sub && <p className="text-xs text-[var(--nxt-ink-soft)] mt-0.5">{sub}</p>}
  </div>
);

export const HeatCell: React.FC<{ pct: number | null }> = ({ pct }) => (
  <td className="p-1">
    {pct === null ? (
      <div className="h-9 rounded-lg bg-[var(--nxt-bg-soft)] flex items-center justify-center text-xs text-[var(--nxt-ink-soft)]">—</div>
    ) : (
      <div
        className="h-9 rounded-lg flex items-center justify-center text-xs font-semibold tabular-nums"
        style={{
          backgroundColor: `color-mix(in srgb, var(--nxt-mint-strong) ${Math.round(12 + pct * 0.7)}%, var(--nxt-surface))`,
          color: pct >= 55 ? '#FFFFFF' : 'var(--nxt-ink)',
        }}
        title={`${pct}% retained`}
      >
        {pct}%
      </div>
    )}
  </td>
);
