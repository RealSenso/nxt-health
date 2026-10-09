import React from 'react';
import { Linkedin } from 'lucide-react';
import type { ProblemStatement } from '../../types';
import { initials } from '../../data/experts';
import { API_URL } from '../../services/api';

/** Uploaded photos are served by the API; links are used as they are. */
const photoSrc = (url: string) => (url.startsWith('/') ? `${API_URL}${url}` : url);

/** The person who posted a problem: photo (or initials), name and LinkedIn. */
export const Sponsor: React.FC<{ problem: ProblemStatement; size?: 'sm' | 'lg'; variant?: 'inline' | 'panel' }> = ({ problem, size = 'lg', variant = 'inline' }) => {
  if (!problem.sponsor_name) return null;
  const dim = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-6 h-6 text-[10px]';
  const avatar = problem.sponsor_photo_url
    ? <img src={photoSrc(problem.sponsor_photo_url)} alt={problem.sponsor_name} className={`${dim} rounded-lg object-cover object-top shrink-0`} loading="lazy" />
    : <span className={`${dim} rounded-lg shrink-0 bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-display font-bold flex items-center justify-center`} aria-hidden="true">{initials(problem.sponsor_name)}</span>;
  if (size === 'sm') {
    return <p className="flex items-center gap-2 text-xs text-[var(--nxt-ink-soft)]">{avatar}<span>Posted by <span className="font-semibold text-[var(--nxt-ink)]">{problem.sponsor_name}</span></span></p>;
  }
  if (variant === 'panel') {
    return (
      <div className="rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-bg-soft)] p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-[var(--nxt-ink-soft)]">Posted by</p>
        <div className="mt-4 flex justify-center">
          {problem.sponsor_photo_url
            ? <img src={photoSrc(problem.sponsor_photo_url)} alt={problem.sponsor_name} className="w-40 h-40 rounded-2xl object-cover object-top" loading="lazy" />
            : <span className="w-40 h-40 rounded-2xl bg-[var(--nxt-surface)] border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] font-display font-bold text-3xl flex items-center justify-center" aria-hidden="true">{initials(problem.sponsor_name)}</span>}
        </div>
        <p className="mt-4 font-display text-xl font-bold text-[var(--nxt-ink)]">{problem.sponsor_name}</p>
        {problem.sponsor_linkedin && (
          <a href={problem.sponsor_linkedin} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[var(--nxt-ink)] px-5 py-2 text-sm font-semibold hover:bg-[var(--nxt-surface)]">
            <Linkedin className="w-4 h-4" /> View LinkedIn profile
          </a>
        )}
      </div>
    );
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
