import React from 'react';
import {
  HeartPulse, Hospital, BadgeDollarSign, CheckCircle2, Search, Flag, PlayCircle, BookOpen,
  TrendingUp, BarChart3, FileText, Stethoscope, Microscope, Lock,
} from 'lucide-react';

const C = {
  surface: 'var(--nxt-surface)',
  soft: 'var(--nxt-bg-soft)',
  line: 'var(--nxt-line)',
  ink: 'var(--nxt-ink)',
  inkSoft: 'var(--nxt-ink-soft)',
  accent: 'var(--nxt-mint-strong)',
  accentSoft: 'var(--nxt-mint)',
  blue: 'var(--nxt-blue-strong)',
  blueSoft: 'var(--nxt-blue)',
  lavender: 'var(--nxt-lavender-strong)',
  lavenderSoft: 'var(--nxt-lavender)',
  peach: 'var(--nxt-peach-deep)',
  peachSoft: 'var(--nxt-peach)',
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; r?: number }> = ({ x, y, w, h, r = 14 }) => (
  <>
    <rect x={x} y={y + 4} width={w} height={h} rx={r} style={{ fill: C.ink, opacity: 0.06 }} />
    <rect x={x} y={y} width={w} height={h} rx={r} style={{ fill: C.surface, stroke: C.line }} strokeWidth={1.5} />
  </>
);

const Bar: React.FC<{ x: number; y: number; w: number; h?: number; color?: string }> = ({ x, y, w, h = 6, color = C.line }) => (
  <rect x={x} y={y} width={w} height={h} rx={h / 2} style={{ fill: color }} />
);

export const HeroIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 520 440" className={className} role="img" aria-label="Founder workspace showing a patient monitor, roadmap progress, grant approval and a hospital pilot">
    <circle cx="280" cy="220" r="190" style={{ fill: C.accentSoft }} />
    <circle cx="420" cy="90" r="46" style={{ fill: C.blueSoft }} />
    <path d="M70 360 C 140 300, 220 400, 300 350" strokeWidth={2} strokeDasharray="4 8" fill="none" style={{ stroke: C.accent, opacity: 0.5 }} />

    <g className="nxt-float">
      <Card x={110} y={110} w={300} h={170} r={20} />
      <circle cx="138" cy="138" r="12" style={{ fill: C.accentSoft }} />
      <HeartPulse x={130} y={130} width={16} height={16} style={{ color: C.accent }} />
      <Bar x={160} y={132} w={90} h={8} color={C.ink} />
      <Bar x={160} y={146} w={60} />
      <text x="385" y="146" textAnchor="end" style={{ fill: C.accent, font: '700 13px var(--nxt-font-display)' }}>LIVE</text>
      <rect x="130" y="170" width="260" height="90" rx="12" style={{ fill: C.soft }} />
      <path
        className="nxt-draw"
        d="M140 220 L185 220 L197 196 L210 246 L224 204 L236 220 L270 220 L282 186 L296 252 L310 220 L380 220"
        fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: C.accent }}
      />
    </g>

    <g className="nxt-float-delay">
      <Card x={30} y={250} w={190} h={96} />
      <circle cx="74" cy="298" r="26" fill="none" strokeWidth={7} style={{ stroke: C.line }} />
      <circle
        cx="74" cy="298" r="26" fill="none" strokeWidth={7} strokeLinecap="round"
        strokeDasharray="163" strokeDashoffset="70" transform="rotate(-90 74 298)" style={{ stroke: C.accent }}
      />
      <text x="74" y="303" textAnchor="middle" style={{ fill: C.ink, font: '700 13px var(--nxt-font-display)' }}>3/7</text>
      <text x="112" y="290" style={{ fill: C.ink, font: '700 12px var(--nxt-font-display)' }}>Clinical</text>
      <text x="112" y="306" style={{ fill: C.ink, font: '700 12px var(--nxt-font-display)' }}>Validation</text>
      <Bar x={112} y={316} w={70} />
    </g>

    <g className="nxt-float">
      <Card x={320} y={300} w={180} h={78} />
      <circle cx="350" cy="339" r="16" style={{ fill: C.accentSoft }} />
      <BadgeDollarSign x={340} y={329} width={20} height={20} style={{ color: C.accent }} />
      <text x="376" y="334" style={{ fill: C.inkSoft, font: '600 11px var(--nxt-font-body)' }}>Grant approved</text>
      <text x="376" y="354" style={{ fill: C.ink, font: '800 17px var(--nxt-font-display)' }}>$175,000</text>
    </g>

    <g className="nxt-float-delay">
      <Card x={360} y={40} w={140} h={58} />
      <circle cx="386" cy="69" r="14" style={{ fill: C.lavenderSoft }} />
      <Hospital x={377} y={60} width={18} height={18} style={{ color: C.lavender }} />
      <text x="408" y="65" style={{ fill: C.ink, font: '700 11px var(--nxt-font-display)' }}>Hospital pilot</text>
      <text x="408" y="80" style={{ fill: C.inkSoft, font: '500 10px var(--nxt-font-body)' }}>IRB approved</text>
    </g>

    <g className="nxt-float">
      <rect x="60" y="120" width="54" height="24" rx="12" transform="rotate(-30 87 132)" style={{ fill: C.surface, stroke: C.line }} strokeWidth={1.5} />
      <rect x="60" y="120" width="27" height="24" rx="12" transform="rotate(-30 87 132)" style={{ fill: C.accent }} />
    </g>
    <g style={{ fill: C.accent }}>
      <rect x="455" y="200" width="8" height="24" rx="2" />
      <rect x="447" y="208" width="24" height="8" rx="2" />
    </g>
  </svg>
);

