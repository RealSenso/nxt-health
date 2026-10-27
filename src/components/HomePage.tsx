import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Layers,
  Lock,
  Unlock,
  Stethoscope,
  Activity,
  FileText,
  Users,
  Building2,
  Hospital,
  Briefcase,
  Zap,
  ChevronRight,
  X,
  Compass,
  TrendingUp,
  BadgeCheck,
  Globe2,
} from 'lucide-react';
import { store } from '../services/store';
import { PublicLayout } from './public/PublicLayout';
import { InquiryForm, LeadRole } from './public/InquiryForm';
import { BlogCard } from './public/BlogPages';
import type { Startup } from '../types';
import { OneInFive, Rise } from './public/HomeSections';
import { scrollToId } from './public/smoothScroll';
import { Btn, Eyebrow, H1, H2, RuleList } from './public/ui';

/* =========================================================================
   CANVAS 1: CONNECTED CONSTELLATION PARTICLES (MIDNIGHT MEDIA SIGNATURE)
   ========================================================================= */
const HeroConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pts: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
    };

    const init = () => {
      pts = [];
      const count = Math.min(Math.floor((c.width * c.height) / 14000), 70);
      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.6,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);

      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    const handleResize = () => {
      resize();
      init();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

/* =========================================================================
   CANVAS 2: 3D DRAGGABLE WIREFRAME GLOBE (MIDNIGHT MEDIA PRESENCE ENGINE)
   ========================================================================= */
const Interactive3DGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0, R = 0;
    let rotX = 0.25, rotY = 0;
    let dragging = false;
    let lastX = 0, lastY = 0;
    let velX = 0;
    const velY = 0.003;

    // Major clinical healthcare innovation hubs
    const clinicalHubs = [
      { lat: 18.9, lon: 72.8, label: 'Mumbai Hub' },
      { lat: 28.6, lon: 77.2, label: 'Delhi AIIMS' },
      { lat: 12.9, lon: 77.6, label: 'Bengaluru Tech' },
      { lat: 17.3, lon: 78.4, label: 'Hyderabad Pharma' },
      { lat: 42.3, lon: -71.0, label: 'Boston Med' },
      { lat: 51.5, lon: -0.1, label: 'London NHS' },
      { lat: 1.3, lon: 103.8, label: 'Singapore' },
      { lat: 37.7, lon: -122.4, label: 'San Francisco' },
    ];

    const resize = () => {
      const s = Math.min(c.parentElement?.offsetWidth || 480, 480);
      c.width = s;
      c.height = s;
      W = s;
      H = s;
      R = s * 0.42;
    };

    const latLonTo3D = (lat: number, lon: number) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lon + 180) * Math.PI) / 180;
      return {
        x: R * Math.sin(phi) * Math.cos(theta),
        y: R * Math.cos(phi),
        z: R * Math.sin(phi) * Math.sin(theta),
      };
    };

    const rotate = (p: { x: number; y: number; z: number }) => {
      const { x, y, z } = p;
      const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
      const x2 = x * Math.cos(rotY) + z2 * Math.sin(rotY);
      const z3 = -x * Math.sin(rotY) + z2 * Math.cos(rotY);
      return { x: x2, y: y2, z: z3 };
    };

    const project = (p: { x: number; y: number; z: number }) => {
      const depth = (p.z + R) / (2 * R);
      return { x: W / 2 + p.x, y: H / 2 - p.y, visible: p.z > -R * 0.05, depth };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.save();

      // Atmospheric radial sphere glow
      const bodyGrad = ctx.createRadialGradient(W / 2 - R * 0.2, H / 2 - R * 0.2, 0, W / 2, H / 2, R);
      bodyGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      bodyGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.03)');
      bodyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Clip to sphere
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2);
      ctx.clip();

      // Latitude lines (horizontals)
      const N = 14, M = 28;
      for (let i = 0; i <= N; i++) {
        const lat = (i / N) * 180 - 90;
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= M * 2; j++) {
          const lon = (j / (M * 2)) * 360 - 180;
          const r = rotate(latLonTo3D(lat, lon));
          const { x, y, visible } = project(r);
          if (visible) {
            if (first) { ctx.moveTo(x, y); first = false; }
            else ctx.lineTo(x, y);
          } else {
            if (!first) {
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
            ctx.beginPath();
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Longitude lines (verticals)
      for (let j = 0; j < M; j++) {
        const lon = (j / M) * 360 - 180;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= N * 2; i++) {
          const lat = (i / (N * 2)) * 180 - 90;
          const r = rotate(latLonTo3D(lat, lon));
          const { x, y, visible } = project(r);
          if (visible) {
            if (first) { ctx.moveTo(x, y); first = false; }
            else ctx.lineTo(x, y);
          } else {
            if (!first) {
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
            ctx.beginPath();
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Draw Clinical Network Nodes
      clinicalHubs.forEach(hub => {
        const r = rotate(latLonTo3D(hub.lat, hub.lon));
        const { x, y, visible, depth } = project(r);
        if (!visible) return;

        const dotR = 2.5 + depth * 2.5;
        const alpha = 0.35 + depth * 0.65;

        // Outer beacon ring
        ctx.beginPath();
        ctx.arc(x, y, dotR * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.25})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // City Label
        ctx.fillStyle = `rgba(240, 240, 240, ${alpha})`;
        ctx.font = `${9 + depth * 2}px monospace`;
        ctx.fillText(hub.label, x + dotR + 6, y + 3);
      });

      ctx.restore();

      if (!dragging) {
        rotY += velY;
        velX *= 0.95;
      }
      rotY += velX;
      animId = requestAnimationFrame(draw);
    };

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
    };
    const onMouseUp = () => { dragging = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      velX = (e.clientX - lastX) * 0.005;
      rotY += (e.clientX - lastX) * 0.005;
      rotX += (e.clientY - lastY) * 0.003;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      lastX = e.clientX;
      lastY = e.clientY;
    };

    c.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    resize();
    draw();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      c.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing max-w-full drop-shadow-lg" />
      <p className="mt-3 text-[11px] font-mono tracking-widest uppercase text-[var(--nxt-ink-soft)] opacity-70">
        ✦ DRAG TO ROTATE GLOBAL CLINICAL NETWORK ✦
      </p>
    </div>
  );
};

/* =========================================================================
   CANVAS 3: 3D ROTATING ISOMETRIC WIREFRAME CUBE (MIDNIGHT MEDIA CORE CUBE)
   ========================================================================= */
const Rotating3DCube: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;
    let ry = 0;
    const rx = 0.42;

    const resize = () => {
      c.width = c.offsetWidth || 340;
      c.height = 320;
      W = c.width;
      H = c.height;
    };

    const words = ['DEMAND', 'CAPITAL', 'ROADMAP', 'EVIDENCE', 'FDA/CDSCO', 'SCALE'];
    const faces = [
      { verts: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], label: words[0] },
      { verts: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], label: words[1] },
      { verts: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], label: words[2] },
      { verts: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], label: words[3] },
      { verts: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], label: words[4] },
      { verts: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]], label: words[5] },
    ];
    const S = 65;

    const rotPt = (p: number[]) => {
      const [x, y, z] = p;
      const y2 = y * Math.cos(rx) - z * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z * Math.cos(rx);
      const x2 = x * Math.cos(ry) + z2 * Math.sin(ry);
      const z3 = -x * Math.sin(ry) + z2 * Math.cos(ry);
      return [x2, y2, z3];
    };

    const proj = (p: number[]) => [W / 2 + p[0] * S, H / 2 - p[1] * S];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const rfaces = faces.map(f => {
        const rv = f.verts.map(v => rotPt(v));
        const cx = (rv[0][0] + rv[1][0] + rv[2][0] + rv[3][0]) / 4;
        const cy = (rv[0][1] + rv[1][1] + rv[2][1] + rv[3][1]) / 4;
        const cz = (rv[0][2] + rv[1][2] + rv[2][2] + rv[3][2]) / 4;
        const a = rv[1][0] - rv[0][0], b = rv[1][1] - rv[0][1], c1 = rv[1][2] - rv[0][2];
        const d = rv[3][0] - rv[0][0], e = rv[3][1] - rv[0][1], ff = rv[3][2] - rv[0][2];
        const nx = b * ff - c1 * e, ny = c1 * d - a * ff, nz = a * e - b * d;
        return { rv, cx, cy, cz, nx, ny, nz, label: f.label, depth: cz };
      });

      rfaces.sort((a, b) => a.depth - b.depth);

      rfaces.forEach(f => {
        const visible = f.nz < 0;
        const alpha = visible ? 0.95 : 0;
        if (alpha < 0.01) return;

        const pts = f.rv.map(v => proj(v));
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.closePath();

        const light = 0.2 + 0.8 * Math.max(0, (f.nx * 0.3 + f.ny * 0.5 + f.nz * -0.8) / Math.sqrt(f.nx ** 2 + f.ny ** 2 + f.nz ** 2 + 0.001));
        ctx.fillStyle = `rgba(${Math.round(light * 20)}, ${Math.round(light * 35)}, ${Math.round(light * 25)}, ${alpha})`;
        ctx.fill();

        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = `700 ${S * 0.22}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const ctr = proj([f.cx, f.cy, f.cz]);
        ctx.fillText(f.label, ctr[0], ctr[1]);
      });

      ry += 0.008;
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-[320px] block" />;
};

/* =========================================================================
   MOUSE-TRACKING SPOTLIGHT CARD (MIDNIGHT MEDIA SIGNATURE INTERACTION)
   ========================================================================= */
const SpotlightCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`relative overflow-hidden bg-[var(--nxt-surface)] p-8 transition-colors duration-400 border border-[var(--nxt-line)] ${className}`}
      style={{
        backgroundImage: 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(16, 185, 129, 0.08), transparent 60%)',
      }}
    >
      {children}
    </div>
  );
};

/* =========================================================================
   MIDNIGHT MEDIA GOLD/EMERALD MARQUEE BANNER
   ========================================================================= */
const MidnightMarquee: React.FC<{ words: string[] }> = ({ words }) => {
  const repeated = [...words, ...words, ...words, ...words];
  return (
    <div className="bg-[#111111] border-y border-emerald-500/30 py-3.5 overflow-hidden select-none relative z-10">
      <div className="flex gap-8 whitespace-nowrap animate-[marquee_25s_linear_infinite]">
        {repeated.map((w, idx) => (
          <span key={idx} className="inline-flex items-center gap-6 font-mono text-xs tracking-[0.25em] uppercase text-emerald-400 font-bold">
            <span>{w}</span>
            <span className="text-[var(--nxt-ink-soft)] opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   MIDNIGHT MEDIA FLANKED EYEBROW (WITH 1px HORIZONTAL EXTENSIONS)
   ========================================================================= */
const FlankedEyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`inline-flex items-center justify-center gap-4 text-xs font-mono font-bold tracking-[0.3em] uppercase text-emerald-500 ${className}`}>
    <span className="h-[1px] w-12 bg-emerald-500/50 block" />
    <span>{children}</span>
    <span className="h-[1px] w-12 bg-emerald-500/50 block" />
  </div>
);

/* =========================================================================
   DATA DEFINITIONS
   ========================================================================= */
const AUDIENCES = [
  {
    id: 'who-founders',
    n: '01',
    role: 'Prospective Founders & Builders',
    title: 'Stop guessing market fit. Build with guaranteed demand.',
    intro: 'You bring the execution and technical vision. We give you validated, funded clinical problems and the exact execution pathway to bring them to market.',
    points: [
      'Tailored Roadmaps: A commercial pathway built specifically for your product type and target market.',
      'Stage-Matched Guidance: Connect with specialized experts at the exact moment your venture encounters a friction point.',
      'Unfiltered Platform Support: Get direct, private answers to critical strategic, operational, and structural questions.',
    ],
    cta: 'Join Free & Explore',
    to: '/signup',
  },
  {
    id: 'who-pharma',
    n: '02',
    role: 'Pharma Companies & Enterprise Innovators',
    title: 'Fund a solved challenge, not an unvalidated pitch.',
    intro: 'Define the high-value clinical problem. We deploy screened, execution-focused founder teams who deliver evidence at every stage-gate.',
    points: [
      'Low-Risk Pilot Capital: Initiate engagement with targeted innovation grants.',
      'Full Stage-Gate Transparency: Track team progress, evidence submissions, and milestone completion in real time.',
      'De-Risked Dealflow: Build a scalable solution pipeline with built-in co-investment options.',
    ],
    cta: 'Seed a Challenge',
    to: '/?as=pharma#start',
  },
  {
    id: 'who-hospitals',
    n: '03',
    role: 'Hospitals & Health Systems',
    title: 'Turn daily clinical friction into institutional revenue.',
    intro: 'List the real-world operational and clinical challenges your physicians face. Leverage existing research infrastructure to validate solutions and open new revenue channels.',
    points: [
      'Targeted Problem Solving: Dedicated teams building solutions specifically for your frontline needs.',
      'Asset Optimization: Run validation studies using existing research and clinical capacity.',
      'Direct Commercial Revenue: Create a recurring revenue line for your research wing and clinical departments.',
    ],
    cta: 'List a Problem',
    to: '/?as=hospital#start',
  },
  {
    id: 'who-experts',
    n: '04',
    role: 'Domain Experts & Advisors',
    title: 'Monetize your specialized industry experience.',
    intro: 'Founders encounter regulatory, clinical, and commercial roadblocks you’ve already solved. Connect with teams at the precise stage where your knowledge moves the needle.',
    points: [
      'Flexible Engagement: Set your custom hourly rate, from pro bono mentoring to high-value consulting.',
      'Precision Matching: Get routed to founders only when they reach the exact milestone you specialize in.',
      'Seamless Platform Delivery: Integrated booking, video conferencing, and direct communication built right in.',
    ],
    cta: 'Become an Expert',
    to: '/experts/join',
  },
  {
    id: 'who-incubators',
    n: '05',
    role: 'Incubators & Accelerators',
    title: 'De-risk your cohort by introducing the buyer on Day 1.',
    intro: 'Instead of helping founders search for market fit at graduation, give them access to problems that pharma and hospitals have already funded.',
    points: [
      'Built-In Market Demand: Provide your cohort with access to pre-funded clinical needs.',
      'Structured Progress Tracking: Utilize standardized roadmaps and evidence gates across your entire portfolio.',
      'Program Integration: Get recommended to founder teams at the exact development stage where your curriculum adds value.',
    ],
    cta: 'Partner as an Incubator',
    to: '/?as=incubator#start',
  },
  {
    id: 'who-us',
    n: '06',
    role: 'Global Companies Entering the US Market',
    title: 'Execute a proven GTM route, not a high-risk guess.',
    intro: 'Navigate US healthcare expansion with a structured, regulatory-compliant roadmap backed by vetted FDA and commercialization veterans.',
    points: [
      'US-Specific Roadmaps: Step-by-step guidance covering FDA pathways, reimbursement, and health system procurement.',
      'Vetted GTM Experts: Book advisors who have successfully cleared FDA hurdles and sold into US hospital networks.',
      'De-Risked Market Entry: Validate local demand and commercial viability before committing heavy launch capital.',
    ],
    cta: 'Plan US Expansion',
    to: '/?as=us#start',
  },
];

const PLATFORM_PILLARS = [
  {
    number: '01',
    title: 'Validated Problem Library',
    tag: 'Clinical Demand',
    icon: Stethoscope,
    text: 'Explore an active index of funded clinical challenges sourced directly from pharma partners and health systems, complete with requirements, scope, and target outcomes.',
  },
  {
    number: '02',
    title: 'Streamlined Funding Applications',
    tag: 'Dedicated Grants',
    icon: FileText,
    text: 'Submit your venture proposal for dedicated project capital. Benefit from structured screening protocols and direct, actionable feedback to refine resubmissions.',
  },
  {
    number: '03',
    title: 'Stage-Gate Roadmaps',
    tag: '26 Product Routes',
    icon: Layers,
    text: 'Execute against pre-mapped development blueprints tailored to your specific product type. Featuring explicit milestones, regulatory checkpoints, and fixed deadlines.',
  },
  {
    number: '04',
    title: 'Precision Expert Matching',
    tag: 'Verified Specialists',
    icon: Users,
    text: 'Instantly connect with vetted industry advisors. Book stage-matched consulting sessions with integrated scheduling, payment, and private communication tools.',
  },
  {
    number: '05',
    title: 'Collaborative Team Workspace',
    tag: 'Execution Engine',
    icon: Briefcase,
    text: 'Centralize your startup operations. Onboard co-founders and team members while maintaining a real-time, shared execution log.',
  },
  {
    number: '06',
    title: 'Sponsor Progress View',
    tag: 'Transparent Gates',
    icon: ShieldCheck,
    text: 'Give funding partners and enterprise sponsors real-time visibility into your venture’s stage-gate progression and evidence verification.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Problem Selection',
    body: 'Start with verified, high-value clinical needs sourced from frontline healthcare.',
    deliverable: 'Clinical Need Specification & Scope Validation Document',
    gatekeeper: 'Practicing Clinical Specialists',
  },
  {
    num: '02',
    title: 'Capital Matching',
    body: 'Lock in dedicated funding attached directly to the healthcare challenge.',
    deliverable: 'Approved Milestone Grant & Tranche Disbursement Schedule',
    gatekeeper: 'Pharma / Hospital Investment Committee',
  },
  {
    num: '03',
    title: 'Tailored Roadmap',
    body: 'Set a clear commercial route tailored to clinical, legal, and operational realities.',
    deliverable: 'CDSCO / FDA Regulatory Classification & Verification Protocol',
    gatekeeper: 'Regulatory & Quality Affairs Advisors',
  },
  {
    num: '04',
    title: 'Stage-Gated Execution',
    body: 'Deliver required evidence against fixed deadlines. Clear the gate to unlock the next tranche of capital and progress.',
    deliverable: 'Verified Bench Data, IRB Ethics Approval, or Pilot Trial Dataset',
    gatekeeper: 'Institutional Review & Peer Audit',
  },
  {
    num: '05',
    title: 'Target Acceleration',
    body: 'Access specialized advisor networks, from clinical trials to hospital procurement, to drive market entry.',
    deliverable: 'Live Clinical Adoption, Hospital Pilot Tender, & Expansion Capital',
    gatekeeper: 'Hospital Procurement & Clinical Chairs',
  },
];

const asRole = (value: string | null): LeadRole => {
  switch (value) {
    case 'hospital': case 'incubator': case 'us': case 'founder': case 'pharma': return value;
    default: return 'pharma';
  }
};

export const HomePage: React.FC = () => {
  const [params] = useSearchParams();
  const categories = store.getCategories();
  const routeCount = categories.length || 26;
  const initialRole = asRole(params.get('as'));
  const site = store.getSite();
  const blogs = store.getBlogs().filter(b => b.status === 'published').slice(0, 3);
  const startups = store.getStartups();

  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  return (
    <PublicLayout variant="home">
      {/* 1. HERO SECTION WITH MIDNIGHT MEDIA CONSTELLATION CANVAS & PULSE SCROLL */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 overflow-hidden border-b border-[var(--nxt-line)]">
        {/* Midnight Media Signature Constellation Particle Web */}
        <HeroConstellation />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Flanked Eyebrow */}
          <Rise>
            <FlankedEyebrow>
              Validated Clinical Demand · Dedicated Funding
            </FlankedEyebrow>
          </Rise>

          {/* Monumental Headline */}
          <Rise delay={0.06}>
            <h1 className="font-display font-light text-[clamp(2.5rem,6vw,5rem)] tracking-[0.06em] uppercase leading-[1.06] mt-8 mb-6">
              Doctors identify the real-world problems.{' '}
              <em className="italic text-emerald-500 font-normal">You bring the solutions.</em>
            </h1>
          </Rise>

          {/* Subtitle */}
          <Rise delay={0.12}>
            <p className="max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] text-[var(--nxt-ink-soft)] leading-relaxed mb-10">
              {site.hero_subtitle || 'NXT Health pairs validated, funded clinical problems with ambitious founders, providing a structured, end-to-end pathway from challenge to commercial launch.'}
            </p>
          </Rise>

          {/* Action Buttons */}
          <Rise delay={0.18}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Btn
                to="/problems"
                size="md"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold tracking-widest uppercase px-8 shadow-lg"
              >
                Claim a Problem <ArrowRight className="w-4 h-4 ml-1" />
              </Btn>
              <Btn
                variant="outline"
                to="/#start"
                size="md"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-mono tracking-widest uppercase px-8"
              >
                Fund a Challenge
              </Btn>
            </div>
          </Rise>

          {/* Midnight Media Signature Scroll Hint Indicator */}
          <Rise delay={0.24}>
            <div className="flex flex-col items-center gap-2 mt-16 select-none opacity-60 hover:opacity-100 transition-opacity">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[var(--nxt-ink-soft)] uppercase">
                SCROLL TO EXPLORE
              </span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500 to-transparent animate-pulse" />
            </div>
          </Rise>
        </div>
      </section>

      {/* MIDNIGHT MEDIA MARQUEE RIBBON */}
      <MidnightMarquee
        words={[
          'DOCTORS IDENTIFY',
          'AMBITIOUS BUILDERS',
          'GUARANTEED DEMAND',
          'MILESTONE CAPITAL',
          '26 GTM ROADMAPS',
          'HOSPITAL PILOTS',
        ]}
      />

      {/* 2. THE PARADIGM SHIFT: SPOTLIGHT DUAL GRID */}
      <section className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)]">
        <Rise>
          <FlankedEyebrow>The Paradigm Shift</FlankedEyebrow>
          <H2 className="text-center mt-4 max-w-3xl mx-auto">
            Others launch startups in a vacuum. We connect ambitious founders with the real-world clinical challenges healthcare is waiting to solve.
          </H2>
        </Rise>

        {/* 1px Gap Grid with Midnight Spotlight Effect */}
        <div className="mt-16 grid md:grid-cols-2 gap-[1px] bg-[var(--nxt-line)] border border-[var(--nxt-line)]">
          {/* Traditional Route */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--nxt-peach-deep)] font-bold uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" /> THE TRADITIONAL ROUTE
              </p>
              <h3 className="font-display font-light text-2xl sm:text-3xl tracking-wide uppercase mb-4">
                Build first. Search for buyers later.
              </h3>
              <p className="text-[var(--nxt-ink-soft)] leading-relaxed text-[15px] mb-8">
                Founders build a product, craft a pitch deck, and hunt for market fit, wasting critical time and capital on unvalidated ideas.
              </p>

              <div className="space-y-3 pt-6 border-t border-[var(--nxt-line)]">
                <div className="flex items-start gap-3 text-sm text-[var(--nxt-ink-soft)]">
                  <span className="text-red-500 font-mono font-bold">✕</span>
                  <span>Building in a market vacuum without frontline validation</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[var(--nxt-ink-soft)]">
                  <span className="text-red-500 font-mono font-bold">✕</span>
                  <span>Burning capital searching for pilot access and hospital partners</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[var(--nxt-ink-soft)]">
                  <span className="text-red-500 font-mono font-bold">✕</span>
                  <span>Over 90% venture mortality from lack of genuine buyer demand</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--nxt-line)] text-xs font-mono uppercase tracking-wider text-[var(--nxt-ink-soft)]">
              OUTCOME // CAPITAL EXHAUSTED BEFORE MARKET FIT
            </div>
          </SpotlightCard>

          {/* NXT Route */}
          <SpotlightCard className="flex flex-col justify-between bg-[#0a0a0a] text-white">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-400 font-bold uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> THE NXT ROUTE
              </p>
              <h3 className="font-display font-light text-2xl sm:text-3xl tracking-wide uppercase mb-4 text-white">
                <em className="text-emerald-400 not-italic font-normal">Start</em> with guaranteed demand.
              </h3>
              <p className="text-white/80 leading-relaxed text-[15px] mb-8">
                Doctors and Industry define the clinical problem and fund the solution. NXT Health matches ambitious founders with validated challenges, capital, and the end-to-end support needed to launch.
              </p>

              <div className="space-y-3 pt-6 border-t border-white/10">
                <div className="flex items-start gap-3 text-sm text-white/85">
                  <span className="text-emerald-400 font-mono font-bold">✓</span>
                  <span>Clinicians and industry leaders define verified problem statements</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/85">
                  <span className="text-emerald-400 font-mono font-bold">✓</span>
                  <span>Non-dilutive challenge grant capital locked to clear milestone gates</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/85">
                  <span className="text-emerald-400 font-mono font-bold">✓</span>
                  <span>Step-by-step regulatory, evidence, and hospital procurement pathway</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> OUTCOME // PRE-COMMITTED BUYERS & PILOTS
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* 3. 1 IN 5 CLINICAL REALITY */}
      <section className="relative">
        <OneInFive
          stat="1 in 5"
          headline="doctors encounters a critical clinical problem every day and waits for someone to solve it."
          subtitle="NXT Health captures these frontline pains, validates them with industry funding, and connects them to ambitious founders ready to build the solution."
        />
      </section>

      {/* 4. HOW IT WORKS (MIDNIGHT MEDIA ACCORDION LIST + 3D CUBE VISUALIZER) */}
      <section id="how-it-works" className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)] scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto">
          <Rise>
            <FlankedEyebrow>Execution Architecture</FlankedEyebrow>
            <H2 className="mt-4">How It Works</H2>
            <p className="mt-3 text-[var(--nxt-ink-soft)] text-lg">
              A structured, milestone-driven pathway engineered to eliminate startup risk.
            </p>
          </Rise>
        </div>

        {/* 2-Column Split: Interactive 3D Cube + Accordion */}
        <div className="mt-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
          {/* Left: 3D Rotating Cube Canvas */}
          <div className="rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-8 text-center flex flex-col items-center justify-center">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-emerald-500 font-bold mb-2">
              ✦ STAGE-GATE RELAY ENGINE ✦
            </p>
            <Rotating3DCube />
            <p className="text-xs text-[var(--nxt-ink-soft)] font-mono mt-4">
              Real-time evidence verification across 5 milestone phases
            </p>
          </div>

          {/* Right: Midnight Media Style Accordion List */}
          <div className="divide-y divide-[var(--nxt-line)] border-y border-[var(--nxt-line)]">
            {STEPS.map((s, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div key={s.num} className="transition-colors">
                  <div
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    className="py-6 flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-6">
                      <span className="font-mono text-xs tracking-wider text-emerald-500 font-bold">
                        {s.num}
                      </span>
                      <h3 className="font-display font-light text-xl tracking-wide uppercase group-hover:text-emerald-500 transition-colors">
                        {s.title}
                      </h3>
                    </div>

                    <div className={`w-8 h-8 rounded-sm border border-[var(--nxt-line)] flex items-center justify-center transition-all ${
                      isOpen ? 'border-emerald-500 bg-emerald-500 text-black' : 'group-hover:border-emerald-500'
                    }`}>
                      <span className={`text-base font-mono transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="pb-8 pl-12 pr-4 text-sm text-[var(--nxt-ink-soft)] leading-relaxed">
                      <p className="text-base text-[var(--nxt-ink)] mb-4">{s.body}</p>
                      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--nxt-line)]">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-500 font-bold">
                            Required Deliverable:
                          </p>
                          <p className="text-xs text-[var(--nxt-ink)] mt-0.5">{s.deliverable}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-500 font-bold">
                            Gate Audit:
                          </p>
                          <p className="text-xs text-[var(--nxt-ink)] mt-0.5">{s.gatekeeper}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHO IT'S FOR (MIDNIGHT MEDIA 1px SPOTLIGHT SERVICES GRID) */}
      <section id="who-its-for" className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)] scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Rise>
            <FlankedEyebrow>Stakeholder Ecosystem</FlankedEyebrow>
            <H2 className="mt-4">Who It's For</H2>
            <p className="mt-3 text-[var(--nxt-ink-soft)] text-lg">
              Aligning validated healthcare demand with the builders, experts, and capital to scale.
            </p>
          </Rise>
        </div>

        {/* 1px Gap Midnight Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[var(--nxt-line)] border border-[var(--nxt-line)]">
          {AUDIENCES.map(a => (
            <SpotlightCard key={a.id} className="flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-emerald-500 font-bold tracking-widest">
                    {a.n}
                  </span>
                  <div className="w-8 h-8 rounded-sm border border-[var(--nxt-line)] group-hover:border-emerald-500 group-hover:bg-emerald-500 flex items-center justify-center transition-all">
                    <ArrowUpRight className="w-4 h-4 text-[var(--nxt-ink-soft)] group-hover:text-black transition-colors" />
                  </div>
                </div>

                <p className="font-mono text-[11px] tracking-wider uppercase text-[var(--nxt-ink-soft)] mb-2 font-bold">
                  {a.role}
                </p>
                <h3 className="font-display font-light text-xl tracking-wide uppercase mb-3 group-hover:text-emerald-500 transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed mb-6">
                  {a.intro}
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-[var(--nxt-line)] text-xs text-[var(--nxt-ink-soft)]">
                  {a.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 shrink-0">✦</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Btn
                  to={a.to}
                  full
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs tracking-widest uppercase border-[var(--nxt-line)] hover:border-emerald-500 hover:text-emerald-500"
                >
                  {a.cta}
                </Btn>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 6. GLOBAL CLINICAL PRESENCE (MIDNIGHT MEDIA 3D GLOBE SECTION) */}
      <section className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)] text-center">
        <Rise>
          <FlankedEyebrow>Global Clinical Network</FlankedEyebrow>
          <H2 className="mt-4">From Frontline Hospital to Global Launch</H2>
          <p className="mt-3 text-[var(--nxt-ink-soft)] max-w-xl mx-auto text-base">
            Connecting clinical challenges across premier medical research centers, hospital systems, and global regulatory jurisdictions.
          </p>
        </Rise>

        <div className="mt-12">
          <Interactive3DGlobe />
        </div>
      </section>

      {/* 7. WHAT'S INSIDE THE PLATFORM (MIDNIGHT MEDIA ARCHITECTURAL GRID) */}
      <section className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Rise>
            <FlankedEyebrow>Product Suite</FlankedEyebrow>
            <H2 className="mt-4">What's Inside the Platform</H2>
            <p className="mt-3 text-[var(--nxt-ink-soft)] text-lg">
              End-to-end tooling engineered to take medical startups from problem statement to commercial adoption.
            </p>
          </Rise>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[var(--nxt-line)] border border-[var(--nxt-line)]">
          {PLATFORM_PILLARS.map(item => (
            <SpotlightCard key={item.title} className="flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 border border-[var(--nxt-line)] group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                    <item.icon className="w-5 h-5 text-emerald-500" />
                  </span>
                  <span className="font-mono text-xs text-[var(--nxt-ink-soft)] font-bold">
                    {item.number}
                  </span>
                </div>

                <h3 className="font-display font-light text-lg tracking-wide uppercase mb-2 group-hover:text-emerald-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed">
                  {item.text}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--nxt-line)] flex items-center justify-between font-mono text-[11px] text-[var(--nxt-ink-soft)]">
                <span className="text-emerald-500 font-bold">✦ {item.tag}</span>
                <span className="group-hover:translate-x-1 transition-transform">EXPLORE →</span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 8. STARTUPS WORKING WITH US */}
      {site.show_startups && startups.length > 0 && (
        <section id="startups" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <FlankedEyebrow>Active Cohort</FlankedEyebrow>
            <H2 className="mt-4">Companies Taking Problems to Patients</H2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map(s => <StartupCard key={s.id} startup={s} />)}
          </div>
        </section>
      )}

      {/* 9. PRICING & ACCESS TIERS */}
      <section id="pricing" className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)] scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Rise>
            <FlankedEyebrow>Transparent Pricing</FlankedEyebrow>
            <H2 className="mt-4">Free to Start. At Cost to Build.</H2>
            <p className="mt-3 text-[var(--nxt-ink-soft)] text-lg">
              Founders join free and pay at cost once they are ready to build.
            </p>
          </Rise>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <PriceCard
            label="Community"
            price="Free"
            note="always · open to everyone"
            points={[
              'Problem headlines & clinical briefs',
              'Founder town hall access',
              'Starter regulatory & incorporation guides',
              'Community Slack & peer network',
            ]}
            cta="Join Free"
            to="/signup"
            outline
          />

          <PriceCard
            label="Founder Member"
            price="₹2,000"
            note="per month · about $22 · at cost"
            points={[
              'Full clinical problem statements & data',
              'Apply for funded challenge grants',
              'Complete 26-route stage-gate roadmaps',
              'Multi-seat co-founder workspace & notes',
            ]}
            cta="Become a Member"
            to="/signup"
            featured
          />

          <PriceCard
            label="Dedicated Project Support"
            price="₹22,500"
            note="per month · about $250 · optional add-on"
            points={[
              'Dedicated project coordinator on your roadmap',
              'Assisted hospital pilot & trial submissions',
              'Vetted mentor session matching',
              'Direct regulatory liaison review',
            ]}
            cta="Talk to Us"
            to="/?as=founder#start"
            outline
          />
        </div>
      </section>

      {/* 10. SPONSORSHIP FOR PHARMA & HOSPITALS */}
      <section id="pricing-pharma" className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)] scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FlankedEyebrow>For Enterprise & Health Systems</FlankedEyebrow>
          <H2 className="mt-4">Start with One Problem. Grow into a Scalable Pipeline.</H2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <PriceCard
            label="Seed a Problem"
            price="₹5–10 lakh"
            note="one grant · about $6–11K · plus 15% management"
            points={[
              'One validated clinical problem challenge',
              'Screened founder teams & execution protocol',
              'Transparent gate-by-gate progress view',
            ]}
            cta="Seed a Problem"
            to="/?as=pharma#start"
            featured
          />
          <PriceCard
            label="Annual Sponsor"
            price="₹45 lakh"
            note="per year · about $50K"
            points={[
              'Two funded clinical problems per year',
              'Validation at your site or partner hospital network',
              'Quarterly pipeline executive briefings',
              'Keynote slot at founder symposiums',
            ]}
            cta="Contact Enterprise"
            to="/?as=pharma#start"
            outline
          />
          <PriceCard
            label="Co-Invest Partner"
            price="₹90 lakh"
            note="per year · about $100K"
            points={[
              'Everything in Annual Sponsor',
              'Pro-rata co-investment rights in cohort winners',
              'First-look licensing & commercial rights',
            ]}
            cta="Partner with Us"
            to="/?as=pharma#start"
            outline
          />
        </div>
      </section>

      {/* 11. BLOG / CONTENT */}
      {site.show_blogs && blogs.length > 0 && (
        <section id="blog" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <FlankedEyebrow>Insights & Dispatches</FlankedEyebrow>
              <H2 className="mt-4">Ideas for People Building Health</H2>
            </div>
            <Btn variant="outline" to="/blog" className="font-mono text-xs tracking-wider uppercase border-[var(--nxt-line)]">
              All Posts
            </Btn>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* 12. FINAL CALL TO ACTION (MIDNIGHT MEDIA HIGH-CONTRAST INTAKE) */}
      <section id="start" className="bg-[#050505] text-white py-24 sm:py-32 scroll-mt-16 relative overflow-hidden border-t border-emerald-500/20">
        <div className="nxt-container grid gap-12 lg:grid-cols-2 lg:gap-20 items-start relative z-10">
          <div>
            <FlankedEyebrow>Commence Today</FlankedEyebrow>
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-wide uppercase leading-tight mt-6">
              Put capital behind a real clinical need or claim one to scale.
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
              Fund a clinical challenge to deploy screened founder teams or join free to build with guaranteed demand from day one.
            </p>

            <div className="mt-10 space-y-4 pt-8 border-t border-white/10 max-w-lg text-sm text-white/80">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Zero equity taken on non-dilutive challenge grants</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Verified frontline physicians guiding technical product specs</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Full stage-gate transparency for funding partners</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] text-white p-8 sm:p-10 border border-emerald-500/30 shadow-2xl">
            <h3 className="font-display font-light text-2xl tracking-wide uppercase mb-2">
              Start with NXT Health
            </h3>
            <p className="text-xs text-[var(--nxt-ink-soft)] font-mono mb-6">
              ✦ CLINICAL INNOVATION TEAM // 24-HOUR RESPONSE ✦
            </p>
            <InquiryForm kind="lead" initialRole={initialRole} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

