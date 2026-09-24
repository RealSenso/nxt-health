import React from 'react';
import { motion } from 'motion/react';
import {
  Stethoscope, ArrowRight, FileSearch, BadgeDollarSign, Route, Hospital, UserRound, Wrench, Rocket,
  CheckCircle2, ShieldCheck, Layers, Users,
} from 'lucide-react';
import { store, PLATFORM_NAME } from '../services/store';
import { Reveal, RevealGroup, RevealItem } from './ui/Reveal';
import { ThemeToggle } from './ThemeToggle';
import { HeroIllustration, SpotIllustration, SpotKind } from './ui/Illustrations';
import { departmentIcon } from '../data/icons';

interface HomePageProps {
  onGetStarted: () => void;
  onBrowseProblems: () => void;
}

const FEATURES: { kind: SpotKind; icon: React.ElementType; title: string; description: string }[] = [
  {
    kind: 'problems', icon: FileSearch, title: 'Verified clinical problems',
    description: 'Unmet needs written by department heads and surgeons — problems hospitals actually want solved and will pilot.',
  },
  {
    kind: 'funds', icon: BadgeDollarSign, title: 'Non-dilutive grant funding',
    description: 'Apply to grant pools tied to specific problems, save drafts, and track every application through review.',
  },
  {
    kind: 'roadmap', icon: Route, title: 'Step-by-step roadmaps',
    description: 'Commit to a product category and follow a milestone plan from discovery to regulatory clearance and launch.',
  },
  {
    kind: 'resources', icon: Hospital, title: 'Experts & hospital partners',
    description: 'Sessions, webinars, and introductions to partner health systems for pilots, IRB fast-tracks, and usability testing.',
  },
];

const PERSONAS = [
  { icon: UserRound, title: 'Clinicians with an idea', text: 'You see the problem every shift. We help you find co-founders, funding, and a path to build it.' },
  { icon: Wrench, title: 'Engineers & scientists', text: 'You can build it. We give you validated clinical needs and the regulatory map you need.' },
  { icon: Rocket, title: 'Founders & operators', text: 'You have shipped before. Get to a hospital pilot faster with structured milestones and partners.' },
];

const HOW_IT_WORKS = [
  { icon: UserRound, title: 'Create a free account', text: 'Takes under a minute.' },
  { icon: FileSearch, title: 'Pick a clinical problem', text: 'Browse and save the ones that fit you.' },
  { icon: Layers, title: 'Commit to a category', text: 'Device, digital health, diagnostic and more.' },
  { icon: CheckCircle2, title: 'Build, fund & validate', text: 'Work through each step with your team.' },
];

