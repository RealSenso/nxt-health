import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Linkedin } from 'lucide-react';
import type { ListedExpert } from '../../types';
import { formatRate } from '../../data/experts';
import { ExpertPhoto } from '../public/ExpertDirectory';

/** Experts in the NXT network, as photo cards: name, role, what they know and what a session costs. */
export const ListedExperts: React.FC<{ experts: ListedExpert[]; reasons?: Record<string, string[]>; title?: string; hint?: string; className?: string }> = ({
  experts, reasons = {}, title = 'More experts in the NXT network', hint = '', className = '',
}) => {
  if (!experts.length) return null;
  return (
    <section className={className} aria-label={title}>
      <h2 className="font-display font-bold text-[clamp(1.6rem,2.6vw,2.25rem)] tracking-[-0.03em]">{title}</h2>
      {hint && <p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)]">{hint}</p>}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {experts.map(x => {
          const why = reasons[x.id] || [];
          const rate = x.rate_usd ?? 0;
          return (
            <Link
              key={x.id}
              to={`/experts/network/${x.id}`}
              className="group rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] overflow-hidden flex flex-col hover:border-[var(--nxt-ink)] transition-colors"
            >
              <ExpertPhoto expert={{ name: x.name, photo_url: x.photo_url || '' }} className="w-full aspect-[3/2] text-4xl" />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display font-bold text-xl tracking-[-0.02em] flex items-center gap-2">
                  <span className="min-w-0">{x.name}</span>
                  <CheckCircle2 className="w-[18px] h-[18px] shrink-0" aria-label="Verified by NXT" />
                </h3>
                {x.title && <p className="mt-3 text-[15px] leading-relaxed">{x.title}</p>}
                {x.specialisation && <p className="mt-3 text-[13px] leading-snug text-[var(--nxt-ink-soft)] line-clamp-2">{x.specialisation}</p>}
                {why.length > 0 && <p className="mt-3 text-[13px] leading-snug text-[var(--nxt-ink-soft)]">✓ {why[0]}</p>}
                <div className="mt-auto pt-5">
                  <div className="border-t border-[var(--nxt-line)] pt-4 flex items-baseline justify-between gap-3">
                    <span className="font-bold text-lg">{formatRate(rate)}</span>
                    <span className="text-sm text-[var(--nxt-ink-soft)]">{rate === 0 ? 'per session' : 'per hour'}</span>
                  </div>
                  {x.linkedin && (
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--nxt-ink-soft)]"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
