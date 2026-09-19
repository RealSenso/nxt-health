import React from 'react';
import { motion } from 'motion/react';
import {
  Stethoscope, ArrowRight, DollarSign, ListTodo, Hospital, FileQuestion,
  ShieldCheck, Users, Zap, CheckCircle2, Lock
} from 'lucide-react';
import { store, PLATFORM_NAME } from '../services/store';
import { Reveal, RevealGroup, RevealItem, PillButton } from './ui/Reveal';
import { ThemeToggle } from './ThemeToggle';

interface HomePageProps {
  onGetStarted: () => void;
  onBrowseProblems: () => void;
}

const FEATURES = [
  {
    icon: FileQuestion,
    title: 'Curated Problem Statements',
    description: 'Verified clinical unmet needs authored by department heads, surgeons, and research chairs — the pain points hospitals actually want solved.',
  },
  {
    icon: DollarSign,
    title: 'Non-Dilutive Grant Funding',
    description: 'Apply directly to dedicated grant pools tied to specific clinical problems, save drafts, and track every application through review.',
  },
  {
    icon: ListTodo,
    title: '21-Category Task Roadmaps',
    description: 'Pick the problem you\'re working on, then follow a structured, step-by-step milestone roadmap from prototype to regulatory clearance.',
  },
  {
    icon: Hospital,
    title: 'Hospital Validation Network',
    description: 'Direct introduction pathways to partner health systems for pilot studies, IRB fast-tracks, and clinical usability testing.',
  },
];

const STEPS = [
  { title: 'Create your account', description: 'Sign up in seconds — no credit card required to explore.' },
  { title: 'Pick a problem to solve', description: 'Browse verified clinical problem statements and choose one that fits your venture.' },
  { title: 'Apply & build', description: 'Apply for grant funding and follow your category\'s roadmap to launch.' },
];

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onBrowseProblems }) => {
  const problems = store.getProblems();
  const fundedCount = problems.filter(p => p.funded).length;

  return (
    <div className="min-h-screen w-full bg-[var(--nxt-bg)] text-[var(--nxt-ink)] flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-[var(--nxt-bg)]/90 backdrop-blur-md border-b border-[var(--nxt-line)]">
        <div className="w-full px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--nxt-ink-fixed)] text-[var(--nxt-mint)] flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-display font-black text-base sm:text-lg text-[var(--nxt-ink)] tracking-tighter">
              {PLATFORM_NAME}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              id="btn-header-browse"
              onClick={onBrowseProblems}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink)] text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Browse Problem Statements</span>
            </button>
            <motion.button
              id="btn-header-login"
              onClick={onGetStarted}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              <span>Log In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-3 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6">
        <Reveal className="nxt-grid-lines nxt-dot-grid bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-3xl pt-10 sm:pt-16 pb-8 text-[var(--nxt-ink)] shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl px-6 sm:px-10 mx-auto text-center">
            <Reveal delay={0.05} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] border border-[var(--nxt-mint-strong)]/20 text-xs font-semibold mb-4">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Medical Startup Acceleration Platform</span>
            </Reveal>
            <Reveal delay={0.1} as="h1" className="font-hero text-4xl sm:text-6xl leading-[0.95] text-[var(--nxt-ink)] mb-4">
              Medicine has a lot of problems. Go build the fix.
            </Reveal>
            <Reveal delay={0.15} as="p" className="text-sm sm:text-base text-[var(--nxt-ink-soft)] leading-relaxed mb-6 max-w-xl mx-auto">
              NxT Health connects founders with verified clinical unmet needs, non-dilutive grant funding,
              and structured 21-category roadmaps to take a medical startup from idea to hospital validation.
            </Reveal>

            <Reveal delay={0.2} className="flex flex-wrap items-center justify-center gap-3">
              <PillButton
                tone="ghost"
                onClick={onBrowseProblems}
                className="px-5 py-3 text-sm border border-[var(--nxt-line)]"
                id="btn-hero-browse"
              >
                <span>Browse Problem Statements — No Sign-Up Needed</span>
              </PillButton>
              <PillButton
                tone="mint"
                onClick={onGetStarted}
                className="px-5 py-3 text-sm shadow-lg shadow-[var(--nxt-mint-strong)]/20"
                id="btn-hero-get-started"
              >
                <span>Get Started — It's Free</span>
                <ArrowRight className="w-4 h-4" />
              </PillButton>
            </Reveal>
          </div>
        </Reveal>

        <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl px-6 sm:px-10 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-[var(--nxt-line)] text-[var(--nxt-ink)] shadow-sm">
          {[
            { icon: ShieldCheck, label: `${problems.length}+ Verified Problem Statements`, tone: 'mint' },
            { icon: Users, label: `${fundedCount} Funded By Grant Committees`, tone: 'blue' },
            { icon: Zap, label: '21 Category Execution Roadmaps', tone: 'mint' },
          ].map(({ icon: Icon, label, tone }, i) => (
            <div key={label} className={`flex items-center gap-3 ${i > 0 ? 'sm:pl-6' : ''}`}>
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
                tone === 'blue' ? 'border-[var(--nxt-blue-strong)]/30 bg-[var(--nxt-blue)]' : 'border-[var(--nxt-mint-strong)]/30 bg-[var(--nxt-mint)]'
              }`}>
                <Icon className={`w-4 h-4 ${tone === 'blue' ? 'text-[var(--nxt-blue-strong)]' : 'text-[var(--nxt-mint-strong)]'}`} />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">{label}</span>
            </div>
          ))}
        </Reveal>

        <div>
          <Reveal as="h2" className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)] mb-1 px-1">
            Everything a medical founder needs, in one place
          </Reveal>
          <Reveal delay={0.05} as="p" className="text-xs sm:text-sm text-[var(--nxt-ink-soft)] mb-5 px-1">
            From finding a validated problem to walking into a hospital pilot.
          </Reveal>

          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4" stagger={0.05}>
            {FEATURES.map((feature) => (
              <RevealItem key={feature.title}>
                <div className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-5 shadow-sm h-full">
                  <div className="w-10 h-10 rounded-xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)] mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-[var(--nxt-ink-soft)] leading-relaxed">{feature.description}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <Reveal className="bg-[var(--nxt-ink-fixed)] nxt-noise rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-6 relative z-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold mb-1">{step.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="bg-[var(--nxt-mint)] rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-mint-deep)] mb-2">
            Ready to build what's next?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--nxt-mint-deep)]/80 mb-5 max-w-md mx-auto">
            Problem statements are free to browse for everyone. Create an account and become a member
            to submit funding applications and access task roadmaps.
          </p>
          <PillButton
            tone="mint"
            onClick={onGetStarted}
            className="px-5 py-3 text-sm shadow-lg shadow-[var(--nxt-mint-strong)]/20 mx-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Create Free Account</span>
          </PillButton>
        </Reveal>
      </main>

      <footer className="bg-[var(--nxt-ink-fixed)] py-8 mt-6 text-xs text-white/60">
        <div className="w-full px-3 sm:px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-white text-sm tracking-tight">{PLATFORM_NAME}</p>
            <p className="text-[11px] text-white/50 mt-0.5">
              End-to-End Medical Entrepreneur Acceleration Platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onBrowseProblems}
              className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
            >
              Browse Problem Statements
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nxt-mint)] hover:opacity-80 transition-opacity"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log In / Register</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