function parseAmount(text?: string): number {
  const digits = text?.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onBrowseProblems }) => {
  const problems = store.getProblems();
  const fundedCount = problems.filter(p => p.funded).length;
  const grantPool = problems.reduce((sum, p) => sum + (p.funded ? parseAmount(p.funding_amount) : 0), 0);
  const founderCount = store.getUsers().filter(u => u.role === 'member').length;

  return (
    <div className="min-h-screen w-full bg-[var(--nxt-bg)] text-[var(--nxt-ink)] flex flex-col">
      <header className="sticky top-0 z-40 bg-[var(--nxt-bg)]/85 backdrop-blur-md border-b border-[var(--nxt-line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-lg text-[var(--nxt-ink)] tracking-tight">{PLATFORM_NAME}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              id="btn-header-browse"
              onClick={onBrowseProblems}
              className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)] transition-colors"
            >
              Browse problems
            </button>
            <button
              id="btn-header-login"
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Log in / Sign up
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Reveal className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] text-sm font-semibold mb-5">
              <ShieldCheck className="w-4 h-4" />
              For clinicians, engineers and founders building healthcare
            </Reveal>
            <Reveal delay={0.05} as="h1" className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-[var(--nxt-ink)]">
              Turn real clinical problems into{' '}
              <span className="text-[var(--nxt-mint-strong)]">funded medical startups.</span>
            </Reveal>
            <Reveal delay={0.1} as="p" className="text-base sm:text-lg text-[var(--nxt-ink-soft)] leading-relaxed mt-5 max-w-xl">
              {PLATFORM_NAME} gives you verified hospital problems, non-dilutive grants, and a step-by-step
              roadmap from first interview to hospital pilot — all in one place.
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col sm:flex-row gap-3 mt-8">
              <motion.button
                id="btn-hero-get-started"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-base font-semibold shadow-lg shadow-[var(--nxt-mint-strong)]/25 transition-colors"
              >
                Get started — it's free <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                id="btn-hero-browse"
                onClick={onBrowseProblems}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink)] text-base font-semibold transition-colors"
              >
                Browse problems — no sign-up
              </button>
            </Reveal>
            <Reveal delay={0.2} className="grid grid-cols-3 gap-4 mt-10 max-w-lg">
              {[
                { value: `${problems.length}`, label: 'verified problems' },
                { value: grantPool ? `$${(grantPool / 1_000_000).toFixed(1)}M` : `${fundedCount}`, label: grantPool ? 'in grant pools' : 'funded problems' },
                { value: `${founderCount}+`, label: 'founders building' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--nxt-ink)]">{stat.value}</p>
                  <p className="text-sm text-[var(--nxt-ink-soft)]">{stat.label}</p>
                </div>
              ))}
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative">
            <HeroIllustration className="w-full max-w-xl mx-auto" />
          </Reveal>
        </section>

        <section className="bg-[var(--nxt-surface)] border-y border-[var(--nxt-line)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <Reveal as="h2" className="font-display text-2xl sm:text-3xl font-bold text-center">Built for the people who fix healthcare</Reveal>
            <RevealGroup className="grid md:grid-cols-3 gap-5 mt-10" stagger={0.06}>
              {PERSONAS.map(p => (
                <RevealItem key={p.title}>
                  <div className="h-full rounded-3xl bg-[var(--nxt-bg)] border border-[var(--nxt-line)] p-6">
                    <span className="w-12 h-12 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center mb-4">
                      <p.icon className="w-6 h-6" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{p.title}</h3>
                    <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed mt-2">{p.text}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)]">What you get</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">Everything from idea to hospital pilot</h2>
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-2 gap-5 mt-8" stagger={0.06}>
            {FEATURES.map(f => (
              <RevealItem key={f.title}>
                <div className="h-full rounded-3xl bg-[var(--nxt-surface)] border border-[var(--nxt-line)] p-6 flex gap-5 items-center hover:shadow-md transition-shadow">
                  <SpotIllustration kind={f.kind} className="w-28 sm:w-32 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <f.icon className="w-5 h-5 text-[var(--nxt-mint-strong)]" />
                      <h3 className="font-display text-lg font-bold">{f.title}</h3>
                    </div>
                    <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Reveal className="rounded-3xl bg-[var(--nxt-ink-fixed)] text-white p-8 sm:p-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">How it works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.title}>
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-white/10 text-[var(--nxt-mint)] flex items-center justify-center">
                      <step.icon className="w-6 h-6" />
                    </span>
                    <span className="font-display text-sm font-bold text-white/40">0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold mt-4">{step.title}</h3>
                  <p className="text-sm text-white/65 mt-1">{step.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)]">Open right now</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">Problems hospitals want solved</h2>
            </Reveal>
            <button onClick={onBrowseProblems} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nxt-mint-strong)] hover:underline">
              See all {problems.length} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <RevealGroup className="grid md:grid-cols-3 gap-5" stagger={0.06}>
            {problems.slice(0, 3).map(p => {
              const DeptIcon = departmentIcon(p.department);
              return (
                <RevealItem key={p.id}>
                  <button
                    onClick={onBrowseProblems}
                    className="w-full h-full text-left rounded-3xl bg-[var(--nxt-surface)] border border-[var(--nxt-line)] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-11 h-11 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center">
                        <DeptIcon className="w-5 h-5" />
                      </span>
                      {p.funded && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-1 rounded-full">
                          <BadgeDollarSign className="w-3.5 h-3.5" /> Funded
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] mt-4">{p.department}</p>
                    <h3 className="font-display text-base font-bold leading-snug mt-1">{p.title}</h3>
                  </button>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <Reveal className="nxt-hero-glow rounded-3xl border border-[var(--nxt-line)] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">Ready to build what's next?</h2>
              <p className="text-base text-[var(--nxt-ink-soft)] mt-3 max-w-lg">
                Browsing is free for everyone. Members unlock full roadmaps, resources, funding applications and the founder community.
              </p>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 mt-6 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-semibold transition-colors"
              >
                Create free account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--nxt-ink-soft)]">
              <Users className="w-5 h-5 text-[var(--nxt-mint-strong)]" />
              Join {founderCount}+ founders already building
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--nxt-ink-soft)]">
          <p><span className="font-display font-bold text-[var(--nxt-ink)]">{PLATFORM_NAME}</span> · From clinical problem to hospital pilot.</p>
          <div className="flex items-center gap-5">
            <button onClick={onBrowseProblems} className="hover:text-[var(--nxt-ink)] transition-colors">Browse problems</button>
            <button onClick={onGetStarted} className="font-semibold text-[var(--nxt-mint-strong)] hover:underline">Log in / Sign up</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
