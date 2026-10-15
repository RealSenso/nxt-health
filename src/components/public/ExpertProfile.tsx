import React from 'react';
import { CheckCircle2, Play } from 'lucide-react';
import { GATES } from '../../data/experts';
import { ExpertActivity } from './ExpertParts';
import { ExpertPhoto } from './ExpertDirectory';
import { RuleList } from './ui';

// Shown until an admin fills in the expert's own words, so every profile reads as a complete page.
export const SAMPLE = {
  bio: "Two or three lines in the expert's own words: what they have taken to market, in which countries, and for whom.",
  bookWhen: [
    'Work out your device class and the route that follows from it',
    'Plan the evidence a regulator will ask for',
    'Check a regulatory file before you submit it',
    'Decide whether India, the GCC or the US comes first',
  ],
  gates: [3, 4],
  highlights: [
    { title: 'Has done it before', text: 'Years of hands-on work taking products from idea to patients.' },
    { title: 'Knows the buyers', text: 'Hospitals, payers and pharma teams who say yes or no.' },
    { title: 'Answers in an hour', text: 'Short sessions, matched to the gate you are working on.' },
  ],
  channelTitle: 'Episode title from the NXT Health channel',
};

interface Props {
  expertId: string;
  firstName: string;
  name: string;
  photoUrl?: string;
  headline: string;
  topics: string[];
  bio?: string;
  bookWhen?: string[];
  gates?: number[];
  /** The right-hand card: booking, or how to reach NXT. */
  aside: React.ReactNode;
}

/** The profile under the dark hero: who they are, when to book them, where they fit on the roadmap, and the card to act on. */
export const ExpertProfile: React.FC<Props> = ({ expertId, firstName, name, photoUrl, headline, topics, bio, bookWhen, gates, aside }) => {
  const when = bookWhen && bookWhen.length ? bookWhen : SAMPLE.bookWhen;
  const fit = gates && gates.length ? gates : SAMPLE.gates;
  return (
    <div className="nxt-container pt-14 pb-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_26rem] xl:grid-cols-[1fr_28rem] lg:gap-20 items-start">
        <div>
          <div className="flex items-start gap-5 sm:gap-6">
            <ExpertPhoto expert={{ name, photo_url: photoUrl || '' }} className="w-24 h-24 sm:w-40 sm:h-40 rounded-2xl shrink-0 text-3xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display font-bold text-[clamp(1.9rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.03em]">{name}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nxt-ink)] px-3 py-1 text-sm"><CheckCircle2 className="w-4 h-4" /> Verified by NXT</span>
              </div>
              {headline && <p className="mt-2 text-xl">{headline}</p>}
              {topics.length > 0 && <p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)]">{topics.join(' · ')}</p>}
            </div>
          </div>

          <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">About</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-[var(--nxt-ink)]/85 max-w-2xl whitespace-pre-line">{bio || SAMPLE.bio}</p>

          <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">Book this expert when you need to</h2>
          <RuleList items={when} className="mt-4 max-w-2xl text-[17px]" />

          <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">Where this expert fits on your roadmap</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {GATES.map((gate, i) => (
              <span key={gate} className={`rounded-full border px-4 py-2 text-[15px] ${fit.includes(i + 1) ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent font-semibold' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>
                0{i + 1} {gate}
              </span>
            ))}
          </div>

          <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">On the NXT Health channel</h2>
          <div className="mt-4 max-w-xl aspect-video rounded-2xl bg-[#111] flex items-center justify-center" role="img" aria-label="Video from the NXT Health channel">
            <span className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center"><Play className="w-6 h-6 text-white fill-white ml-1" /></span>
          </div>
          <p className="mt-3 text-[15px]">{SAMPLE.channelTitle}</p>

          <ExpertActivity expertId={expertId} firstName={firstName} />
        </div>

        {aside}
      </div>
    </div>
  );
};
