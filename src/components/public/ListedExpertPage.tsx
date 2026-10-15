import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ListedExpertProfile } from '../../types';
import { api, ApiError } from '../../services/api';
import { PublicLayout } from './PublicLayout';
import { firstName, formatRate } from '../../data/experts';
import { ExpertHero } from './ExpertParts';
import { ExpertProfile, SAMPLE } from './ExpertProfile';
import { Btn } from './ui';

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

  const first = expert ? firstName(expert.name) : '';
  const highlights = expert
    ? (expert.highlights.length ? expert.highlights : expert.facts.length ? expert.facts : [
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
            tagline={expert.tagline}
            location={expert.location}
            eyebrow={expert.specialisation ? `NXT expert network · ${expert.specialisation}` : 'NXT expert network'}
            photoUrl={expert.photo_url}
            videoUrl={expert.intro_video_url}
            linkedin={expert.linkedin}
            verified
            backTo="/experts#find"
            highlights={highlights.length ? highlights : SAMPLE.highlights}
          />
          <ExpertProfile
            expertId={expert.id}
            firstName={first}
            name={expert.name}
            photoUrl={expert.photo_url}
            headline={expert.title}
            topics={expert.tags.length ? expert.tags : expert.specialisation ? [expert.specialisation] : []}
            bio={[expert.bio, expert.how_to_help].filter(Boolean).join('\n\n')}
            aside={(
              <aside className="rounded-[22px] border border-[var(--nxt-ink)] bg-[var(--nxt-surface)] p-6 sm:p-7 lg:sticky lg:top-28">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display font-bold text-4xl tracking-[-0.03em]">{formatRate(expert.rate_usd ?? 0)}</p>
                  <p className="text-sm text-[var(--nxt-ink-soft)]">{(expert.rate_usd ?? 0) === 0 ? 'per session' : 'per hour'}</p>
                </div>
                <p className="mt-6 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">
                  Online booking opens once {first} sets up their sessions. Until then, tell us what you need and we will make the introduction.
                </p>
                <Btn to="/#start" full className="mt-6">Ask for an introduction</Btn>
                <p className="mt-4 text-sm text-[var(--nxt-ink-soft)] leading-snug">Video and chat are built in. You pay the listed rate, and the expert keeps 80% of it.</p>
              </aside>
            )}
          />
        </>
      )}
    </PublicLayout>
  );
};
