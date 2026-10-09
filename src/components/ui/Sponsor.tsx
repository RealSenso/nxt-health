import React from 'react';
import { Linkedin } from 'lucide-react';
import type { ProblemStatement } from '../../types';
import { initials } from '../../data/experts';

/** The person who posted a problem: photo (or initials), name and LinkedIn. */
export const Sponsor: React.FC<{ problem: ProblemStatement; size?: 'sm' | 'lg' }> = ({ problem, size = 'lg' }) => {
  if (!problem.sponsor_name) return null;
  const dim = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-6 h-6 text-[10px]';
  const avatar = problem.sponsor_photo_url
    ? <img src={problem.sponsor_photo_url} alt={problem.sponsor_name} className={`${dim} rounded-full object-cover shrink-0`} loading="lazy" />
    : <span className={`${dim} rounded-full shrink-0 bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-display font-bold flex items-center justify-center`} aria-hidden="true">{initials(problem.sponsor_name)}</span>;
  if (size === 'sm') {
    return <p className="flex items-center gap-2 text-xs text-[var(--nxt-ink-soft)]">{avatar}<span>Posted by <span className="font-semibold text-[var(--nxt-ink)]">{problem.sponsor_name}</span></span></p>;
  }
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-bg-soft)] p-4 mb-6">
      {avatar}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-[var(--nxt-ink-soft)]">Posted by</p>
        <p className="font-semibold text-[var(--nxt-ink)]">{problem.sponsor_name}</p>
        {problem.sponsor_linkedin && (
          <a href={problem.sponsor_linkedin} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold underline">
            <Linkedin className="w-3.5 h-3.5" /> LinkedIn profile
          </a>
        )}
      </div>
    </div>
  );
};
