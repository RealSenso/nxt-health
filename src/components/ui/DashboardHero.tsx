import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const ROUTE = 'M 24 150 C 210 150 230 60 410 72 S 650 160 820 96 S 1010 24 1176 44';
const WAYPOINTS = 6;

/**
 * The dashboard's header graphic: one route with a waypoint for each sixth of the way,
 * lit up to how far the founder's roadmaps have got, with light pulses always running along it.
 */
export const DashboardHero: React.FC<{ pct: number; label: string; detail: string }> = ({ pct, label, detail }) => {
  const path = useRef<SVGPathElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const p = path.current;
    if (!p) return;
    const len = p.getTotalLength();
    setPoints(Array.from({ length: WAYPOINTS }, (_, i) => p.getPointAtLength((len * i) / (WAYPOINTS - 1))));
  }, []);

  const reached = pct / 100;
  return (
    <div data-no-motion className="relative overflow-hidden rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.5]" preserveAspectRatio="none" viewBox="0 0 1200 200">
        <defs>
          <pattern id="dash-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="var(--nxt-line)" strokeWidth="0.6" /></pattern>
          <linearGradient id="dash-fade" x1="0" x2="1"><stop offset="0" stopColor="var(--nxt-surface)" stopOpacity="1" /><stop offset="0.55" stopColor="var(--nxt-surface)" stopOpacity="0" /></linearGradient>
        </defs>
        <rect width="1200" height="200" fill="url(#dash-grid)" />
        <rect width="1200" height="200" fill="url(#dash-fade)" />
      </svg>

      <svg aria-hidden="true" className="relative w-full h-[11rem] sm:h-[13rem]" preserveAspectRatio="none" viewBox="0 0 1200 200">
        <path ref={path} d={ROUTE} fill="none" stroke="var(--nxt-line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path className="nxt-flow" d={ROUTE} fill="none" stroke="var(--nxt-ink-soft)" strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke" />
        <motion.path
          d={ROUTE} pathLength={1} fill="none" stroke="var(--nxt-green)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 6px var(--nxt-green))' }}
          initial={{ strokeDasharray: '1 1', strokeDashoffset: 1 }} animate={{ strokeDashoffset: 1 - Math.max(0.02, reached) }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {points.map((pt, i) => {
          const lit = i / (WAYPOINTS - 1) <= reached + 0.001;
          return (
            <g key={i}>
              {lit && <circle cx={pt.x} cy={pt.y} r="14" fill="var(--nxt-green)" opacity="0.18"><animate attributeName="r" values="8;20;8" dur="3.2s" begin={`${i * 0.4}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;0;0.3" dur="3.2s" begin={`${i * 0.4}s`} repeatCount="indefinite" /></circle>}
              <circle cx={pt.x} cy={pt.y} r="6" fill={lit ? 'var(--nxt-green)' : 'var(--nxt-surface)'} stroke={lit ? 'var(--nxt-green)' : 'var(--nxt-line)'} strokeWidth="2" />
            </g>
          );
        })}
        {[0, 2.4, 4.8].map(delay => (
          <circle key={delay} r="4" fill="var(--nxt-green)" style={{ filter: 'drop-shadow(0 0 6px var(--nxt-green))' }}>
            <animateMotion dur="7s" begin={`${delay}s`} repeatCount="indefinite" path={ROUTE} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="7s" begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      <div className="absolute left-5 sm:left-8 top-5 sm:top-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--nxt-ink-soft)]">{label}</p>
        <p className="mt-1 font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] text-[var(--nxt-ink)]">{pct}%</p>
        <p className="mt-1 text-sm text-[var(--nxt-ink-soft)]">{detail}</p>
      </div>
    </div>
  );
};
