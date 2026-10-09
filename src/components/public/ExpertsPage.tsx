import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search } from 'lucide-react';
import type { ListedExpert, PublicExpert } from '../../types';
import { api } from '../../services/api';
import { EXPERT_AREAS, formatRate, initials } from '../../data/experts';
import { ListedExperts } from '../ui/ListedExperts';
import { PublicLayout } from './PublicLayout';
import { Btn, Eyebrow, H1, H2, Step } from './ui';

/** Photo or, when there isn't one, the expert's initials on a grey tile. */
export const ExpertPhoto: React.FC<{ expert: Pick<PublicExpert, 'name' | 'photo_url'>; className?: string }> = ({ expert, className = '' }) => (
  expert.photo_url
    ? <img src={expert.photo_url} alt={expert.name} className={`object-cover ${className}`} loading="lazy" />
    : <div className={`flex items-center justify-center bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-display font-bold tracking-wide ${className}`} aria-hidden="true">{initials(expert.name)}</div>
);

export const ExpertsPage: React.FC = () => {
  const [experts, setExperts] = useState<PublicExpert[] | null>(null);
  const [listed, setListed] = useState<ListedExpert[]>([]);
  const [error, setError] = useState('');
  const [area, setArea] = useState<string>('All experts');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    api.get<{ experts: PublicExpert[]; listed?: ListedExpert[] }>('/public/experts')
      .then(r => { if (alive) { setExperts(r.experts); setListed(r.listed || []); } })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Could not load experts.'); });
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (experts || []).filter(x =>
      (area === 'All experts' || x.expert_areas.includes(area)) &&
      (!q || [x.name, x.headline, x.bio, ...x.topics, ...x.expert_areas].join(' ').toLowerCase().includes(q)));
  }, [experts, area, query]);

  return (
    <PublicLayout variant="experts">
      {/* Hero */}
      <section className="nxt-container pt-16 sm:pt-24 pb-16 sm:pb-20 border-b border-[var(--nxt-line)]">
        <Eyebrow>NXT Health Experts</Eyebrow>
        <H1 className="mt-7 max-w-[18ch]">Book the people who have taken health innovation to patients.</H1>
        <p className="mt-8 max-w-[38rem] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed text-[var(--nxt-ink)]/80">
          One-to-one video sessions with clinicians, regulatory leads, hospital operators and commercial builders. Each one is matched to the step you are on.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Btn to="/experts#find">Find an expert</Btn>
          <Btn variant="outline" to="/experts/join">Become an expert</Btn>
        </div>
      </section>

      <section className="nxt-container py-14 border-b border-[var(--nxt-line)]">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display font-bold text-xl tracking-[-0.02em]">People who have done it</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">Experts in clinical validation, regulatory affairs, hospital access and market entry. NXT reviews every one before they are listed.</p>
          </div>
          <div>
            <h3 className="font-display font-bold text-xl tracking-[-0.02em]">Advice for the step you are on</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">Your roadmap has gates. Each expert is mapped to the gates where they help most, so you book the right person at the right time.</p>
          </div>
          <div>
            <h3 className="font-display font-bold text-xl tracking-[-0.02em]">One session at a time</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">Pay per session at the expert's listed rate, from free to $500 an hour. No retainers and no equity asked for.</p>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section id="find" className="nxt-container py-20 scroll-mt-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <H2>Find your expert</H2>
            <p className="mt-3 text-lg text-[var(--nxt-ink-soft)]">Medical devices come first. More routes open as the roadmaps go live.</p>
          </div>
          <label className="block w-full lg:w-[22rem]">
            <span className="block text-sm text-[var(--nxt-ink-soft)] mb-1.5">What are you stuck on?</span>
            <span className="relative block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nxt-ink-soft)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: device classification"
                className="w-full h-12 rounded-full border border-[var(--nxt-ink)] bg-transparent pl-11 pr-5 text-[15px] placeholder:text-[var(--nxt-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--nxt-ink)]/25"
                id="input-expert-search"
              />
            </span>
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5" role="tablist" aria-label="Filter experts">
          {['All experts', ...EXPERT_AREAS].map(label => (
            <button
              key={label}
              role="tab"
              aria-selected={area === label}
              onClick={() => setArea(label)}
              className={`rounded-full border px-4 py-2 text-[15px] transition-colors ${
                area === label ? 'bg-[var(--nxt-mint-strong)] text-white border-[var(--nxt-mint-strong)]' : 'border-[var(--nxt-ink)]/70 hover:bg-[var(--nxt-bg-soft)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--nxt-ink-soft)]" aria-live="polite">
          {experts === null && !error ? 'Loading experts…' : `${shown.length} expert${shown.length === 1 ? '' : 's'}`}
        </p>
        {error && <p className="mt-3 text-[var(--nxt-peach-deep)] font-semibold">{error}</p>}

        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map(expert => (
            <Link
              key={expert.id}
              to={`/experts/${expert.id}`}
              className="group rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] overflow-hidden flex flex-col hover:border-[var(--nxt-ink)] transition-colors"
            >
              <ExpertPhoto expert={expert} className="w-full aspect-[3/2] text-4xl" />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display font-bold text-xl tracking-[-0.02em] flex items-center gap-2">
                  {expert.name}
                  <CheckCircle2 className="w-[18px] h-[18px] text-[var(--nxt-ink)] shrink-0" aria-label="Verified by NXT" />
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed">{expert.bio || expert.headline}</p>
                {expert.topics.length > 0 && <p className="mt-3 text-[13px] leading-snug text-[var(--nxt-ink-soft)]">{expert.topics.join(' · ')}</p>}
                <div className="mt-auto pt-5">
                  <div className="border-t border-[var(--nxt-line)] pt-4 flex items-baseline justify-between">
                    <span className="font-bold text-lg">{formatRate(expert.rate_usd)}</span>
                    <span className="text-sm text-[var(--nxt-ink-soft)]">{expert.rate_usd === 0 ? 'per session' : 'per hour'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {experts !== null && shown.length === 0 && !error && (
          <div className="mt-6 rounded-[18px] border border-dashed border-[var(--nxt-line)] p-10 text-center">
            <p className="font-display font-bold text-xl">{experts.length === 0 ? 'Experts are joining soon.' : 'No expert matches that yet.'}</p>
            <p className="mt-2 text-[var(--nxt-ink-soft)]">{experts.length === 0 ? 'Check back shortly, or tell us who you would like to see.' : 'Try another topic, or clear the search.'}</p>
            {experts.length > 0 && <Btn variant="outline" size="sm" className="mt-5" onClick={() => { setArea('All experts'); setQuery(''); }}>Show all experts</Btn>}
          </div>
        )}
        <ListedExperts experts={listed} className="mt-16" />
      </section>

      {/* How it works */}
      <section className="nxt-container pb-20">
        <H2 className="text-[clamp(1.6rem,2.6vw,2.4rem)]">How it works</H2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <Step n="01" title="Find an expert">Browse by topic, or let your roadmap recommend someone for the gate you are working on.</Step>
          <Step n="02" title="Book a video call">Pick a time that works for both of you and pay the listed rate. Video and chat are built in.</Step>
          <Step n="03" title="Clear the gate">Ask the questions you would not ask out loud, and leave knowing what to do next.</Step>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="bg-[#111] text-white scroll-mt-16">
        <div className="nxt-container py-20 sm:py-24">
          <p className="text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-white/60">Our mission</p>
          <H2 className="mt-5 max-w-[22ch] !text-[clamp(2rem,4.4vw,3.75rem)]">The bridge between innovation and patients.</H2>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/85">
            A good clinical idea should never stall because its founder did not know who to ask. NXT Health connects clinical problems, physician-founders, capital, hospitals and commercial help, so that what works reaches patients faster.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="border-t border-white/30 pt-4">
              <p className="font-display font-bold text-4xl tracking-[-0.03em]">1 in 5</p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">physicians we speak with has an idea they want to build. Most never start, because they do not know where to begin.</p>
            </div>
            <div className="border-t border-white/30 pt-4">
              <p className="font-display font-bold text-4xl tracking-[-0.03em]">Problem first</p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">Doctors, hospitals and pharma state the problem, and fund it, before a founder starts work.</p>
            </div>
            <div className="border-t border-white/30 pt-4">
              <p className="font-display font-bold text-4xl tracking-[-0.03em]">Physician-led</p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">Led by Dr. Smita Karpate, Co-Founder and Visionary. India's first physician-led clinical innovation ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Become an expert */}
      <section className="nxt-container py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-24 items-start">
          <div>
            <H2 className="max-w-[18ch]">Help build the largest health innovation community in the world.</H2>
            <p className="mt-5 text-lg text-[var(--nxt-ink-soft)] max-w-lg">Seasoned experts join NXT Health to build with us, and to be within reach of founders anywhere.</p>
            <Btn to="/experts/join" className="mt-8">Build with us</Btn>
          </div>
          <ul className="border-t border-[var(--nxt-line)]">
            {['Be part of NXT Health and what we are building', 'Work with founders inside a startup system', "Put your experience behind someone else's idea", 'A revenue share that follows your experience and demand'].map(item => (
              <li key={item} className="py-5 border-b border-[var(--nxt-line)] text-[17px]">{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
};