export type SpotKind = 'problems' | 'roadmap' | 'resources' | 'funds' | 'dashboard' | 'analytics' | 'login' | 'locked';

export const SpotIllustration: React.FC<{ kind: SpotKind; className?: string }> = ({ kind, className }) => (
  <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
    <circle cx="105" cy="78" r="64" style={{ fill: C.accentSoft }} />
    {kind === 'problems' && (
      <>
        <Card x={48} y={28} w={92} h={108} r={12} />
        <rect x="76" y="20" width="36" height="16" rx="6" style={{ fill: C.accent }} />
        <Bar x={62} y={54} w={60} color={C.ink} />
        <Bar x={62} y={68} w={48} />
        <Bar x={62} y={82} w={56} />
        <Bar x={62} y={96} w={38} />
        <g className="nxt-float">
          <circle cx="140" cy="102" r="26" style={{ fill: C.surface, stroke: C.accent }} strokeWidth={4} />
          <line x1="158" y1="120" x2="176" y2="138" strokeWidth={8} strokeLinecap="round" style={{ stroke: C.accent }} />
          <Search x={128} y={90} width={24} height={24} style={{ color: C.accent }} />
        </g>
      </>
    )}
    {kind === 'roadmap' && (
      <>
        <path d="M30 128 C 70 128, 60 80, 100 80 S 140 34, 176 34" fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray="2 12" style={{ stroke: C.inkSoft, opacity: 0.5 }} />
        {[[30, 128, C.accent], [100, 80, C.accent], [176, 34, C.line]].map(([x, y, color], i) => (
          <g key={i}>
            <circle cx={x as number} cy={y as number} r="13" style={{ fill: C.surface, stroke: color as string }} strokeWidth={4} />
            {i < 2 && <CheckCircle2 x={(x as number) - 8} y={(y as number) - 8} width={16} height={16} style={{ color: C.accent }} />}
          </g>
        ))}
        <g className="nxt-float">
          <line x1="176" y1="34" x2="176" y2="4" strokeWidth={3} style={{ stroke: C.ink }} />
          <path d="M176 4 L198 12 L176 20 Z" style={{ fill: C.accent }} />
        </g>
        <g className="nxt-float-delay">
          <Card x={112} y={96} w={78} h={40} r={10} />
          <Flag x={120} y={106} width={18} height={18} style={{ color: C.accent }} />
          <Bar x={144} y={110} w={36} color={C.ink} />
          <Bar x={144} y={120} w={24} />
        </g>
      </>
    )}
    {kind === 'resources' && (
      <>
        <rect x="44" y="104" width="90" height="16" rx="4" style={{ fill: C.blue }} />
        <rect x="52" y="88" width="80" height="16" rx="4" style={{ fill: C.accent }} />
        <rect x="40" y="72" width="86" height="16" rx="4" style={{ fill: C.lavender }} />
        <BookOpen x={60} y={40} width={30} height={30} style={{ color: C.inkSoft }} />
        <g className="nxt-float">
          <Card x={110} y={24} w={76} h={56} r={10} />
          <PlayCircle x={134} y={36} width={28} height={28} style={{ color: C.accent }} />
        </g>
        <g className="nxt-float-delay">
          <circle cx="160" cy="112" r="20" style={{ fill: C.surface, stroke: C.line }} strokeWidth={1.5} />
          <Hospital x={149} y={101} width={22} height={22} style={{ color: C.lavender }} />
        </g>
      </>
    )}
    {kind === 'funds' && (
      <>
        {[0, 1, 2, 3].map(i => (
          <ellipse key={i} cx="70" cy={118 - i * 12} rx="28" ry="9" style={{ fill: i === 3 ? C.accent : C.accentSoft, stroke: C.accent }} strokeWidth={2} />
        ))}
        <g className="nxt-float">
          <Card x={104} y={30} w={84} h={96} r={12} />
          {[40, 58, 30, 72].map((h, i) => (
            <rect key={i} x={116 + i * 17} y={112 - h} width="11" height={h} rx="3" style={{ fill: i === 3 ? C.accent : C.line }} />
          ))}
          <TrendingUp x={160} y={38} width={20} height={20} style={{ color: C.accent }} />
        </g>
      </>
    )}
    {kind === 'dashboard' && (
      <>
        <Card x={30} y={30} w={140} h={96} r={14} />
        <Bar x={44} y={44} w={50} color={C.ink} />
        {[26, 44, 34, 58, 48].map((h, i) => (
          <rect key={i} x={46 + i * 16} y={110 - h} width="10" height={h} rx="3" style={{ fill: i === 3 ? C.accent : C.line }} />
        ))}
        <g className="nxt-float">
          <circle cx="148" cy="80" r="20" fill="none" strokeWidth={6} style={{ stroke: C.line }} />
          <circle cx="148" cy="80" r="20" fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray="126" strokeDashoffset="40" transform="rotate(-90 148 80)" style={{ stroke: C.accent }} />
        </g>
      </>
    )}
    {kind === 'analytics' && (
      <>
        <Card x={26} y={34} w={104} h={90} r={12} />
        <BarChart3 x={40} y={48} width={20} height={20} style={{ color: C.accent }} />
        {[20, 36, 28, 50].map((h, i) => (
          <rect key={i} x={44 + i * 20} y={112 - h} width="12" height={h} rx="3" style={{ fill: i === 3 ? C.accent : C.line }} />
        ))}
        <g className="nxt-float">
          <circle cx="152" cy="62" r="30" style={{ fill: C.surface, stroke: C.line }} strokeWidth={1.5} />
          <path d="M152 62 L152 32 A30 30 0 0 1 180 72 Z" style={{ fill: C.accent }} />
          <path d="M152 62 L180 72 A30 30 0 0 1 132 84 Z" style={{ fill: C.blue }} />
        </g>
      </>
    )}
    {kind === 'login' && (
      <>
        <Card x={40} y={30} w={120} h={96} r={14} />
        <circle cx="100" cy="64" r="18" style={{ fill: C.accentSoft }} />
        <Stethoscope x={88} y={52} width={24} height={24} style={{ color: C.accent }} />
        <Bar x={62} y={94} w={76} color={C.ink} />
        <Bar x={72} y={106} w={56} />
        <g className="nxt-float">
          <circle cx="164" cy="40" r="16" style={{ fill: C.surface, stroke: C.line }} strokeWidth={1.5} />
          <Microscope x={155} y={31} width={18} height={18} style={{ color: C.blue }} />
        </g>
        <g className="nxt-float-delay">
          <circle cx="38" cy="116" r="16" style={{ fill: C.surface, stroke: C.line }} strokeWidth={1.5} />
          <FileText x={29} y={107} width={18} height={18} style={{ color: C.lavender }} />
        </g>
      </>
    )}
    {kind === 'locked' && (
      <>
        <Card x={50} y={40} w={100} h={80} r={14} />
        <circle cx="100" cy="80" r="22" style={{ fill: C.peachSoft }} />
        <Lock x={88} y={68} width={24} height={24} style={{ color: C.peach }} />
      </>
    )}
  </svg>
);
