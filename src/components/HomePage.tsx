import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
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
  Flame,
  Radio,
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
 * Implements mathematical perspective transforms for subtle spatial depth.
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

/**
 * Continuous Manga / Kinetic Ticker Ribbon
 */
const MangaTicker: React.FC<{
  items: string[];
  reverse?: boolean;
  speed?: number;
  className?: string;
}> = ({ items, reverse = false, speed = 25, className = '' }) => {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className={`overflow-hidden whitespace-nowrap select-none border-y-2 border-[var(--nxt-ink)] bg-[var(--nxt-surface)] py-3 ${className}`}>
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ ease: 'linear', duration: speed, repeat: Infinity }}
        className="inline-flex items-center gap-6"
      >
        {repeated.map((text, idx) => (
          <span key={idx} className="inline-flex items-center gap-6 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase text-[var(--nxt-ink)]">
            <span>{text}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/**
 * Animated Clinical ECG Heartbeat Pulse Line
 */
const VitalPulseLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full overflow-hidden flex items-center justify-center opacity-80 ${className}`} aria-hidden="true">
    <svg className="w-full max-w-4xl h-8 stroke-emerald-500 fill-none" viewBox="0 0 1000 40">
      <motion.path
        d="M0,20 L380,20 L395,5 L410,35 L425,10 L440,28 L455,20 L1000,20"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </div>
);

/**
 * Manga Graphic Panel Container with Corner Registration Brackets
 */
const MangaPanel: React.FC<{
  children: React.ReactNode;
  chapter?: string;
  className?: string;
  invert?: boolean;
  hasShadow?: boolean;
}> = ({ children, chapter, className = '', invert = false, hasShadow = true }) => (
  <div
    className={`relative rounded-2xl border-2 border-[var(--nxt-ink)] p-7 sm:p-9 transition-all ${
      invert
        ? 'bg-[#111111] text-white'
        : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink)]'
    } ${
      hasShadow
        ? 'shadow-[5px_5px_0px_0px_var(--nxt-ink)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.85)]'
        : ''
    } ${className}`}
  >
    {/* Manga Crop Marks */}
    <span className="absolute top-2 left-2 text-[10px] font-mono select-none opacity-40">┌</span>
    <span className="absolute top-2 right-2 text-[10px] font-mono select-none opacity-40">┐</span>
    <span className="absolute bottom-2 left-2 text-[10px] font-mono select-none opacity-40">└</span>
    <span className="absolute bottom-2 right-2 text-[10px] font-mono select-none opacity-40">┘</span>

    {chapter && (
      <div className="absolute -top-3.5 left-6 bg-[var(--nxt-ink-fixed)] text-[var(--nxt-on-accent)] px-3 py-0.5 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase">
        {chapter}
      </div>
    )}

    {children}
  </div>
);

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
    code: 'EPISODE 01 // FOUNDERS',
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
    code: 'EPISODE 02 // PHARMA',
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
    code: 'EPISODE 03 // HOSPITALS',
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
    code: 'EPISODE 04 // EXPERTS',
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
    code: 'EPISODE 05 // ECOSYSTEM',
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
    code: 'EPISODE 06 // GLOBAL GTM',
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
    stageLabel: 'Frontline Clinical Validation',
    body: 'Start with verified, high-value clinical needs sourced from frontline healthcare.',
    deliverable: 'Clinical Need Specification & Scope Validation Document',
    gatekeeper: 'Practicing Clinical Specialists',
    duration: '2–4 Weeks',
  },
  {
    num: '02',
    title: 'Capital Matching',
    stageLabel: 'Attached Project Grants',
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
    stageLabel: 'Procurement & Market Entry',
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
      {/* 1. HERO CHAPTER (DYNAMIC MANGA PANEL WITH FLOATING 3D DOSSIER & ANIMATED PULSES) */}
      <section className="relative overflow-hidden border-b-2 border-[var(--nxt-ink)] bg-gradient-to-b from-[var(--nxt-surface)] via-[var(--nxt-bg)] to-[var(--nxt-bg)] pt-12 sm:pt-20 pb-16 sm:pb-24">
        {/* Subtle halftone dot matrix background */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--nxt-ink-fixed) 1.5px, transparent 1.5px)`,
            backgroundSize: '20px 20px',
          }}
          aria-hidden="true"
        />

        {/* Narrative manga chapter stamp */}
        <div className="absolute top-6 left-6 font-mono text-[11px] font-bold tracking-[0.25em] text-[var(--nxt-ink-soft)] select-none hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span>PROLOGUE // THE CLINICAL CHALLENGE INITIATIVE</span>
        </div>

        <div className="nxt-container relative z-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-14 items-center">
            {/* Left: Dynamic Monumental Typography */}
            <div>
              {/* Animated Live Status Badge */}
              <Rise>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center gap-2.5 rounded-full border-2 border-[var(--nxt-ink)] bg-[var(--nxt-surface)] px-4 py-1.5 text-xs font-bold tracking-wide text-[var(--nxt-ink)] shadow-[3px_3px_0px_0px_var(--nxt-ink)]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Validated Clinical Demand · Dedicated Milestone Funding</span>
                </motion.div>
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

              {/* Narrative Subtitle */}
              <Rise delay={0.12}>
                <p className="mt-8 max-w-xl text-[clamp(1.1rem,1.6vw,1.35rem)] leading-relaxed text-[var(--nxt-ink-soft)]">
                  {site.hero_subtitle || 'NXT Health pairs validated, funded clinical problems with ambitious founders, providing a structured, end-to-end pathway from challenge to commercial launch.'}
                </p>
              </Rise>

              {/* Dynamic Buttons with Manga Drop Shadow */}
              <Rise delay={0.18}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Btn
                    to="/problems"
                    size="md"
                    className="gap-2.5 border-2 border-[var(--nxt-ink)] shadow-[4px_4px_0px_0px_var(--nxt-ink)] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--nxt-ink)] transition-all"
                  >
                    Claim a Clinical Problem <ArrowRight className="w-4 h-4" />
                  </Btn>
                  <Btn
                    variant="outline"
                    to="/#start"
                    size="md"
                    className="border-2 border-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)] transition-colors"
                  >
                    Fund a Challenge
                  </Btn>
                  <button
                    onClick={() => scrollToId('how-it-works', 'start')}
                    className="ml-2 text-sm font-bold text-[var(--nxt-ink)] hover:underline underline-offset-4 transition-colors flex items-center gap-1 group"
                  >
                    <span>Read The 5-Stage Saga</span>
                    <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                  </button>
                </div>
              </Rise>
            </div>

            {/* Right: Floating 3D Manga Clinical Dossier */}
            <Rise delay={0.24} className="flex justify-center">
              <TiltCard className="w-full max-w-md" maxTilt={10}>
                <div
                  className="rounded-[24px] border-2 border-[var(--nxt-ink)] bg-[var(--nxt-surface)] p-7 sm:p-8 shadow-[8px_8px_0px_0px_var(--nxt-ink)] dark:shadow-[8px_8px_0px_0px_white] relative overflow-hidden"
                >
                  {/* Subtle speedline focus pattern */}
                  <div
                    className="absolute -right-12 -bottom-12 opacity-5 select-none pointer-events-none"
                    style={{ transform: 'translateZ(-10px)' }}
                  >
                    <Stethoscope className="w-72 h-72 text-[var(--nxt-ink-fixed)]" />
                  </div>

                  {/* Header of Dossier (3D Layer 1) */}
                  <div className="flex items-center justify-between border-b-2 border-[var(--nxt-line)] pb-4" style={{ transform: 'translateZ(20px)' }}>
                    <div className="flex items-center gap-2">
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                      />
                      <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[var(--nxt-ink)]">
                        FILE // CLIN-CHALLENGE #042
                      </span>
                    </div>
                    <span className="rounded-sm bg-emerald-500 text-white font-mono px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      ACTIVE GRANT
                    </span>
                  </div>

                  {/* Problem & Department (3D Layer 2) */}
                  <div className="mt-5" style={{ transform: 'translateZ(35px)' }}>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                      CRITICAL CARE & CARDIOLOGY // URGENT
                    </span>
                    <h4 className="font-display font-bold text-xl sm:text-2xl mt-1 tracking-tight text-[var(--nxt-ink)] leading-snug">
                      Real-Time Hemodynamic Instability Predictor in Post-Op ICU
                    </h4>
                    <p className="mt-2.5 text-xs text-[var(--nxt-ink-soft)] leading-relaxed">
                      Frontline clinicians require an edge-deployed algorithmic monitor to alert nursing teams 45 minutes prior to septic decompensation.
                    </p>
                  </div>

                  {/* Metrics Box (3D Layer 3) */}
                  <div
                    className="mt-6 rounded-xl border-2 border-[var(--nxt-ink)] bg-[var(--nxt-bg-soft)] p-4 grid grid-cols-2 gap-4"
                    style={{ transform: 'translateZ(45px)' }}
                  >
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--nxt-ink-soft)] font-bold">Non-Dilutive Grant</p>
                      <p className="text-lg font-display font-bold text-[var(--nxt-ink)] mt-0.5">₹25,00,000</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--nxt-ink-soft)] font-bold">Execution Runway</p>
                      <p className="text-lg font-display font-bold text-[var(--nxt-ink)] mt-0.5">5 Milestones</p>
                    </div>
                  </div>

                  {/* Live Progress Bar with Animated Pulse (3D Layer 4) */}
                  <div className="mt-6 pt-4 border-t border-[var(--nxt-line)]" style={{ transform: 'translateZ(30px)' }}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-[11px] font-bold text-[var(--nxt-ink)]">GATE PROTOCOL STATUS</span>
                      <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">GATE 01 CLEARED</span>
                    </div>
                    <div className="w-full bg-[var(--nxt-line)] h-2.5 rounded-full overflow-hidden flex border border-[var(--nxt-ink)]/20">
                      <div className="bg-emerald-500 h-full w-2/5" />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="bg-emerald-400 h-full w-1/5"
                      />
                    </div>
                  </div>

                  {/* Verification Seal (3D Layer 5) */}
                  <div className="mt-5 flex items-center justify-between" style={{ transform: 'translateZ(25px)' }}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--nxt-ink)]">
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      <span>IRB & Ethics Pre-Approved</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--nxt-ink-soft)]">
                      ID: NXT-CARDIO-88
                    </span>
                  </div>
                </div>
              </TiltCard>
            </Rise>
          </div>

          {/* Quick Audience Navigation Bar */}
          <Rise delay={0.28}>
            <div className="mt-14 pt-8 border-t border-[var(--nxt-line)]">
              <p className="text-xs uppercase tracking-[0.14em] font-mono font-bold text-[var(--nxt-ink-soft)] mb-3">
                CHOOSE YOUR STORYLINE:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {AUDIENCES.map(a => (
                  <button
                    key={a.id}
                    onClick={() => scrollToId(a.id, 'center')}
                    className="group inline-flex items-center gap-2 rounded-lg border-2 border-[var(--nxt-ink)] bg-[var(--nxt-surface)] hover:bg-[var(--nxt-ink-fixed)] hover:text-white px-4 py-2 text-xs font-bold text-[var(--nxt-ink)] transition-all hover:shadow-[3px_3px_0px_0px_var(--nxt-ink)] hover:-translate-y-0.5"
                  >
                    <a.icon className="w-3.5 h-3.5 text-[var(--nxt-ink-soft)] group-hover:text-white transition-colors" />
                    <span>{a.who.replace(/^[0-9]+\.\s*/, '')}</span>
                  </button>
                ))}
              </div>
            </div>
          </Rise>

          {/* 4 Performance Metrics Panels */}
          <Rise delay={0.34}>
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MangaPanel chapter="DATA // 01" hasShadow={false} className="border-2 border-[var(--nxt-ink)] hover:shadow-[4px_4px_0px_0px_var(--nxt-ink)] transition-all">
                <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[var(--nxt-ink)]">1 in 5</p>
                <p className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Frontline Doctors</p>
                <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Encounter critical unsolved pains daily</p>
              </MangaPanel>

              <MangaPanel chapter="DATA // 02" hasShadow={false} className="border-2 border-[var(--nxt-line)] hover:border-[var(--nxt-ink)] hover:shadow-[4px_4px_0px_0px_var(--nxt-ink)] transition-all">
                <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[var(--nxt-ink)]">{routeCount}</p>
                <p className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Product Roadmaps</p>
                <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Pre-mapped SaMD, hardware, AI & devices</p>
              </MangaPanel>

              <MangaPanel chapter="DATA // 03" hasShadow={false} className="border-2 border-[var(--nxt-line)] hover:border-[var(--nxt-ink)] hover:shadow-[4px_4px_0px_0px_var(--nxt-ink)] transition-all">
                <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-emerald-600 dark:text-emerald-400">100%</p>
                <p className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Milestone-Gated</p>
                <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Capital released against verified proof</p>
              </MangaPanel>

              <MangaPanel chapter="DATA // 04" hasShadow={false} className="border-2 border-[var(--nxt-line)] hover:border-[var(--nxt-ink)] hover:shadow-[4px_4px_0px_0px_var(--nxt-ink)] transition-all">
                <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[var(--nxt-ink)]">Day 1</p>
                <p className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink)]">Guaranteed Demand</p>
                <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Pharma & hospital sponsors pre-committed</p>
              </MangaPanel>
            </div>
          </Rise>
        </div>
      </section>

      {/* CONTINUOUS MANGA TICKER TAPE */}
      <MangaTicker
        items={[
          'DOCTORS IDENTIFY',
          'AMBITIOUS FOUNDERS BUILD',
          'GUARANTEED BUYER DEMAND',
          '100% MILESTONE CAPITAL',
          'CDSCO & FDA BLUEPRINTS',
          'ZERO STARTUP VACUUM',
          'HOSPITAL PILOT ACCELERATION',
        ]}
      />

      {/* VITAL PULSE ANIMATION */}
      <VitalPulseLine className="my-6" />

      {/* 2. THE PARADIGM SHIFT (MANGA DUEL PANEL: TRADITIONAL VS. NXT) */}
      <section className="nxt-container py-16 sm:py-24 border-b-2 border-[var(--nxt-ink)] relative">
        <div className="flex items-center justify-between mb-2">
          <Rise>
            <div className="inline-block bg-[var(--nxt-ink-fixed)] text-[var(--nxt-on-accent)] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-widest uppercase mb-3">
              ACT I // THE CLASH OF PARADIGMS
            </div>
            <H2 className="max-w-3xl">
              Others launch startups in a vacuum. We connect ambitious founders with the real-world clinical challenges healthcare is waiting to solve.
            </H2>
          </Rise>
          <span className="font-mono text-xs font-bold text-[var(--nxt-ink-soft)] hidden md:block">
            [ VS DUALITY FRAME ]
          </span>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 items-stretch">
          {/* Left Panel: The Traditional Route */}
          <Rise delay={0.08} className="flex">
            <MangaPanel chapter="PATHWAY A // THE HIGH RISK ROUTE" className="w-full flex flex-col justify-between">
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

                <div className="mt-8 space-y-3 pt-6 border-t-2 border-[var(--nxt-line)]">
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

              <div className="mt-8 pt-4 border-t-2 border-[var(--nxt-line)] text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] flex items-center justify-between">
                <span>OUTCOME: Capital exhausted before traction</span>
                <span className="text-red-500 font-bold">CRITICAL RISK</span>
              </div>
            </MangaPanel>
          </Rise>

          {/* Right Panel: The NXT Route */}
          <Rise delay={0.16} className="flex">
            <MangaPanel chapter="PATHWAY B // GUARANTEED DEMAND" invert className="w-full flex flex-col justify-between shadow-[6px_6px_0px_0px_#10b981]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5" /> The NXT Route
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl mt-6 tracking-tight text-white">
                  <span className="text-emerald-400">Start</span> with guaranteed demand.
                </h3>
                <p className="mt-4 text-[16px] leading-relaxed text-white/85">
                  Doctors and Industry define the clinical problem and fund the solution. NXT Health matches ambitious founders with validated challenges, capital, and the end-to-end support needed to launch.
                </p>

                <div className="mt-8 space-y-3 pt-6 border-t-2 border-white/20">
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

              <div className="mt-8 pt-4 border-t-2 border-white/20 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>OUTCOME: Day-1 buyer alignment secured</span>
                <span className="flex items-center gap-1.5 font-bold"><CheckCircle2 className="w-4 h-4" /> VALIDATED</span>
              </div>
            </MangaPanel>
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
          <p className="text-xs uppercase tracking-[0.14em] font-mono font-bold text-[var(--nxt-ink-soft)] mb-3">
            PROBLEMS ACTIVELY SOURCED ACROSS CLINICAL DISCIPLINES:
          </p>
          <div className="flex flex-wrap gap-2">
            {CLINICAL_DEPTS.map(dept => (
              <span
                key={dept}
                className="rounded-lg border-2 border-[var(--nxt-ink)] bg-[var(--nxt-surface)] px-3.5 py-1 text-xs font-bold text-[var(--nxt-ink)] hover:bg-[var(--nxt-ink-fixed)] hover:text-white transition-all shadow-[2px_2px_0px_0px_var(--nxt-ink)]"
              >
                {dept}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (MANGA 5-STAGE CHRONICLES) */}
      <section id="how-it-works" className="nxt-container py-20 sm:py-28 border-b-2 border-[var(--nxt-ink)] scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <Rise>
            <div className="inline-block bg-[var(--nxt-ink-fixed)] text-[var(--nxt-on-accent)] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-widest uppercase mb-3">
              ACT II // THE 5-STAGE SAGA
            </div>
            <H2 className="max-w-2xl">
              A structured, milestone-driven pathway engineered to eliminate startup risk.
            </H2>
          </Rise>
          <span className="font-mono text-xs font-bold text-[var(--nxt-ink-soft)] hidden md:block">
            [ 05 GATE SEQUENCE ]
          </span>
        </div>

        {/* Console View */}
        <div className="mt-14 grid lg:grid-cols-[22rem_1fr] gap-8 lg:gap-14 items-start">
          {/* Stepper Navigation */}
          <div className="space-y-3">
            {STEPS.map((s, idx) => {
              const isActive = activeStage === idx;
              return (
                <button
                  key={s.num}
                  onClick={() => setActiveStage(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    isActive
                      ? 'border-[var(--nxt-ink)] bg-[var(--nxt-surface)] shadow-[4px_4px_0px_0px_var(--nxt-ink)] -translate-x-0.5 -translate-y-0.5'
                      : 'border-[var(--nxt-line)] bg-transparent hover:border-[var(--nxt-ink)]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[var(--nxt-ink-fixed)] text-white'
                        : 'border-2 border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] bg-[var(--nxt-surface)]'
                    }`}
                  >
                    {s.num}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-[var(--nxt-ink)]' : 'text-[var(--nxt-ink-soft)]'}`}>
                      {s.title}
                    </p>
                    <p className="text-xs text-[var(--nxt-ink-soft)] mt-0.5 font-mono">{s.stageLabel}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed Manga Panel */}
          <MangaPanel chapter={`GATEWAY 0${activeStage + 1} // ACTIVE CHRONICLE`} className="min-h-[380px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono font-bold text-5xl sm:text-6xl text-[var(--nxt-ink)] leading-none select-none">
                  {STEPS[activeStage].num}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-ink)]/30 px-3 py-1 text-xs font-mono font-bold text-[var(--nxt-ink)]">
                    {STEPS[activeStage].duration}
                  </span>
                  <span className="rounded-sm border-2 border-[var(--nxt-ink)] bg-[var(--nxt-ink-fixed)] text-white px-3 py-1 text-xs font-mono font-bold">
                    STAGE {activeStage + 1} OF 5
                  </span>
                </div>
              </div>

              <h3 className="font-display font-bold text-2xl sm:text-3xl mt-6 tracking-tight">
                {STEPS[activeStage].num}. {STEPS[activeStage].title}
              </h3>
              <p className="mt-4 text-base sm:text-lg text-[var(--nxt-ink-soft)] leading-relaxed max-w-2xl font-medium">
                {STEPS[activeStage].body}
              </p>

              <div className="mt-8 pt-6 border-t-2 border-[var(--nxt-line)] grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)]">
                    Required Deliverable
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-[var(--nxt-ink)]">
                    {STEPS[activeStage].deliverable}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)]">
                    Gatekeeper Audit
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {STEPS[activeStage].gatekeeper}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t-2 border-[var(--nxt-line)] flex items-center justify-between">
              <span className="text-xs text-[var(--nxt-ink-soft)] font-mono font-bold">
                [GATE CLEARANCE TRIGGERS CAPITAL TRANCHE]
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={activeStage === 0}
                  onClick={() => setActiveStage(s => Math.max(0, s - 1))}
                  className="rounded-lg border-2 border-[var(--nxt-ink)] px-3.5 py-1.5 text-xs font-bold disabled:opacity-30 hover:bg-[var(--nxt-ink-fixed)] hover:text-white transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={activeStage === STEPS.length - 1}
                  onClick={() => setActiveStage(s => Math.min(STEPS.length - 1, s + 1))}
                  className="rounded-lg border-2 border-[var(--nxt-ink)] bg-[var(--nxt-ink-fixed)] text-white px-4 py-1.5 text-xs font-bold disabled:opacity-30 transition-opacity"
                >
                  Next Gate →
                </button>
              </div>
            </div>
          </MangaPanel>
        </div>
      </section>

      {/* 5. WHO IT'S FOR (MANGA CHARACTER ROSTER) */}
      <section id="who-its-for" className="nxt-container py-20 sm:py-28 border-b-2 border-[var(--nxt-ink)] scroll-mt-20">
        <Rise>
          <div className="inline-block bg-[var(--nxt-ink-fixed)] text-[var(--nxt-on-accent)] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-widest uppercase mb-3">
            ACT III // THE ALLIANCE ROSTER
          </div>
          <H2 className="max-w-3xl">
            Aligning validated healthcare demand with the builders, experts, and capital to scale.
          </H2>
        </Rise>

        {/* Filter bar */}
        <div className="mt-10 flex flex-wrap gap-2 border-b-2 border-[var(--nxt-line)] pb-6">
          <button
            onClick={() => setActiveAudienceFilter('all')}
            className={`rounded-lg px-4 py-2 text-xs font-bold font-mono transition-all border-2 border-[var(--nxt-ink)] ${
              activeAudienceFilter === 'all'
                ? 'bg-[var(--nxt-ink-fixed)] text-white shadow-[2px_2px_0px_0px_var(--nxt-ink)]'
                : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]'
            }`}
          >
            ALL PLAYERS (6)
          </button>
          {AUDIENCES.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveAudienceFilter(a.id)}
              className={`rounded-lg px-4 py-2 text-xs font-bold font-mono transition-all border-2 border-[var(--nxt-ink)] ${
                activeAudienceFilter === a.id
                  ? 'bg-[var(--nxt-ink-fixed)] text-white shadow-[2px_2px_0px_0px_var(--nxt-ink)]'
                  : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]'
              }`}
            >
              {a.badge.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 6 Audience Manga Panels */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredAudiences.map(a => (
            <MangaPanel key={a.id} chapter={a.code} className="flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[var(--nxt-bg-soft)] border-2 border-[var(--nxt-ink)] flex items-center justify-center text-[var(--nxt-ink)] shadow-[2px_2px_0px_0px_var(--nxt-ink)]">
                    <a.icon className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-[10px] text-[var(--nxt-ink)] font-bold tracking-wider px-2 py-0.5 border border-[var(--nxt-ink)] rounded-xs">
                    {a.badge.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs uppercase tracking-wider font-mono font-bold text-[var(--nxt-ink-soft)] mt-5">
                  {a.who}
                </p>
                <h3 className="font-display font-bold text-xl sm:text-2xl mt-2 tracking-tight">
                  {a.title}
                </h3>
                <p className="mt-3.5 text-sm leading-relaxed text-[var(--nxt-ink-soft)] font-medium">
                  {a.intro}
                </p>

                <div className="mt-6 pt-5 border-t-2 border-[var(--nxt-line)]">
                  <RuleList items={a.points} />
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Btn
                  to={a.to}
                  full
                  variant="outline"
                  size="sm"
                  className="justify-between border-2 border-[var(--nxt-ink)] font-bold hover:bg-[var(--nxt-ink-fixed)] hover:text-white transition-all shadow-[2px_2px_0px_0px_var(--nxt-ink)] hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <span>{a.cta}</span>
                  <ChevronRight className="w-4 h-4" />
                </Btn>
              </div>
            </MangaPanel>
          ))}
        </div>
      </section>

      {/* REVERSE KINETIC MARQUEE */}
      <MangaTicker
        reverse
        speed={30}
        items={[
          'VALIDATED CLINICAL CHALLENGES',
          'MULTI-STAGE CAPITAL GATES',
          '26 CUSTOM ROADMAPS',
          'VETTED EXPERT NETWORK',
          'HOSPITAL PILOT INTEGRATION',
          'COMMERCIAL LAUNCH ENGINE',
        ]}
      />

      {/* 6. WHAT'S INSIDE THE PLATFORM (THE ARSENAL - BENTO GRID) */}
      <section className="nxt-container py-20 sm:py-28 border-b-2 border-[var(--nxt-ink)]">
        <Rise>
          <div className="inline-block bg-[var(--nxt-ink-fixed)] text-[var(--nxt-on-accent)] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-widest uppercase mb-3">
            ACT IV // THE ARSENAL
          </div>
          <H2>What's inside the platform</H2>
          <p className="mt-3 text-lg text-[var(--nxt-ink-soft)] max-w-2xl font-medium">
            A comprehensive infrastructure built to guide medical ventures from clinical need to hospital procurement.
          </p>
        </Rise>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_PILLARS.map((item, i) => (
            <Rise key={item.title} delay={i * 0.05} className="flex">
              <MangaPanel
                chapter={`TOOL 0${i + 1}`}
                hasShadow={false}
                className="w-full flex flex-col justify-between border-2 border-[var(--nxt-ink)] hover:shadow-[5px_5px_0px_0px_var(--nxt-ink)] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-[var(--nxt-bg-soft)] border-2 border-[var(--nxt-ink)] flex items-center justify-center text-[var(--nxt-ink)]">
                      <item.icon className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--nxt-ink)]">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg mt-5 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-[var(--nxt-ink-soft)] leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-[var(--nxt-line)] flex items-center justify-between text-xs font-mono font-bold text-[var(--nxt-ink)]">
                  <span className="text-emerald-600 dark:text-emerald-400">● {item.tag}</span>
                  <span>VIEW SPEC →</span>
                </div>
              </MangaPanel>
            </Rise>
          ))}
        </div>
      </section>

      {/* 7. STARTUPS WORKING WITH US */}
      {site.show_startups && startups.length > 0 && (
        <section id="startups" className="nxt-container py-20 sm:py-24 border-b-2 border-[var(--nxt-ink)] scroll-mt-20">
          <Eyebrow>Cohort Chronicles</Eyebrow>
          <H2 className="mt-4">Companies taking problems to patients.</H2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map(s => <StartupCard key={s.id} startup={s} />)}
          </div>
        </section>
      )}

      {/* 8. PRICING & ACCESS TIERS */}
      <section id="pricing" className="nxt-container py-20 sm:py-28 border-b-2 border-[var(--nxt-line)] scroll-mt-20">
        <Rise>
          <Eyebrow>Pricing & Access</Eyebrow>
          <H2 className="mt-4">Free to start. At cost to build.</H2>
          <p className="mt-3 text-lg text-[var(--nxt-ink-soft)] max-w-2xl font-medium">
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
        <section id="blog" className="nxt-container py-20 sm:py-24 border-b-2 border-[var(--nxt-ink)] scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Dispatches & Ideas</Eyebrow>
              <H2 className="mt-4">Ideas for people building health.</H2>
            </div>
            <Btn variant="outline" to="/blog" className="border-2 border-[var(--nxt-ink)]">All Posts</Btn>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* 10. SPONSORSHIP FOR PHARMA & HOSPITALS */}
      <section id="pricing-pharma" className="nxt-container py-20 sm:py-28 scroll-mt-20 border-b-2 border-[var(--nxt-ink)]">
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

      {/* 11. FINAL CLIMAX & LEAD INTAKE (START) */}
      <section id="start" className="bg-[#111111] text-white scroll-mt-16 relative overflow-hidden border-t-2 border-[var(--nxt-ink)]">
        {/* Ambient Manga Focus Aura */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="nxt-container py-20 sm:py-28 grid gap-12 lg:grid-cols-2 lg:gap-20 items-start relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm border-2 border-white bg-white/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> CLIMAX // COMMENCE YOUR JOURNEY
            </div>
            <H2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-lg">
              Put capital behind a real clinical need or claim one to scale.
            </H2>
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-white/80 max-w-xl">
              Fund a clinical challenge to deploy screened founder teams or join free to build with guaranteed demand from day one.
            </p>

            <div className="mt-10 space-y-4 pt-8 border-t-2 border-white/20 max-w-lg text-sm text-white/90 font-medium">
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

          <div className="rounded-[22px] bg-white text-[#111] p-7 sm:p-10 border-2 border-white shadow-[8px_8px_0px_0px_#10b981]">
            <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight mb-2">
              Start with NXT Health
            </h3>
            <p className="text-xs text-[var(--nxt-ink-soft)] mb-6 font-mono font-bold">
              [ DIRECT COMMUNICATOR // 24-HOUR RESPONSE PROTOCOL ]
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
          ? <img src={startup.logo_url} alt="" className="w-14 h-14 rounded-xl object-contain border-2 border-[var(--nxt-ink)] bg-white p-1.5" loading="lazy" />
          : <div className="w-14 h-14 rounded-xl bg-[#111] text-white font-display font-bold text-xl flex items-center justify-center border-2 border-[var(--nxt-ink)]" aria-hidden="true">{startup.name.slice(0, 1).toUpperCase()}</div>}
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg tracking-[-0.02em] leading-tight">{startup.name}</h3>
          <p className="text-[13px] text-[var(--nxt-ink-soft)] mt-0.5 font-mono">{[startup.sector, startup.stage, startup.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {startup.tagline && <p className="mt-4 font-bold">{startup.tagline}</p>}
      {startup.description && <p className="mt-2 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)] line-clamp-4 font-medium">{startup.description}</p>}
    </>
  );
  const cls = 'block rounded-[20px] border-2 border-[var(--nxt-ink)] bg-[var(--nxt-surface)] p-6 hover:shadow-[5px_5px_0px_0px_var(--nxt-ink)] transition-all';
  return startup.website
    ? <a href={startup.website} target="_blank" rel="noreferrer" className={cls}>{body}</a>
    : <article className={cls}>{body}</article>;
};

const PriceCard: React.FC<{
  label: string; price: string; note: string; points: string[]; cta: string; to: string; featured?: boolean; outline?: boolean;
}> = ({ label, price, note, points, cta, to, featured, outline }) => (
  <MangaPanel
    chapter={featured ? 'RECOMMENDED TIER' : undefined}
    className={`flex flex-col justify-between ${featured ? 'border-2 border-[var(--nxt-ink)] shadow-[6px_6px_0px_0px_#10b981]' : ''}`}
  >
    <div>
      <div className="flex items-center justify-between">
        <Eyebrow>{label}</Eyebrow>
        {featured && (
          <span className="rounded-sm bg-emerald-500 text-white font-mono px-2 py-0.5 text-[10px] font-bold">
            MOST POPULAR
          </span>
        )}
      </div>
      <p className={`font-display font-bold text-[2.75rem] leading-none tracking-[-0.04em] mt-6 ${price === 'Free' ? 'text-[#16a34a]' : ''}`}>{price}</p>
      <p className="mt-2 text-xs font-mono font-bold text-[var(--nxt-ink-soft)]">{note}</p>
      <div className="mt-6 mb-8">
        <RuleList items={points} />
      </div>
    </div>
    {to !== '/signup' && (
      <Btn
        to={to}
        variant={outline ? 'outline' : 'solid'}
        full
        className="mt-auto border-2 border-[var(--nxt-ink)] font-bold shadow-[2px_2px_0px_0px_var(--nxt-ink)]"
      >
        {cta}
      </Btn>
    )}
  </MangaPanel>
);
