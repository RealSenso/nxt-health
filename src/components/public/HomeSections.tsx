import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Check } from 'lucide-react';
import { Eyebrow, H2 } from './ui';

/** One shared clock, so the dots and the "How it works" steps always change on the same beat. */
const BEAT_MS = 2600;
let beat = 0;
let timer = 0;
const listeners = new Set<() => void>();
const subscribeBeat = (fn: () => void) => {
  listeners.add(fn);
  if (listeners.size === 1) timer = window.setInterval(() => { beat += 1; listeners.forEach(l => l()); }, BEAT_MS);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) window.clearInterval(timer);
  };
};
const useBeat = () => useSyncExternalStore(subscribeBeat, () => beat, () => 0);

const inView = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } };

/** Fades a block up as it scrolls into view. */
export const Rise: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => (
  <motion.div {...inView} transition={{ ...inView.transition, delay }} className={className}>{children}</motion.div>
);

/** Picks five different cells of the 5x5 grid at random, and which of them is the one who starts. */
const shuffle = () => {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return { ideas: cells.slice(0, 5), starts: cells[0] };
};

/** "1 in 5" shown as a grid of people; the one in five with an idea keeps moving, and one of them starts. */
export const OneInFive: React.FC<{
  stat?: string;
  headline?: React.ReactNode;
  subtitle?: React.ReactNode;
}> = ({
  stat = '1 in 5',
  headline = 'doctors encounters a critical clinical problem every day and waits for someone to solve it.',
  subtitle = 'NXT Health captures these frontline pains, validates them with industry funding, and connects them to ambitious founders ready to build the solution.',
}) => {
  const tick = useBeat();
  const [{ ideas: pattern, starts }, setPick] = useState(() => ({ ideas: [0, 6, 12, 18, 24], starts: 12 }));
  useEffect(() => { if (tick > 0) setPick(shuffle()); }, [tick]);

  return (
  <section className="nxt-container py-16 sm:py-20 border-b border-[var(--nxt-line)]">
    <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-16 items-center">
      <div className="grid grid-cols-5 gap-3 w-fit" aria-hidden="true">
        {Array.from({ length: 25 }).map((_, i) => {
          const idea = pattern.includes(i);
          const green = i === starts;
          return (
            <motion.span
              key={i}
              initial={{ scale: 0.4, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-[background-color,transform] duration-700 ${
                green ? 'bg-[#16a34a] scale-110' : idea ? 'bg-[var(--nxt-ink-fixed)]' : 'bg-[var(--nxt-line)]'
              }`}
            />
          );
        })}
      </div>
      <Rise>
        <p className="font-display font-bold text-[clamp(3rem,8vw,6rem)] leading-none tracking-[-0.05em]">{stat}</p>
        <p className="mt-5 text-[clamp(1.1rem,1.8vw,1.5rem)] leading-snug max-w-2xl">{headline}</p>
        <p className="mt-3 text-[var(--nxt-ink-soft)] max-w-2xl leading-relaxed">{subtitle}</p>
      </Rise>
    </div>
  </section>
  );
};

/** Five steps shown one at a time; they advance on their own until someone picks one. */
export const HowItWorks: React.FC<{
  title?: string;
  subtitle?: React.ReactNode;
  steps: { title: string; body: React.ReactNode }[];
}> = ({
  title = 'How It Works',
  subtitle = 'A structured, milestone-driven pathway engineered to eliminate startup risk.',
  steps,
}) => {
  const [manual, setManual] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  // The walk-through starts at step 1 when the section scrolls into view, then follows the shared beat.
  const seen = useInView(ref, { once: true, amount: 0.45 });
  const tick = useBeat();
  const startedAt = useRef<number | null>(null);
  if (seen && startedAt.current === null) startedAt.current = tick;
  const index = manual !== null ? manual : startedAt.current === null ? 0 : (tick - startedAt.current) % steps.length;

  return (
    <section ref={ref} id="how-it-works" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
      <Rise>
        <Eyebrow>{title}</Eyebrow>
        <H2 className="mt-5">{subtitle}</H2>
      </Rise>
      <div className="mt-12 grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <ol className="flex lg:block gap-2 overflow-x-auto no-scrollbar lg:space-y-1">
          {steps.map((s, i) => (
            <li key={s.title} className="shrink-0 lg:shrink">
              <button
                onClick={() => setManual(i)}
                aria-current={i === index}
                className={`w-full text-left flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${i === index ? 'bg-[var(--nxt-bg-soft)]' : 'hover:bg-[var(--nxt-bg-soft)]/60'}`}
              >
                <span className={`w-7 h-7 shrink-0 rounded-full text-[11px] font-bold flex items-center justify-center border ${
                  i < index ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : i === index ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-ink-soft)] text-[var(--nxt-ink-soft)]'
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
