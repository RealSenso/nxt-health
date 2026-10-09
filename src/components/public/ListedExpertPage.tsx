import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Linkedin } from 'lucide-react';
import type { ListedExpertProfile } from '../../types';
import { api, ApiError } from '../../services/api';
import { PublicLayout } from './PublicLayout';
import { ExpertPhoto } from './ExpertsPage';
import { Btn } from './ui';

const FACTS: [keyof ListedExpertProfile, string][] = [
  ['specialisation', 'Specialisation'],
  ['organisation', 'Organisation'],
  ['city', 'Based in'],
  ['years_experience', 'Experience'],
  ['credentials', 'Credentials'],
  ['languages', 'Languages'],
];

/** The page for an onboarded expert who is not yet bookable online: their profile and how to reach NXT about them. */
export const ListedExpertPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expert, setExpert] = useState<ListedExpertProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setExpert(null); setNotFound(false); setError('');
    api.get<{ expert: ListedExpertProfile }>(`/public/listed-experts/${id}`)
      .then(r => { if (alive) setExpert(r.expert); })
      .catch(e => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
        else setError(e instanceof Error ? e.message : 'Could not load this expert.');
      });
    return () => { alive = false; };
  }, [id]);

  if (notFound) {
    return (
      <PublicLayout variant="experts">
        <section className="nxt-container py-24">
          <h1 className="font-display font-bold text-4xl tracking-[-0.03em]">We couldn't find that expert.</h1>
          <Btn to="/experts" className="mt-8">See all experts</Btn>
        </section>
      </PublicLayout>
    );
  }

  const facts = expert ? FACTS.filter(([key]) => expert[key]) : [];

  return (
    <PublicLayout variant="experts">
      <div className="nxt-container pt-10 pb-24">
        <Link to="/experts#find" className="inline-flex items-center gap-1 text-[15px] hover:underline"><ChevronLeft className="w-4 h-4" /> All experts</Link>
        {error && <p className="mt-8 font-semibold text-[var(--nxt-peach-deep)]">{error}</p>}
        {!expert && !error && <p className="mt-8 text-[var(--nxt-ink-soft)]">Loading…</p>}

        {expert && (
          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_24rem] lg:gap-20 items-start">
            <div>
              <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                <ExpertPhoto expert={expert} className="w-32 h-32 rounded-[18px] text-3xl shrink-0" />
                <div>
                  <h1 className="font-display font-bold text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.03em]">{expert.name}</h1>
                  {expert.title && <p className="mt-2 text-xl">{expert.title}</p>}
                  {expert.linkedin && (
                    <a href={expert.linkedin} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold underline">
                      <Linkedin className="w-4 h-4" /> LinkedIn profile
                    </a>
                  )}
                </div>
              </div>

              {expert.bio && (
                <>
                  <h2 className="font-display font-bold text-xl mt-12 tracking-[-0.02em]">About</h2>
                  <p className="mt-3 text-[17px] leading-relaxed text-[var(--nxt-ink)]/80 max-w-2xl whitespace-pre-line">{expert.bio}</p>
                </>
              )}
              {expert.how_to_help && (
                <>
                  <h2 className="font-display font-bold text-xl mt-10 tracking-[-0.02em]">How they help founders</h2>
                  <p className="mt-3 text-[17px] leading-relaxed text-[var(--nxt-ink)]/80 max-w-2xl whitespace-pre-line">{expert.how_to_help}</p>
                </>
              )}
              {facts.length > 0 && (
                <dl className="mt-10 max-w-2xl divide-y divide-[var(--nxt-line)] border-y border-[var(--nxt-line)]">
                  {facts.map(([key, label]) => (
                    <div key={key} className="grid sm:grid-cols-[11rem_1fr] gap-1 sm:gap-6 py-3.5">
                      <dt className="text-sm uppercase tracking-wider text-[var(--nxt-ink-soft)]">{label}</dt>
                      <dd className="text-[16px]">{expert[key]}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {!expert.bio && !expert.how_to_help && facts.length === 0 && (
                <p className="mt-10 text-[var(--nxt-ink-soft)] max-w-xl">{expert.name} is part of the NXT expert network. A fuller profile will appear here soon.</p>
              )}
            </div>

            <aside className="rounded-[18px] border border-[var(--nxt-line)] p-7 lg:sticky lg:top-24">
              <h2 className="font-display font-bold text-xl tracking-[-0.02em]">Work with {expert.name.split(' ')[0]}</h2>
              <p className="mt-3 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">
                Online booking opens once {expert.name.split(' ')[0]} sets up their sessions. Until then, tell us what you need and we will make the introduction.
              </p>
              <Btn to="/#start" full className="mt-6">Ask for an introduction</Btn>
            </aside>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};
