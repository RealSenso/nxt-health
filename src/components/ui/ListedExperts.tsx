import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin } from 'lucide-react';
import type { ListedExpert } from '../../types';
import { initials } from '../../data/experts';

/** Onboarded experts who can't be booked on the platform yet: name, role and LinkedIn. */
export const ListedExperts: React.FC<{ experts: ListedExpert[]; title?: string; hint?: string; className?: string }> = ({
  experts, title = 'More experts in the NXT network', hint = 'Onboarded experts who are helping founders. Online booking opens as they set up their profiles.', className = '',
}) => {
  if (!experts.length) return null;
  return (
    <section className={className} aria-label={title}>
      <h2 className="font-display text-xl font-bold text-[var(--nxt-ink)] tracking-tight">{title}</h2>
      <p className="text-sm text-[var(--nxt-ink-soft)] mt-1">{hint}</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experts.map(x => (
          <li key={x.id} className="flex items-start gap-4 rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5">
            {x.photo_url
              ? <img src={x.photo_url} alt="" className="w-12 h-12 shrink-0 rounded-xl object-cover" loading="lazy" />
              : <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-display font-bold flex items-center justify-center" aria-hidden="true">{initials(x.name)}</div>}
            <div className="min-w-0">
              <Link to={`/experts/network/${x.id}`} className="font-semibold text-[var(--nxt-ink)] hover:underline">{x.name}</Link>
              {x.title && <p className="text-sm text-[var(--nxt-ink-soft)] mt-0.5">{x.title}</p>}
              <Link to={`/experts/network/${x.id}`} className="mt-2 mr-4 inline-block text-sm font-semibold underline">View profile</Link>
              {x.linkedin && (
                <a href={x.linkedin} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold underline">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
