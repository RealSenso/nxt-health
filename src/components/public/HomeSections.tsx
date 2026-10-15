import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Eyebrow, H2, RuleList } from './ui';

const inView = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } };

/** Fades a block up as it scrolls into view. */
export const Rise: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => (
  <motion.div {...inView} transition={{ ...inView.transition, delay }} className={className}>{children}</motion.div>
);

const Track: React.FC<{ label: string; tone: 'muted' | 'bold'; segments: { name: string; weight: number; flag?: boolean }[] }> = ({ label, tone, segments }) => (
  <div>
    <p className={`text-[12px] uppercase tracking-[0.14em] mb-3 ${tone === 'bold' ? 'text-[var(--nxt-ink)] font-semibold' : 'text-[var(--nxt-ink-soft)]'}`}>{label}</p>
    <div className="flex gap-1.5">
      {segments.map((s, i) => (
        <motion.div
          key={s.name}
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: (tone === 'bold' ? 0.5 : 0) + i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ flexGrow: s.weight, transformOrigin: 'left' }}
          className={`min-w-0 rounded-xl px-3 py-4 text-sm font-semibold leading-tight ${
            tone === 'bold'
              ? s.flag ? 'bg-[var(--nxt-mint-strong)] text-white' : 'bg-[var(--nxt-ink-fixed)] text-white'
              : s.flag ? 'border-2 border-dashed border-[var(--nxt-ink-soft)] text-[var(--nxt-ink)]' : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]'
          }`}
        >
          <span className="block truncate sm:whitespace-normal">{s.name}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

/** The usual route versus the NXT route, drawn as two timelines. */
export const RouteComparison: React.FC = () => (
  <section className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)]">
    <Rise><H2 className="max-w-[24ch]">Others build companies. We connect the pieces a doctor can't reach.</H2></Rise>
    <div className="mt-12 space-y-10">
      <Track label="The usual route" tone="muted" segments={[
        { name: 'Build the product', weight: 4 }, { name: 'Pitch deck', weight: 2 }, { name: 'Find an advisor', weight: 2 }, { name: 'Look for a buyer… (too late)', weight: 3, flag: true },
      ]} />
      <Track label="The NXT route" tone="bold" segments={[
        { name: 'Funded problem', weight: 2, flag: true }, { name: 'Doctor-founder', weight: 2 }, { name: 'Gate by gate with evidence', weight: 4 }, { name: 'Buyer already waiting', weight: 3, flag: true },
      ]} />
    </div>
    <Rise delay={0.2}><p className="mt-10 font-semibold text-lg">The buyer is the first step, not the last. Problem first. Funded first.</p></Rise>
  </section>
);

