import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ListedExpertProfile } from '../../types';
import { api, ApiError } from '../../services/api';
import { PublicLayout } from './PublicLayout';
import { ExpertActivity, ExpertHero, ExpertStory } from './ExpertParts';
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
  const first = expert ? expert.name.split(' ')[0] : '';
  const highlights = expert
    ? (expert.highlights.length ? expert.highlights : [
        expert.specialisation && { title: 'Specialisation', text: expert.specialisation },
        expert.organisation && { title: 'Organisation', text: expert.organisation },
        expert.years_experience && { title: 'Experience', text: expert.years_experience },
      ].filter(Boolean) as { title: string; text: string }[])
    : [];

  return (
    <PublicLayout variant="experts">
      {error && <div className="nxt-container pt-10"><p className="font-semibold text-[var(--nxt-peach-deep)]">{error}</p></div>}
      {!expert && !error && <div className="nxt-container pt-10"><p className="text-[var(--nxt-ink-soft)]">Loading…</p></div>}

      {expert && (
        <>
          <ExpertHero
            name={expert.name}
            title={expert.title}
            eyebrow="NXT expert network"
            photoUrl={expert.photo_url}
            videoUrl={expert.intro_video_url}
            linkedin={expert.linkedin}
            backTo="/experts#find"
            highlights={highlights}
          />
          <ExpertStory
            eyebrow={`About ${first}`}
            heading={expert.bio || expert.how_to_help ? `${first} is helping founders build.` : ''}
            paragraphs={[expert.bio, expert.how_to_help]}
          />
          <div className="nxt-container pt-14 pb-24 grid gap-12 lg:grid-cols-[1fr_24rem] lg:gap-20 items-start">
            <div>
              {facts.length > 0 && (
                <dl className="max-w-2xl divide-y divide-[var(--nxt-line)] border-y border-[var(--nxt-line)]">
                  {facts.map(([key, label]) => (
                    <div key={key} className="grid sm:grid-cols-[11rem_1fr] gap-1 sm:gap-6 py-3.5">
                      <dt className="text-sm uppercase tracking-wider text-[var(--nxt-ink-soft)]">{label}</dt>
                      <dd className="text-[16px]">{expert[key] as string}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <ExpertActivity expertId={expert.id} firstName={first} />
              {!expert.bio && !expert.how_to_help && facts.length === 0 && (
                <p className="text-[var(--nxt-ink-soft)] max-w-xl">{expert.name} is part of the NXT expert network. A fuller profile will appear here soon.</p>
              )}
            </div>

            <aside className="rounded-[18px] border border-[var(--nxt-line)] p-7 lg:sticky lg:top-24">
              <h2 className="font-display font-bold text-xl tracking-[-0.02em]">Work with {first}</h2>
              <p className="mt-3 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">
                Online booking opens once {first} sets up their sessions. Until then, tell us what you need and we will make the introduction.
              </p>
              <Btn to="/#start" full className="mt-6">Ask for an introduction</Btn>
            </aside>
          </div>
        </>
      )}
    </PublicLayout>
  );
};
