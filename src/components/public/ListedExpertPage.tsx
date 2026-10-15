import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ListedExpertProfile } from '../../types';
import { api, ApiError } from '../../services/api';
import { PublicLayout } from './PublicLayout';
import { firstName, formatRate } from '../../data/experts';
import { ExpertHero } from './ExpertParts';
import { ChoiceButton, ExpertProfile, SAMPLE } from './ExpertProfile';
import { Btn } from './ui';

const TIMES = ['10:00', '11:30', '15:00', '17:30'];
const DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/** The booking card for an expert whose sessions are not open yet: the same choices, ending in an introduction. */
const SessionCard: React.FC<{ firstName: string; rate: number }> = ({ firstName, rate }) => {
  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    while (out.length < 4) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
    }
    return out;
  }, []);
  const [minutes, setMinutes] = useState<30 | 60>(30);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState(1);
  const [asked, setAsked] = useState(false);
  const total = Math.round(((rate * minutes) / 60) * 100) / 100;

  return (
    <aside className="rounded-[22px] border border-[var(--nxt-ink)] bg-[var(--nxt-surface)] p-6 sm:p-7 lg:sticky lg:top-28">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display font-bold text-4xl tracking-[-0.03em]">{formatRate(rate)}</p>
        <p className="text-sm text-[var(--nxt-ink-soft)]">{rate === 0 ? 'per session' : 'per hour'}</p>
      </div>

      <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Session length</p>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        {([30, 60] as const).map(m => <ChoiceButton key={m} on={minutes === m} onClick={() => setMinutes(m)}>{m} minutes</ChoiceButton>)}
      </div>

      <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Day</p>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        {days.map((d, i) => <ChoiceButton key={i} on={day === i} onClick={() => setDay(i)}>{DAY.format(d).replace(',', '')}</ChoiceButton>)}
      </div>

      <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Time, India Standard Time</p>
      <div className="mt-2 grid grid-cols-3 gap-2.5">
        {TIMES.map((t, i) => (
          <div key={t} className={i === 3 ? 'col-span-3' : ''}>
            <ChoiceButton on={time === i} onClick={() => setTime(i)}><span className="block w-full">{t}</span></ChoiceButton>
          </div>
        ))}
      </div>

      <p className="mt-6 pt-5 border-t border-[var(--nxt-line)] text-[15px]" aria-live="polite">
        {minutes} minutes · {DAY.format(days[day]).replace(',', '')} · {TIMES[time]} IST{total > 0 && <> · <strong>${total}</strong></>}
      </p>
      <Btn full className="mt-4" onClick={() => setAsked(true)}>Book session</Btn>
      {asked ? (
        <p className="mt-4 text-sm leading-snug" role="status">
          {firstName}'s sessions are not open for online booking yet. <Link to="/#start" className="font-semibold underline">Ask us for an introduction</Link> and we will arrange this time.
        </p>
      ) : (
        <p className="mt-4 text-sm text-[var(--nxt-ink-soft)] leading-snug">Video and chat are built in. You pay the listed rate, and the expert keeps 80% of it.</p>
      )}
    </aside>
  );
};

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
              <SessionCard firstName={first} rate={expert.rate_usd ?? 0} />
            )}
          />
        </>
      )}
    </PublicLayout>
  );
};