/** "1 in 5" shown as twenty people, one of them lit. */
export const OneInFive: React.FC = () => (
  <section className="nxt-container py-16 sm:py-20 border-b border-[var(--nxt-line)]">
    <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-16 items-center">
      <div className="grid grid-cols-5 gap-3 w-fit" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => {
          const lit = i === 7 || i === 3 || i === 12 || i === 17;
          return (
            <motion.span
              key={i}
              initial={{ scale: 0.4, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${lit ? 'bg-[var(--nxt-mint-strong)]' : 'bg-[var(--nxt-line)]'}`}
            />
          );
        })}
      </div>
      <Rise>
        <p className="font-display font-bold text-[clamp(3rem,8vw,6rem)] leading-none tracking-[-0.05em]">1 in 5</p>
        <p className="mt-5 text-[clamp(1.1rem,1.8vw,1.5rem)] leading-snug max-w-2xl">physicians we speak with has an idea they want to build. Most never start, because they don't know where to begin.</p>
        <p className="mt-3 text-[var(--nxt-ink-soft)]">We help them check the idea against what the market wants, before they spend the time and the money.</p>
      </Rise>
    </div>
  </section>
);

/** Five steps shown one at a time; they advance on their own until someone picks one. */
export const HowItWorks: React.FC<{ steps: { title: string; body: React.ReactNode }[] }> = ({ steps }) => {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => setIndex(i => (i + 1) % steps.length), 4500);
    return () => window.clearInterval(t);
  }, [auto, steps.length]);

  return (
    <section id="how-it-works" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
      <Rise>
        <Eyebrow>How it works</Eyebrow>
        <H2 className="mt-5">From problem to market, one gate at a time.</H2>
      </Rise>
      <div className="mt-12 grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <ol className="flex lg:block gap-2 overflow-x-auto no-scrollbar lg:space-y-1">
          {steps.map((s, i) => (
            <li key={s.title} className="shrink-0 lg:shrink">
              <button
                onClick={() => { setIndex(i); setAuto(false); }}
                aria-current={i === index}
                className={`w-full text-left flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${i === index ? 'bg-[var(--nxt-bg-soft)]' : 'hover:bg-[var(--nxt-bg-soft)]/60'}`}
              >
                <span className={`w-7 h-7 shrink-0 rounded-full text-[11px] font-bold flex items-center justify-center border ${
                  i < index ? 'bg-[var(--nxt-mint-strong)] text-white border-transparent' : i === index ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-ink-soft)] text-[var(--nxt-ink-soft)]'
                }`}>{i < index ? <Check className="w-3.5 h-3.5" /> : i + 1}</span>
                <span className={`whitespace-nowrap ${i === index ? 'font-semibold' : 'text-[var(--nxt-ink-soft)]'}`}>{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="relative min-h-[11rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
              <p className="font-display font-bold text-[clamp(5rem,10vw,8rem)] leading-none tracking-[-0.05em] text-[var(--nxt-line)]">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="font-display font-bold text-[clamp(1.5rem,2.6vw,2.25rem)] tracking-[-0.03em] -mt-4">{steps[index].title}</h3>
              <p className="mt-3 text-lg leading-relaxed text-[var(--nxt-ink-soft)] max-w-xl">{steps[index].body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

interface Audience { id: string; who: string; title: string; intro: string; points: string[] }

/** One panel, six audiences: pick who you are and read only your own pitch. */
export const WhoItsFor: React.FC<{ audiences: Audience[] }> = ({ audiences }) => {
  const [id, setId] = useState(audiences[0].id);
  const a = audiences.find(x => x.id === id) || audiences[0];
  useEffect(() => {
    const pick = (e: Event) => { const next = (e as CustomEvent<string>).detail; if (audiences.some(x => x.id === next)) setId(next); };
    window.addEventListener('nxt-audience', pick);
    return () => window.removeEventListener('nxt-audience', pick);
  }, [audiences]);
  return (
    <section id="who-its-for" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
      <Rise>
        <Eyebrow>Who it's for</Eyebrow>
        <H2 className="mt-5">I am…</H2>
      </Rise>
      <div className="mt-8 flex flex-wrap gap-2.5" role="tablist" aria-label="Who are you">
        {audiences.map(x => (
          <button
            key={x.id}
            id={x.id}
            role="tab"
            aria-selected={x.id === id}
            onClick={() => setId(x.id)}
            className={`rounded-full border px-4 py-2 text-[15px] transition-colors scroll-mt-28 ${
              x.id === id ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent font-semibold' : 'border-[var(--nxt-ink)]/60 hover:bg-[var(--nxt-bg-soft)]'
            }`}
          >
            {x.who}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.article
          key={a.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-8 rounded-[22px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-7 sm:p-10 grid gap-8 lg:grid-cols-2 lg:gap-16"
        >
          <div>
            <h3 className="font-display font-bold text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] tracking-[-0.03em]">{a.title}</h3>
            <p className="mt-5 text-lg leading-relaxed text-[var(--nxt-ink-soft)]">{a.intro}</p>
          </div>
          <RuleList items={a.points} className="self-center" />
        </motion.article>
      </AnimatePresence>
    </section>
  );
};
