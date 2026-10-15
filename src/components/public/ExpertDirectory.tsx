import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search } from 'lucide-react';
import type { PublicExpert } from '../../types';
import { api } from '../../services/api';
import { assetUrl, EXPERT_AREAS, formatRate, initials } from '../../data/experts';
import { Btn, H2 } from './ui';

/** Photo or, when there isn't one, the expert's initials on a grey tile. */
export const ExpertPhoto: React.FC<{ expert: Pick<PublicExpert, 'name' | 'photo_url'>; className?: string }> = ({ expert, className = '' }) => (
  expert.photo_url
    ? <img src={assetUrl(expert.photo_url)} alt={expert.name} className={`object-cover ${className}`} loading="lazy" />
    : <div className={`flex items-center justify-center bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-display font-bold tracking-wide ${className}`} aria-hidden="true">{initials(expert.name)}</div>
);

/** "Find your expert": search, area filters and a card for each bookable expert. */
export const ExpertDirectory: React.FC = () => {
  const [experts, setExperts] = useState<PublicExpert[] | null>(null);
  const [error, setError] = useState('');
  const [area, setArea] = useState<string>('All experts');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    api.get<{ experts: PublicExpert[] }>('/public/experts')
      .then(r => { if (alive) setExperts(r.experts); })
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
    <section id="find" className="scroll-mt-20">
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
              area === label ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-ink)]/70 hover:bg-[var(--nxt-bg-soft)]'
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
          <p className="mt-2 text-[var(--nxt-ink-soft)]">{experts.length === 0 ? 'Check back shortly.' : 'Try another topic, or clear the search.'}</p>
          {experts.length > 0 && <Btn variant="outline" size="sm" className="mt-5" onClick={() => { setArea('All experts'); setQuery(''); }}>Show all experts</Btn>}
        </div>
      )}
    </section>
  );
};
