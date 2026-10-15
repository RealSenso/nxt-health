import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { store } from '../../services/store';
import { Btn } from './ui';

const rupees = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(n >= 1000000 ? 0 : 1).replace(/\.0$/, '')} lakh` : n > 0 ? `₹${Math.round(n / 1000)}K` : '');

/**
 * The hook on the home page: pick what you are building and the route to market draws itself, gate by gate,
 * with what it costs and which funded problems you could apply to. All numbers come from the live roadmaps.
 */
export const RouteFinder: React.FC = () => {
  const options = useMemo(
    () => store.getCategories().filter(c => !c.coming_soon && !c.guide && !c.free_access).sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.order - b.order),
    [],
  );
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = options.find(c => c.id === pickedId) || options[0];
  const steps = picked ? store.getSteps(picked.id).slice().sort((a, b) => a.order - b.order) : [];
  const cost = steps.reduce((sum, s) => sum + (s.expected_cost_inr || 0), 0);
  const funded = store.getProblems().filter(p => p.funded).length;

  if (!picked) return null;

  return (
    <div className="rounded-[22px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5 sm:p-7 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
      <p className="text-[12px] uppercase tracking-[0.14em] text-[var(--nxt-ink-soft)]">Try it · 10 seconds</p>
      <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] leading-tight tracking-[-0.02em] mt-2">What are you building?</h2>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="What are you building">
        {options.slice(0, 8).map(c => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === picked.id}
            onClick={() => setPickedId(c.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              c.id === picked.id ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent font-semibold' : 'border-[var(--nxt-ink)]/40 hover:bg-[var(--nxt-bg-soft)]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={picked.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <p className="text-[15px] leading-relaxed text-[var(--nxt-ink-soft)] line-clamp-2">{picked.description}</p>

          <ol className="mt-5 space-y-0">
            {steps.slice(0, 6).map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.07, duration: 0.3 }}
                className="flex items-start gap-3 relative pb-3 last:pb-0"
              >
                {i < Math.min(steps.length, 6) - 1 && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-[var(--nxt-line)]" aria-hidden="true" />}
                <span className="w-7 h-7 shrink-0 rounded-full border border-[var(--nxt-ink)] text-[11px] font-bold flex items-center justify-center bg-[var(--nxt-surface)] relative">
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0 flex items-baseline justify-between gap-3 pt-0.5">
                  <span className="text-[15px] font-semibold truncate">{s.name}</span>
                  {s.typical_duration && <span className="text-xs text-[var(--nxt-ink-soft)] shrink-0">{s.typical_duration}</span>}
                </span>
              </motion.li>
            ))}
            {steps.length > 6 && <li className="pl-10 text-sm text-[var(--nxt-ink-soft)]">+ {steps.length - 6} more gates</li>}
          </ol>

          <div className="mt-6 flex gap-8 border-t border-[var(--nxt-line)] pt-5">
            <div><p className="font-display font-bold text-2xl tracking-[-0.03em]">{steps.length}</p><p className="text-xs text-[var(--nxt-ink-soft)]">gates to clear</p></div>
            {cost > 0 && <div><p className="font-display font-bold text-2xl tracking-[-0.03em]">{rupees(cost)}</p><p className="text-xs text-[var(--nxt-ink-soft)]">typical spend</p></div>}
            <div><p className="font-display font-bold text-2xl tracking-[-0.03em]">{funded}</p><p className="text-xs text-[var(--nxt-ink-soft)]">funded problems</p></div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap gap-3">
        <Btn to="/signup">Start this route free <ArrowRight className="w-4 h-4" /></Btn>
        <Btn variant="outline" to="/problems">See funded problems</Btn>
      </div>
    </div>
  );
};
