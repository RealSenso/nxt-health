import React, { useState } from 'react';
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
  Cpu,
  CornerDownRight,
  BadgeCheck,
} from 'lucide-react';
import { store } from '../services/store';
import { PublicLayout } from './public/PublicLayout';
import { InquiryForm, LeadRole } from './public/InquiryForm';
import { BlogCard } from './public/BlogPages';
import type { Startup } from '../types';
import { OneInFive, Rise } from './public/HomeSections';
import { scrollToId } from './public/smoothScroll';
import { Btn, Eyebrow, H1, H2, RuleList } from './public/ui';

/**
 * 3D Interactive Tilt Card (Industrial/Physical Depth Engine)
 * Implements mathematical perspective transforms for subtle, distraction-free spatial depth.
 */
const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}> = ({ children, className = '', maxTilt = 8, scale = 1.01 }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * maxTilt, y: x * maxTilt });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1200px' }}
      className={`group ${className}`}
    >
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? scale : 1})`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  );
};

interface Audience {
  id: string;
  roleKey: LeadRole;
  who: string;
  badge: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  intro: string;
  points: React.ReactNode[];
  cta: string;
  to: string;
}

const AUDIENCES: Audience[] = [
  {
    id: 'who-founders',
    roleKey: 'founder',
    who: '1. Prospective Founders & Builders',
    badge: 'Builders',
    code: 'SEC-01',
    icon: Stethoscope,
    title: 'Stop guessing market fit. Build with guaranteed demand.',
    intro: 'You bring the execution and technical vision. We give you validated, funded clinical problems and the exact execution pathway to bring them to market.',
    points: [
      <><strong>Tailored Roadmaps:</strong> A commercial pathway built specifically for your product type and target market.</>,
      <><strong>Stage-Matched Guidance:</strong> Connect with specialized experts at the exact moment your venture encounters a friction point.</>,
      <><strong>Unfiltered Platform Support:</strong> Get direct, private answers to critical strategic, operational, and structural questions.</>,
    ],
    cta: 'Join Free & Explore',
    to: '/signup',
  },
  {
    id: 'who-pharma',
    roleKey: 'pharma',
    who: '2. Pharma Companies & Enterprise Innovators',
    badge: 'Enterprise',
    code: 'SEC-02',
    icon: Building2,
    title: 'Fund a solved challenge, not an unvalidated pitch.',
    intro: 'Define the high-value clinical problem. We deploy screened, execution-focused founder teams who deliver evidence at every stage-gate.',
    points: [
      <><strong>Low-Risk Pilot Capital:</strong> Initiate engagement with targeted innovation grants.</>,
      <><strong>Full Stage-Gate Transparency:</strong> Track team progress, evidence submissions, and milestone completion in real time.</>,
      <><strong>De-Risked Dealflow:</strong> Build a scalable solution pipeline with built-in co-investment options.</>,
    ],
    cta: 'Seed a Challenge',
    to: '/?as=pharma#start',
  },
  {
    id: 'who-hospitals',
    roleKey: 'hospital',
    who: '3. Hospitals & Health Systems',
    badge: 'Health Systems',
    code: 'SEC-03',
    icon: Hospital,
    title: 'Turn daily clinical friction into institutional revenue.',
    intro: 'List the real-world operational and clinical challenges your physicians face. Leverage existing research infrastructure to validate solutions and open new revenue channels.',
    points: [
      <><strong>Targeted Problem Solving:</strong> Dedicated teams building solutions specifically for your frontline needs.</>,
      <><strong>Asset Optimization:</strong> Run validation studies using existing research and clinical capacity.</>,
      <><strong>Direct Commercial Revenue:</strong> Create a recurring revenue line for your research wing and clinical departments.</>,
    ],
    cta: 'List a Problem',
    to: '/?as=hospital#start',
  },
  {
    id: 'who-experts',
    roleKey: 'founder',
    who: '4. Domain Experts & Advisors',
    badge: 'Advisors',
    code: 'SEC-04',
    icon: Users,
    title: 'Monetize your specialized industry experience.',
    intro: 'Founders encounter regulatory, clinical, and commercial roadblocks you’ve already solved. Connect with teams at the precise stage where your knowledge moves the needle.',
    points: [
      <><strong>Flexible Engagement:</strong> Set your custom hourly rate, from pro bono mentoring to high-value consulting.</>,
      <><strong>Precision Matching:</strong> Get routed to founders only when they reach the exact milestone you specialize in.</>,
      <><strong>Seamless Platform Delivery:</strong> Integrated booking, video conferencing, and direct communication built right in.</>,
    ],
    cta: 'Become an Expert',
    to: '/experts/join',
  },
  {
    id: 'who-incubators',
    roleKey: 'incubator',
    who: '5. Incubators & Accelerators',
    badge: 'Accelerators',
    code: 'SEC-05',
    icon: Compass,
    title: 'De-risk your cohort by introducing the buyer on Day 1.',
    intro: 'Instead of helping founders search for market fit at graduation, give them access to problems that pharma and hospitals have already funded.',
    points: [
      <><strong>Built-In Market Demand:</strong> Provide your cohort with access to pre-funded clinical needs.</>,
      <><strong>Structured Progress Tracking:</strong> Utilize standardized roadmaps and evidence gates across your entire portfolio.</>,
      <><strong>Program Integration:</strong> Get recommended to founder teams at the exact development stage where your curriculum adds value.</>,
    ],
    cta: 'Partner as an Incubator',
    to: '/?as=incubator#start',
  },
  {
    id: 'who-us',
    roleKey: 'us',
    who: '6. Global Companies Entering the US Market',
    badge: 'US Expansion',
    code: 'SEC-06',
    icon: TrendingUp,
    title: 'Execute a proven GTM route, not a high-risk guess.',
    intro: 'Navigate US healthcare expansion with a structured, regulatory-compliant roadmap backed by vetted FDA and commercialization veterans.',
    points: [
      <><strong>US-Specific Roadmaps:</strong> Step-by-step guidance covering FDA pathways, reimbursement, and health system procurement.</>,
      <><strong>Vetted GTM Experts:</strong> Book advisors who have successfully cleared FDA hurdles and sold into US hospital networks.</>,
      <><strong>De-Risked Market Entry:</strong> Validate local demand and commercial viability before committing heavy launch capital.</>,
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
    stageLabel: 'Discovery & Scope',
    body: 'Start with verified, high-value clinical needs sourced from frontline healthcare.',
    deliverable: 'Clinical Need Specification & Scope Validation Document',
    gatekeeper: 'Practicing Clinical Specialists',
    duration: '2–4 Weeks',
  },
  {
    num: '02',
    title: 'Capital Matching',
    stageLabel: 'Grant Allocation',
    body: 'Lock in dedicated funding attached directly to the healthcare challenge.',
    deliverable: 'Approved Milestone Grant & Tranche Disbursement Schedule',
    gatekeeper: 'Pharma / Hospital Investment Committee',
    duration: '1–2 Weeks',
  },
  {
    num: '03',
    title: 'Tailored Roadmap',
    stageLabel: 'Regulatory & GTM Blueprint',
    body: 'Set a clear commercial route tailored to clinical, legal, and operational realities.',
    deliverable: 'CDSCO / FDA Regulatory Classification & Verification Protocol',
    gatekeeper: 'Regulatory & Quality Affairs Advisors',
    duration: 'Phase Pre-Set',
  },
  {
    num: '04',
    title: 'Stage-Gated Execution',
    stageLabel: 'Evidence Verification',
    body: 'Deliver required evidence against fixed deadlines. Clear the gate to unlock the next tranche of capital and progress.',
    deliverable: 'Verified Bench Data, IRB Ethics Approval, or Pilot Trial Dataset',
    gatekeeper: 'Institutional Review & Peer Audit',
    duration: 'Milestone Timed',
  },
  {
    num: '05',
    title: 'Target Acceleration',
    stageLabel: 'Procurement & Scale',
    body: 'Access specialized advisor networks, from clinical trials to hospital procurement, to drive market entry.',
    deliverable: 'Live Clinical Adoption, Hospital Pilot Tender, & Expansion Capital',
    gatekeeper: 'Hospital Procurement & Clinical Chairs',
    duration: 'Commercial Scale',
  },
];

const CLINICAL_DEPTS = [
  'Cardiology',
  'Oncology',
  'Neurology',
  'Critical Care',
  'Surgical Devices',
  'Radiology & AI',
  'Women’s Health',
  'Digital Health & SaMD',
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

  const [activeStage, setActiveStage] = useState(0);
  const [activeAudienceFilter, setActiveAudienceFilter] = useState<string>('all');

  const filteredAudiences = activeAudienceFilter === 'all'
    ? AUDIENCES
    : AUDIENCES.filter(a => a.id === activeAudienceFilter);

  return (
    <PublicLayout variant="home">
      {/* 1. HERO SECTION (SWISS MODULAR GRID + 3D CLINICAL DOSSIER) */}
      <section className="relative overflow-hidden border-b border-[var(--nxt-line)] bg-gradient-to-b from-[var(--nxt-surface)] via-[var(--nxt-bg)] to-[var(--nxt-bg)] pt-12 sm:pt-20 pb-16 sm:pb-24">
        {/* Subtle architectural dot grid background */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--nxt-ink-fixed) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Structural registration mark */}
        <div className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.2em] text-[var(--nxt-ink-soft)]/50 select-none hidden sm:block">
          + NXT // 2026.04 // CLINICAL-SPEC
        </div>

        <div className="nxt-container relative z-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-14 items-center">
            {/* Left Column: Monumental Typographic Statement */}
            <div>
              {/* Technical Status Capsule */}
              <Rise>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--nxt-ink-soft)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Validated Clinical Demand · Dedicated Milestone Funding</span>
                </div>
              </Rise>

              {/* Main Headline */}
              <Rise delay={0.06}>
                <H1 className="mt-8 tracking-[-0.04em] text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.04]">
                  {site.hero_title || (
                    <>
                      Doctors identify the real-world problems.
                      <span className="block font-normal text-[var(--nxt-ink-soft)] mt-2">
                        You bring the solutions.
                      </span>
                    </>
                  )}
                </H1>
              </Rise>

              {/* Subtitle */}
              <Rise delay={0.12}>
                <p className="mt-8 max-w-xl text-[clamp(1.1rem,1.6vw,1.35rem)] leading-relaxed text-[var(--nxt-ink-soft)]">
                  {site.hero_subtitle || 'NXT Health pairs validated, funded clinical problems with ambitious founders, providing a structured, end-to-end pathway from challenge to commercial launch.'}
                </p>
              </Rise>

              {/* Action Buttons */}
              <Rise delay={0.18}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Btn to="/problems" size="md" className="gap-2.5 shadow-sm hover:shadow-md transition-shadow">
                    Claim a Clinical Problem <ArrowRight className="w-4 h-4" />
                  </Btn>
                  <Btn variant="outline" to="/#start" size="md">
                    Fund a Challenge
                  </Btn>
                  <button
                    onClick={() => scrollToId('how-it-works', 'start')}
                    className="ml-2 text-sm font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] underline underline-offset-4 transition-colors"
                  >
                    Explore the 5-Stage Pathway ↓
                  </button>
                </div>
              </Rise>
            </div>

            {/* Right Column: Interactive 3D Clinical Challenge Dossier */}
            <Rise delay={0.24} className="flex justify-center">
              <TiltCard className="w-full max-w-md" maxTilt={10}>
                <div
                  className="rounded-[24px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-7 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.05)] relative overflow-hidden"
                  style={{
                    boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 30px 60px -15px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Subtle 3D background watermark */}
                  <div
                    className="absolute -right-10 -bottom-10 opacity-5 select-none pointer-events-none"
                    style={{ transform: 'translateZ(-10px)' }}
                  >
                    <Stethoscope className="w-64 h-64 text-[var(--nxt-ink-fixed)]" />
                  </div>

                  {/* Header of Dossier (3D Layer 1) */}
                  <div className="flex items-center justify-between border-b border-[var(--nxt-line)] pb-4" style={{ transform: 'translateZ(20px)' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[var(--nxt-ink)]">
                        CLINICAL CHALLENGE #042
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      ACTIVE GRANT
                    </span>
                  </div>

                  {/* Department & Problem (3D Layer 2) */}
                  <div className="mt-5" style={{ transform: 'translateZ(35px)' }}>
                    <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--nxt-ink-soft)]">
                      DEPARTMENT OF CRITICAL CARE & CARDIOLOGY
                    </span>
                    <h4 className="font-display font-bold text-xl sm:text-2xl mt-1 tracking-tight text-[var(--nxt-ink)] leading-snug">
                      Real-Time Hemodynamic Instability Predictor in Post-Op ICU
                    </h4>
                    <p className="mt-2.5 text-xs text-[var(--nxt-ink-soft)] leading-relaxed">
                      Frontline clinicians require an edge-deployed algorithmic monitor to alert nursing teams 45 minutes prior to septic decompensation.
                    </p>
                  </div>

                  {/* Metrics & Grant (3D Layer 3) */}
                  <div
                    className="mt-6 rounded-xl border border-[var(--nxt-line)] bg-[var(--nxt-bg-soft)]/70 p-4 grid grid-cols-2 gap-4"
                    style={{ transform: 'translateZ(45px)' }}
                  >
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--nxt-ink-soft)]">Non-Dilutive Grant</p>
                      <p className="text-base font-display font-bold text-[var(--nxt-ink)] mt-0.5">₹25,00,000</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--nxt-ink-soft)]">Execution Runway</p>
                      <p className="text-base font-display font-bold text-[var(--nxt-ink)] mt-0.5">5 Milestones</p>
                    </div>
                  </div>

                  {/* Gate Relay Bar (3D Layer 4) */}
                  <div className="mt-6 pt-4 border-t border-[var(--nxt-line)]" style={{ transform: 'translateZ(30px)' }}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-[var(--nxt-ink-soft)]">Stage-Gate Validation</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gate 01 Clear · Gate 02 Live</span>
                    </div>
                    <div className="w-full bg-[var(--nxt-line)] h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full w-2/5" />
                      <div className="bg-emerald-400/40 h-full w-1/5 animate-pulse" />
                    </div>
                  </div>

                  {/* Clinical Seal (3D Layer 5) */}
                  <div className="mt-5 flex items-center justify-between" style={{ transform: 'translateZ(25px)' }}>
                    <div className="flex items-center gap-2 text-xs text-[var(--nxt-ink-soft)]">
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      <span>Institutional Review Verified</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--nxt-ink-soft)]/60">
                      ID: NXT-CARDIO-88
                    </span>
                  </div>
                </div>
              </TiltCard>
            </Rise>
          </div>

          {/* Quick Audience Jump Pills */}
          <Rise delay={0.28}>
            <div className="mt-14 pt-8 border-t border-[var(--nxt-line)]">
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--nxt-ink-soft)] mb-3">
                Jump directly to your pathway:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {AUDIENCES.map(a => (
                  <button
                    key={a.id}
                    onClick={() => scrollToId(a.id, 'center')}
                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:border-[var(--nxt-ink)] px-4 py-2 text-xs font-semibold text-[var(--nxt-ink)] transition-all hover:shadow-xs hover:-translate-y-0.5"
                  >
                    <a.icon className="w-3.5 h-3.5 text-[var(--nxt-ink-soft)] group-hover:text-[var(--nxt-ink)] transition-colors" />
                    <span>{a.who.replace(/^[0-9]+\.\s*/, '')}</span>
                  </button>
                ))}
              </div>
            </div>
          </Rise>

          {/* Live Proof & Performance Metrics Strip */}
          <Rise delay={0.34}>
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <TiltCard maxTilt={5}>
                <div className="rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 transition-all hover:shadow-sm">
                  <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[var(--nxt-ink)]">1 in 5</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Frontline Doctors</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Encounter critical unsolved pains daily</p>
                </div>
              </TiltCard>

              <TiltCard maxTilt={5}>
                <div className="rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 transition-all hover:shadow-sm">
                  <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[var(--nxt-ink)]">{routeCount}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Product Roadmaps</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Pre-mapped SaMD, hardware, AI & devices</p>
                </div>
              </TiltCard>

              <TiltCard maxTilt={5}>
                <div className="rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 transition-all hover:shadow-sm">
                  <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-emerald-600 dark:text-emerald-400">100%</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Milestone-Gated</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Capital released against verified proof</p>
                </div>
              </TiltCard>

              <TiltCard maxTilt={5}>
                <div className="rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 transition-all hover:shadow-sm">
                  <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[var(--nxt-ink)]">Day 1</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Guaranteed Demand</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Pharma & hospital sponsors pre-committed</p>
                </div>
              </TiltCard>
            </div>
          </Rise>
        </div>
      </section>

      {/* 2. THE PARADIGM SHIFT (TRADITIONAL ROUTE VS. NXT ROUTE) */}
      <section className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)] relative">
        <div className="flex items-center justify-between">
          <Rise>
            <Eyebrow>The Paradigm Shift</Eyebrow>
            <H2 className="mt-4 max-w-3xl">
              Others launch startups in a vacuum. We connect ambitious founders with the real-world clinical challenges healthcare is waiting to solve.
            </H2>
          </Rise>
          <span className="font-mono text-xs text-[var(--nxt-ink-soft)]/50 hidden md:block">
            FIG. 01 // ARCHITECTURAL DIFFERENCE
          </span>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 items-stretch">
          {/* Card A: The Traditional Route */}
          <Rise delay={0.08} className="flex">
            <TiltCard className="w-full" maxTilt={6}>
              <div className="h-full rounded-[24px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-8 sm:p-10 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-md bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    <X className="w-3.5 h-3.5" /> The Traditional Route
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl mt-6 tracking-tight">
                    Build first. Search for buyers later.
                  </h3>
                  <p className="mt-4 text-[16px] leading-relaxed text-[var(--nxt-ink-soft)]">
                    Founders build a product, craft a pitch deck, and hunt for market fit, wasting critical time and capital on unvalidated ideas.
                  </p>

                  <div className="mt-8 space-y-3 pt-6 border-t border-[var(--nxt-line)]">
                    <div className="flex items-start gap-3 text-sm text-[var(--nxt-ink-soft)]">
                      <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                      <span>Building synthetic ideas conceived in a vacuum outside clinical practice</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[var(--nxt-ink-soft)]">
                      <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                      <span>Burning pre-seed capital cold-emailing hospitals for validation trials</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[var(--nxt-ink-soft)]">
                      <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                      <span>Facing fatal regulatory, ethics, and procurement blocks after capital is spent</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--nxt-line)] text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] flex items-center justify-between">
                  <span>OUTCOME: Capital exhausted before market entry</span>
                  <span className="text-red-500 font-bold">High Risk</span>
                </div>
              </div>
            </TiltCard>
          </Rise>

          {/* Card B: The NXT Route */}
          <Rise delay={0.16} className="flex">
            <TiltCard className="w-full" maxTilt={6}>
              <div
                className="h-full rounded-[24px] bg-[#111111] text-white p-8 sm:p-10 border border-white/20 flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden"
                style={{
                  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.2), 0 30px 60px -15px rgba(0,0,0,0.3)',
                }}
              >
                {/* 3D ambient glow */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5" /> The NXT Route
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl mt-6 tracking-tight text-white">
                    <span className="text-emerald-400">Start</span> with guaranteed demand.
                  </h3>
                  <p className="mt-4 text-[16px] leading-relaxed text-white/85">
                    Doctors and Industry define the clinical problem and fund the solution. NXT Health matches ambitious founders with validated challenges, capital, and the end-to-end support needed to launch.
                  </p>

                  <div className="mt-8 space-y-3 pt-6 border-t border-white/15">
                    <div className="flex items-start gap-3 text-sm text-white/90">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                      <span>Sourced directly from hospital floors with practicing clinicians attached</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-white/90">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                      <span>Non-dilutive challenge grant capital locked to clear milestone gates</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-white/90">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                      <span>Clear clinical trial, ethics protocol, and hospital procurement pathway</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 relative z-10 flex items-center justify-between">
                  <span>OUTCOME: Guaranteed Day-1 buyer alignment</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> De-Risked</span>
                </div>
              </div>
            </TiltCard>
          </Rise>
        </div>
      </section>

      {/* 3. 1 IN 5 FRONTLINE MEDICAL REALITY */}
      <section className="relative">
        <OneInFive
          stat="1 in 5"
          headline="doctors encounters a critical clinical problem every day and waits for someone to solve it."
          subtitle="NXT Health captures these frontline pains, validates them with industry funding, and connects them to ambitious founders ready to build the solution."
        />
        {/* Department badges */}
        <div className="nxt-container pb-16 -mt-6">
          <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--nxt-ink-soft)] mb-3">
            Problems actively sourced across clinical disciplines:
          </p>
          <div className="flex flex-wrap gap-2">
            {CLINICAL_DEPTS.map(dept => (
              <span
                key={dept}
                className="rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] px-4 py-1.5 text-xs font-medium text-[var(--nxt-ink)] hover:border-[var(--nxt-ink)] transition-colors shadow-2xs"
              >
                {dept}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (ARCHITECTURAL STAGE-GATE CONTROL CONSOLE) */}
      <section id="how-it-works" className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)] scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <Rise>
            <Eyebrow>Milestone Engine</Eyebrow>
            <H2 className="mt-4 max-w-2xl">
              A structured, milestone-driven pathway engineered to eliminate startup risk.
            </H2>
          </Rise>
          <span className="font-mono text-xs text-[var(--nxt-ink-soft)]/50 hidden md:block">
            5 STAGE-GATED PHASES
          </span>
        </div>

        {/* Console View */}
        <div className="mt-14 grid lg:grid-cols-[22rem_1fr] gap-8 lg:gap-14 items-start">
          {/* Stepper Navigation */}
          <div className="space-y-2.5">
            {STEPS.map((s, idx) => {
              const isActive = activeStage === idx;
              return (
                <button
                  key={s.num}
                  onClick={() => setActiveStage(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    isActive
                      ? 'border-[var(--nxt-ink)] bg-[var(--nxt-surface)] shadow-sm -translate-y-0.5'
                      : 'border-[var(--nxt-line)]/60 bg-transparent hover:border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[var(--nxt-ink-fixed)] text-white'
                        : 'border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] bg-[var(--nxt-surface)]'
                    }`}
                  >
                    {s.num}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-[var(--nxt-ink)]' : 'text-[var(--nxt-ink-soft)]'}`}>
                      {s.title}
                    </p>
                    <p className="text-xs text-[var(--nxt-ink-soft)] mt-0.5">{s.stageLabel}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed 3D Card */}
          <TiltCard maxTilt={5}>
            <div
              className="rounded-[24px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-8 sm:p-12 relative min-h-[380px] flex flex-col justify-between shadow-[0_20px_45px_-10px_rgba(0,0,0,0.06)]"
              style={{
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), 0 24px 48px -12px rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono font-bold text-5xl sm:text-6xl text-[var(--nxt-line)] leading-none select-none">
                    {STEPS[activeStage].num}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] px-3 py-1 text-xs font-mono font-semibold text-[var(--nxt-ink-soft)]">
                      {STEPS[activeStage].duration}
                    </span>
                    <span className="rounded-full border border-[var(--nxt-ink)] bg-[var(--nxt-ink-fixed)] text-white px-3 py-1 text-xs font-mono font-semibold">
                      Phase {activeStage + 1}/5
                    </span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-2xl sm:text-3xl mt-6 tracking-tight">
                  {STEPS[activeStage].num}. {STEPS[activeStage].title}
                </h3>
                <p className="mt-4 text-base sm:text-lg text-[var(--nxt-ink-soft)] leading-relaxed max-w-2xl">
                  {STEPS[activeStage].body}
                </p>

                <div className="mt-8 pt-6 border-t border-[var(--nxt-line)] grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-[var(--nxt-ink-soft)]">
                      Mandatory Deliverable
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-[var(--nxt-ink)]">
                      {STEPS[activeStage].deliverable}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-[var(--nxt-ink-soft)]">
                      Gate Verification
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> {STEPS[activeStage].gatekeeper}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[var(--nxt-line)] flex items-center justify-between">
                <span className="text-xs text-[var(--nxt-ink-soft)] font-mono">
                  [STATUS: CLEAR GATE TO UNLOCK CAPITAL TRANCHE]
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStage === 0}
                    onClick={() => setActiveStage(s => Math.max(0, s - 1))}
                    className="rounded-lg border border-[var(--nxt-line)] px-3.5 py-1.5 text-xs font-semibold disabled:opacity-30 hover:border-[var(--nxt-ink)] transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={activeStage === STEPS.length - 1}
                    onClick={() => setActiveStage(s => Math.min(STEPS.length - 1, s + 1))}
                    className="rounded-lg border border-[var(--nxt-ink)] bg-[var(--nxt-ink-fixed)] text-white px-4 py-1.5 text-xs font-semibold disabled:opacity-30 transition-opacity"
                  >
                    Next Stage →
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* 5. WHO IT'S FOR (INTERACTIVE STAKEHOLDER MATRIX) */}
      <section id="who-its-for" className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Rise>
          <Eyebrow>Who It's For</Eyebrow>
          <H2 className="mt-4 max-w-3xl">
            Aligning validated healthcare demand with the builders, experts, and capital to scale.
          </H2>
        </Rise>

        {/* Filter bar */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-[var(--nxt-line)] pb-6">
          <button
            onClick={() => setActiveAudienceFilter('all')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              activeAudienceFilter === 'all'
                ? 'bg-[var(--nxt-ink-fixed)] text-white shadow-xs'
                : 'border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'
            }`}
          >
            All Stakeholders (6)
          </button>
          {AUDIENCES.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveAudienceFilter(a.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeAudienceFilter === a.id
                  ? 'bg-[var(--nxt-ink-fixed)] text-white shadow-xs'
                  : 'border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'
              }`}
            >
              {a.badge}
            </button>
          ))}
        </div>

        {/* 6 Audience Cards with Subtle 3D Depth */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredAudiences.map(a => (
            <TiltCard key={a.id} maxTilt={6}>
              <article
                id={a.id}
                className="h-full rounded-[24px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-8 flex flex-col justify-between scroll-mt-28 transition-all hover:border-[var(--nxt-ink)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[var(--nxt-bg-soft)] flex items-center justify-center text-[var(--nxt-ink)]">
                      <a.icon className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-[10px] text-[var(--nxt-ink-soft)] font-bold tracking-wider">
                      {a.code}
                    </span>
                  </div>

                  <p className="text-xs uppercase tracking-wider font-semibold text-[var(--nxt-ink-soft)] mt-5">
                    {a.who}
                  </p>
                  <h3 className="font-display font-bold text-xl sm:text-2xl mt-2 tracking-tight">
                    {a.title}
                  </h3>
                  <p className="mt-3.5 text-sm leading-relaxed text-[var(--nxt-ink-soft)]">
                    {a.intro}
                  </p>

                  <div className="mt-6 pt-5 border-t border-[var(--nxt-line)]">
                    <RuleList items={a.points} />
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Btn to={a.to} full variant="outline" size="sm" className="justify-between group-hover:bg-[var(--nxt-ink-fixed)] group-hover:text-white transition-all">
                    <span>{a.cta}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Btn>
                </div>
              </article>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 6. WHAT'S INSIDE THE PLATFORM (BENTO GRID WITH 3D HOVER ELEVATION) */}
      <section className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)]">
        <Rise>
          <Eyebrow>Platform Architecture</Eyebrow>
          <H2 className="mt-4">What's inside the platform</H2>
          <p className="mt-3 text-lg text-[var(--nxt-ink-soft)] max-w-2xl">
            A comprehensive infrastructure built to guide medical ventures from clinical need to hospital procurement.
          </p>
        </Rise>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_PILLARS.map((item, i) => (
            <Rise key={item.title} delay={i * 0.05} className="flex">
              <TiltCard className="w-full" maxTilt={7}>
                <div
                  className="h-full rounded-[22px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-7 flex flex-col justify-between transition-all hover:border-[var(--nxt-ink)] shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
                  style={{
                    boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 8px 24px -6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-[var(--nxt-bg-soft)] flex items-center justify-center text-[var(--nxt-ink)]">
                        <item.icon className="w-5 h-5" />
                      </span>
                      <span className="font-mono text-xs font-bold text-[var(--nxt-ink-soft)]">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg mt-5 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-[var(--nxt-ink-soft)] leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--nxt-line)] flex items-center justify-between text-xs text-[var(--nxt-ink-soft)]">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">● {item.tag}</span>
                    <span className="font-mono text-[11px] group-hover:translate-x-1 transition-transform">EXPLORE →</span>
                  </div>
                </div>
              </TiltCard>
            </Rise>
          ))}
        </div>
      </section>

      {/* 7. STARTUPS WORKING WITH US */}
      {site.show_startups && startups.length > 0 && (
        <section id="startups" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <Eyebrow>Startups working with us</Eyebrow>
          <H2 className="mt-4">Companies taking problems to patients.</H2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map(s => <StartupCard key={s.id} startup={s} />)}
          </div>
        </section>
      )}

      {/* 8. PRICING & ACCESS TIERS */}
      <section id="pricing" className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Rise>
          <Eyebrow>Pricing & Access</Eyebrow>
          <H2 className="mt-4">Free to start. At cost to build.</H2>
          <p className="mt-3 text-lg text-[var(--nxt-ink-soft)] max-w-2xl">
            Founders join free and pay at cost once they are ready to build.
          </p>
        </Rise>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
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

      {/* 9. BLOG / CONTENT */}
      {site.show_blogs && blogs.length > 0 && (
        <section id="blog" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>From the blog</Eyebrow>
              <H2 className="mt-4">Ideas for people building health.</H2>
            </div>
            <Btn variant="outline" to="/blog">All Posts</Btn>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* 10. SPONSORSHIP FOR PHARMA & HOSPITALS */}
      <section id="pricing-pharma" className="nxt-container py-20 sm:py-28 scroll-mt-20 border-b border-[var(--nxt-line)]">
        <div>
          <Eyebrow>For Pharma & Health Systems</Eyebrow>
          <h3 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mt-4 max-w-2xl">
            Start with one problem. Grow into a scalable clinical pipeline.
          </h3>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
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
        </div>
      </section>

      {/* 11. FINAL CONVERSION & LEAD INTAKE (START) */}
      <section id="start" className="bg-[#111111] text-white scroll-mt-16 relative overflow-hidden">
        {/* Ambient 3D glow */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="nxt-container py-20 sm:py-28 grid gap-12 lg:grid-cols-2 lg:gap-20 items-start relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Day 1 Guaranteed Alignment
            </div>
            <H2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-lg">
              Put capital behind a real clinical need or claim one to scale.
            </H2>
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/80 max-w-xl">
              Fund a clinical challenge to deploy screened founder teams or join free to build with guaranteed demand from day one.
            </p>

            <div className="mt-10 space-y-4 pt-8 border-t border-white/15 max-w-lg text-sm text-white/80">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Zero equity taken on challenge grants</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Verified frontline physicians guiding product specs</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Full stage-gate transparency for capital partners</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white text-[#111] p-7 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight mb-2">
              Start with NXT Health
            </h3>
            <p className="text-xs text-[var(--nxt-ink-soft)] mb-6">
              Connect with our clinical innovation team. We reply within 24 hours.
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
          ? <img src={startup.logo_url} alt="" className="w-14 h-14 rounded-xl object-contain border border-[var(--nxt-line)] bg-white p-1.5" loading="lazy" />
          : <div className="w-14 h-14 rounded-xl bg-[#111] text-white font-display font-bold text-xl flex items-center justify-center" aria-hidden="true">{startup.name.slice(0, 1).toUpperCase()}</div>}
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg tracking-[-0.02em] leading-tight">{startup.name}</h3>
          <p className="text-[13px] text-[var(--nxt-ink-soft)] mt-0.5">{[startup.sector, startup.stage, startup.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {startup.tagline && <p className="mt-4 font-semibold">{startup.tagline}</p>}
      {startup.description && <p className="mt-2 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)] line-clamp-4">{startup.description}</p>}
    </>
  );
  const cls = 'block rounded-[20px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6';
  return startup.website
    ? <a href={startup.website} target="_blank" rel="noreferrer" className={`${cls} hover:border-[var(--nxt-ink)] transition-colors`}>{body}</a>
    : <article className={cls}>{body}</article>;
};

const PriceCard: React.FC<{
  label: string; price: string; note: string; points: string[]; cta: string; to: string; featured?: boolean; outline?: boolean;
}> = ({ label, price, note, points, cta, to, featured, outline }) => (
  <TiltCard maxTilt={5}>
    <article className={`h-full rounded-[24px] border bg-[var(--nxt-surface)] p-8 flex flex-col justify-between ${featured ? 'border-[var(--nxt-ink)] ring-1 ring-[var(--nxt-ink)] shadow-md' : 'border-[var(--nxt-line)]'}`}>
      <div>
        <div className="flex items-center justify-between">
          <Eyebrow>{label}</Eyebrow>
          {featured && (
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold">
              Most Popular
            </span>
          )}
        </div>
        <p className={`font-display font-bold text-[2.75rem] leading-none tracking-[-0.04em] mt-6 ${price === 'Free' ? 'text-[#16a34a]' : ''}`}>{price}</p>
        <p className="mt-2 text-xs text-[var(--nxt-ink-soft)]">{note}</p>
        <div className="mt-6 mb-8">
          <RuleList items={points} />
        </div>
      </div>
      {to !== '/signup' && <Btn to={to} variant={outline ? 'outline' : 'solid'} full className="mt-auto">{cta}</Btn>}
    </article>
  </TiltCard>
);
