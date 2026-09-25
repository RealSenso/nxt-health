import React from 'react';
import { motion } from 'motion/react';
import {
  Stethoscope, ArrowRight, FileSearch, BadgeDollarSign, Route, Hospital, UserRound, Rocket,
  CheckCircle2, ShieldCheck, Layers,
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
    description: 'Real unmet needs brought to us by doctors and department heads, checked by our clinical team before they go live.',
  },
  {
    kind: 'funds', icon: BadgeDollarSign, title: 'Non-dilutive grant funding',
    description: 'Grants tied to specific problems, so your startup can build and validate a solution without giving up equity.',
  },
  {
    kind: 'roadmap', icon: Route, title: 'Step-by-step roadmaps',
    description: 'A milestone plan from first clinical interviews to regulatory clearance and launch, with every step explained.',
  },
  {
    kind: 'resources', icon: Hospital, title: 'Mentors & hospital partners',
    description: 'Mentors who have done it before, plus introductions to partner hospitals for pilots, IRB fast-tracks and usability testing.',
  },
];

const PERSONAS = [
  { icon: Stethoscope, tag: '01 · The problem', title: 'Doctors bring the problem', text: 'Doctors and department heads tell us the problems they face every shift — the ones no product solves yet.' },
  { icon: ShieldCheck, tag: '02 · The match', title: 'We verify and fund it', text: 'Our clinical team checks each need, attaches grant funding, and opens it to startups ready to solve it.' },
  { icon: Rocket, tag: '03 · The solution', title: 'Startups build the fix', featured: true, text: 'Startups pick a problem, follow a roadmap with mentors and hospital partners, and take the solution back to the doctors who asked for it.' },
];

const HOW_IT_WORKS = [
  { icon: UserRound, title: 'Create a free account', text: 'Takes under a minute.' },
  { icon: FileSearch, title: "Pick a doctor's problem", text: 'Browse verified needs and save the ones that fit your team.' },
  { icon: Layers, title: 'Choose what to build', text: 'Device, digital health, diagnostic and more.' },
  { icon: CheckCircle2, title: 'Build, fund & pilot', text: 'Work each step with mentors and take it back to the hospital.' },
];

