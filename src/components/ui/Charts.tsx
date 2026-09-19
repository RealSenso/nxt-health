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
            <span className="text-[10px] font-semibold text-[var(--nxt-ink-soft)] mt-2 text-center leading-tight">
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
          <span key={d.label} className="text-[10px] font-semibold text-[var(--nxt-ink-soft)]">{d.label}</span>
        ))}
      </div>
    </div>
  );
};