const StartupCard: React.FC<{ startup: Startup }> = ({ startup }) => {
  const body = (
    <>
      <div className="flex items-center gap-4">
        {startup.logo_url
          ? <img src={startup.logo_url} alt="" className="w-14 h-14 object-contain border border-[var(--nxt-line)] bg-white p-1.5" loading="lazy" />
          : <div className="w-14 h-14 bg-[#111] text-white font-display font-light text-xl flex items-center justify-center border border-white/20" aria-hidden="true">{startup.name.slice(0, 1).toUpperCase()}</div>}
        <div className="min-w-0">
          <h3 className="font-display font-light text-lg tracking-wide uppercase leading-tight">{startup.name}</h3>
          <p className="text-[12px] font-mono text-[var(--nxt-ink-soft)] mt-0.5">{[startup.sector, startup.stage, startup.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {startup.tagline && <p className="mt-4 font-semibold text-sm">{startup.tagline}</p>}
      {startup.description && <p className="mt-2 text-xs text-[var(--nxt-ink-soft)] leading-relaxed line-clamp-3">{startup.description}</p>}
    </>
  );
  const cls = 'block border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 hover:border-emerald-500 transition-colors';
  return startup.website
    ? <a href={startup.website} target="_blank" rel="noreferrer" className={cls}>{body}</a>
    : <article className={cls}>{body}</article>;
};

const PriceCard: React.FC<{
  label: string; price: string; note: string; points: string[]; cta: string; to: string; featured?: boolean; outline?: boolean;
}> = ({ label, price, note, points, cta, to, featured, outline }) => (
  <article className={`p-8 border flex flex-col justify-between transition-all ${
    featured
      ? 'bg-[#111111] text-white border-emerald-500 shadow-xl'
      : 'bg-[var(--nxt-surface)] border-[var(--nxt-line)]'
  }`}>
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-500 font-bold">{label}</span>
        {featured && (
          <span className="bg-emerald-500 text-black font-mono px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            RECOMMENDED
          </span>
        )}
      </div>
      <p className={`font-display font-light text-[2.75rem] leading-none tracking-tight mt-6 ${price === 'Free' ? 'text-emerald-500' : ''}`}>{price}</p>
      <p className="mt-2 text-xs font-mono text-[var(--nxt-ink-soft)]">{note}</p>
      <div className="mt-6 mb-8">
        <RuleList items={points} />
      </div>
    </div>
    {to !== '/signup' && (
      <Btn
        to={to}
        variant={outline ? 'outline' : 'solid'}
        full
        className={featured ? 'bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold tracking-widest uppercase' : 'font-mono text-xs tracking-widest uppercase border-[var(--nxt-line)]'}
      >
        {cta}
      </Btn>
    )}
  </article>
);