function parseAmount(text?: string): number {
  const digits = text?.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onBrowseProblems }) => {
  const problems = store.getProblems();
  const fundedCount = problems.filter(p => p.funded).length;
  const grantPool = problems.reduce((sum, p) => sum + (p.funded ? parseAmount(p.funding_amount) : 0), 0);
  const categoryCount = store.getCategories().length;
  const stats = [
    { value: problems.length, text: `${problems.length}`, label: 'verified problems' },
    { value: grantPool || fundedCount, text: grantPool ? `$${(grantPool / 1_000_000).toFixed(1)}M` : `${fundedCount}`, label: grantPool ? 'in grant pools' : 'funded problems' },
    { value: categoryCount, text: `${categoryCount}`, label: 'product pathways' },
  ].filter(stat => stat.value > 0);

  return (
    <div className="min-h-screen w-full bg-[var(--nxt-bg)] text-[var(--nxt-ink)] flex flex-col">
      <header className="sticky top-0 z-40 bg-[var(--nxt-bg)]/85 backdrop-blur-md border-b border-[var(--nxt-line)]">
        <div className="nxt-container h-16 flex items-center justify-between">
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
        <section className="nxt-container pt-10 sm:pt-16 lg:pt-20 pb-12 lg:pb-20">
          <Reveal className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] text-sm font-semibold mb-5">
            <Stethoscope className="w-4 h-4" />
            Problems from doctors, solved by startups
          </Reveal>
          <Reveal delay={0.05} as="h1" className="font-display text-4xl sm:text-5xl xl:text-[clamp(2.5rem,3.1vw,4.25rem)] xl:whitespace-nowrap font-extrabold leading-[1.1] tracking-tight text-[var(--nxt-ink)]">
            They see the problem every shift.{' '}
            <span className="text-[var(--nxt-mint-strong)]">Help them build the fix.</span>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-20 items-center">
          <div>
            <Reveal delay={0.1} as="p" className="text-base sm:text-lg text-[var(--nxt-ink-soft)] leading-relaxed mt-5 max-w-xl">
              Doctors bring us the problems they face every day. {PLATFORM_NAME} verifies them and matches
              them with startups that build the solution — with grant funding, a step-by-step roadmap and a path to a hospital pilot.
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col sm:flex-row gap-3 mt-8">
              <motion.button
                id="btn-hero-get-started"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-base font-semibold shadow-lg shadow-[var(--nxt-mint-strong)]/25 transition-colors"
              >
                Start building — it's free <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                id="btn-hero-browse"
                onClick={onBrowseProblems}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink)] text-base font-semibold transition-colors"
              >
                Browse problems
              </button>
            </Reveal>
            {stats.length > 0 && (
              <Reveal delay={0.2} className="flex gap-10 mt-10 pt-6 border-t border-[var(--nxt-line)] max-w-lg">
                {stats.map(stat => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--nxt-ink)]">{stat.text}</p>
                    <p className="text-sm text-[var(--nxt-ink-soft)]">{stat.label}</p>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
          <Reveal delay={0.1} className="relative">
            <HeroIllustration className="w-full max-w-xl mx-auto" />
          </Reveal>
          </div>
        </section>

        <section className="bg-[var(--nxt-surface)] border-y border-[var(--nxt-line)]">
          <div className="nxt-container py-14">
            <Reveal className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold lg:whitespace-nowrap">Doctors bring the problems. Startups build the solutions.</h2>
              <p className="text-base text-[var(--nxt-ink-soft)] mt-3 lg:whitespace-nowrap">{PLATFORM_NAME} sits in the middle — verifying each need, funding the work and connecting both sides until it reaches a pilot.</p>
            </Reveal>
            <RevealGroup className="grid md:grid-cols-3 gap-5 mt-10" stagger={0.06}>
              {PERSONAS.map(p => (
                <RevealItem key={p.title}>
                  <div className={`h-full rounded-3xl border p-6 ${p.featured ? 'bg-[var(--nxt-mint)] border-[var(--nxt-mint-strong)]/40' : 'bg-[var(--nxt-bg)] border-[var(--nxt-line)]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.featured ? 'bg-[var(--nxt-mint-strong)] text-white' : 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]'}`}>
                        <p.icon className="w-6 h-6" />
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${p.featured ? 'text-[var(--nxt-mint-deep)]' : 'text-[var(--nxt-ink-soft)]'}`}>{p.tag}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold">{p.title}</h3>
                    <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed mt-2">{p.text}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="nxt-container py-16">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)]">What you get</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 lg:whitespace-nowrap">Everything you need to solve a real clinical problem</h2>
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-2 2xl:grid-cols-4 gap-5 mt-8" stagger={0.06}>
            {FEATURES.map(f => (
              <RevealItem key={f.title}>
                <div className="h-full rounded-3xl bg-[var(--nxt-surface)] border border-[var(--nxt-line)] p-6 flex 2xl:flex-col gap-5 items-center 2xl:items-start hover:shadow-md transition-shadow">
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

        <section className="nxt-container pb-16">
          <Reveal className="rounded-3xl bg-[var(--nxt-ink-fixed)] border border-white/10 text-white p-8 sm:p-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">How it works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.title}>
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-white/10 text-[var(--nxt-mint-strong)] flex items-center justify-center">
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

        <section className="nxt-container pb-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)]">Open right now</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">Problems doctors want solved</h2>
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

        <section className="nxt-container pb-20">
          <Reveal className="nxt-hero-glow rounded-3xl border border-[var(--nxt-line)] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">Ready to build what doctors are asking for?</h2>
              <p className="text-base text-[var(--nxt-ink-soft)] mt-3 max-w-lg">
                Browsing is free. Members unlock full roadmaps, mentors, resources and grant applications.
              </p>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 mt-6 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-semibold transition-colors"
              >
                Create free account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
        <div className="nxt-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--nxt-ink-soft)]">
          <p><span className="font-display font-bold text-[var(--nxt-ink)]">{PLATFORM_NAME}</span> · From a doctor's problem to a hospital pilot.</p>
          <div className="flex items-center gap-5">
            <button onClick={onBrowseProblems} className="hover:text-[var(--nxt-ink)] transition-colors">Browse problems</button>
            <button onClick={onGetStarted} className="font-semibold text-[var(--nxt-mint-strong)] hover:underline">Log in / Sign up</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
