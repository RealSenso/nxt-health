import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Linkedin, Play } from 'lucide-react';
import type { ExpertItem, ExpertItemKind } from '../../types';
import { api } from '../../services/api';
import { assetUrl, initials } from '../../data/experts';

/** A neutral stand-in portrait for experts who have not added a photo yet: a soft studio backdrop and a silhouette. */
export function placeholderPortrait(name: string): string {
  const mark = initials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a2a"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="190" r="78" fill="#4a4a4a"/><path d="M40 500c0-110 70-170 160-170s160 60 160 170z" fill="#4a4a4a"/><text x="200" y="215" font-family="Helvetica,Arial,sans-serif" font-size="64" font-weight="700" text-anchor="middle" fill="#e8e8e8">${mark.replace(/[<&>]/g, '')}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface HeroProps {
  name: string;
  title: string;
  eyebrow: string;
  photoUrl: string;
  videoUrl: string;
  linkedin?: string;
  highlights: { title: string; text: string }[];
  backTo: string;
  /** A short line shown above the role, and where they are based. */
  tagline?: string;
  location?: string;
}

/** The dark opening of an expert's page: portrait, name, role, an introduction video and three things to know. */
export const ExpertHero: React.FC<HeroProps> = ({ name, title, eyebrow, photoUrl, videoUrl, linkedin, highlights, backTo, tagline, location }) => {
  const first = name.split(' ')[0];
  return (
    <section className="bg-black text-white">
      <div className="nxt-container pt-8 pb-16 sm:pb-20">
        <Link to={backTo} className="inline-flex items-center gap-1 text-[15px] text-white/70 hover:text-white"><ChevronLeft className="w-4 h-4" /> All experts</Link>
        <div className="mt-10 grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-20 items-start">
          <img src={photoUrl ? assetUrl(photoUrl) : placeholderPortrait(name)} alt={name} className="w-full max-w-[22rem] aspect-[4/5] rounded-[8px] object-cover object-top bg-[#111]" />
          <div>
            <p className="text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-white/60">{eyebrow}</p>
            <h1 className="font-display font-bold text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[1.02] tracking-[-0.04em] mt-4">{name}</h1>
            {tagline && <p className="mt-3 text-xl font-semibold text-white">{tagline}</p>}
            {title && <p className={`${tagline ? 'mt-1.5 text-lg' : 'mt-3 text-xl'} text-white/80 max-w-2xl`}>{title}</p>}
            {location && <p className="mt-2 text-[15px] text-white/60">{location}</p>}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold underline underline-offset-2">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}

            {videoUrl ? (
              <a href={videoUrl} target="_blank" rel="noreferrer" className="mt-8 flex flex-col items-center justify-center text-center rounded-[12px] border border-white/15 bg-[#161616] hover:bg-[#1c1c1c] transition-colors h-56 sm:h-72 px-6">
                <span className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center"><Play className="w-6 h-6 ml-0.5" /></span>
                <span className="mt-6 font-bold text-lg">Watch {first}'s introduction</span>
                <span className="mt-2 text-[12px] uppercase tracking-[0.14em] text-white/60">Introductory video</span>
              </a>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center text-center rounded-[12px] border border-white/15 bg-[#161616] h-56 sm:h-72 px-6" aria-label="Introduction video coming soon">
                <span className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center text-white/50"><Play className="w-6 h-6 ml-0.5" /></span>
                <span className="mt-6 font-bold text-lg text-white/80">{first}'s introduction</span>
                <span className="mt-2 text-[12px] uppercase tracking-[0.14em] text-white/50">Video coming soon</span>
              </div>
            )}

            {highlights.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {highlights.slice(0, 3).map((h, i) => (
                  <div key={i} className="border-t border-white/25 pt-4 text-[15px] leading-relaxed text-white/70">
                    <strong className="text-white">{h.title}.</strong> {h.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/** The dark "why we exist" style block: a large statement and the expert's own words. */
export const ExpertStory: React.FC<{ eyebrow: string; heading: string; paragraphs: string[] }> = ({ eyebrow, heading, paragraphs }) => {
  const texts = paragraphs.filter(Boolean);
  if (!heading && texts.length === 0) return null;
  return (
    <section className="bg-black text-white border-t border-white/10">
      <div className="nxt-container py-16 sm:py-20">
        <p className="text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-white/60">{eyebrow}</p>
        <h2 className="font-display font-bold text-[clamp(2rem,4.4vw,3.75rem)] leading-[1.05] tracking-[-0.035em] mt-5 max-w-[22ch]">{heading}</h2>
        <div className="mt-8 max-w-2xl space-y-6 text-xl leading-relaxed text-white/85">
          {texts.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
        </div>
      </div>
    </section>
  );
};

const KIND_LABEL: Record<ExpertItemKind, string> = {
  webinar: 'Webinars', podcast: 'Podcasts', blog: 'Articles', publication: 'Publications', media: 'In the media', other: 'Also',
};
const KIND_ORDER: ExpertItemKind[] = ['webinar', 'podcast', 'blog', 'publication', 'media', 'other'];

/** Webinars, podcasts, articles and other things an expert has put out. Hidden when there are none. */
export const ExpertActivity: React.FC<{ expertId: string; firstName: string }> = ({ expertId, firstName }) => {
  const [items, setItems] = useState<ExpertItem[]>([]);
  useEffect(() => {
    let alive = true;
    api.get<{ items: ExpertItem[] }>(`/public/expert-items/${expertId}`).then(r => { if (alive) setItems(r.items); }).catch(() => undefined);
    return () => { alive = false; };
  }, [expertId]);
  if (items.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="font-display font-bold text-2xl tracking-[-0.02em]">From {firstName}</h2>
      {KIND_ORDER.map(kind => {
        const group = items.filter(i => i.kind === kind);
        if (group.length === 0) return null;
        return (
          <section key={kind} className="mt-7">
            <h3 className="text-sm uppercase tracking-[0.12em] text-[var(--nxt-ink-soft)]">{KIND_LABEL[kind]}</h3>
            <ul className="mt-3 divide-y divide-[var(--nxt-line)] border-y border-[var(--nxt-line)]">
              {group.map(item => (
                <li key={item.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--nxt-ink)]">{item.title}</p>
                      {item.summary && <p className="mt-1 text-[15px] text-[var(--nxt-ink-soft)]">{item.summary}</p>}
                    </div>
                    <div className="shrink-0 text-right text-sm text-[var(--nxt-ink-soft)]">
                      {item.date && <p>{item.date}</p>}
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold underline mt-1">Open <ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
