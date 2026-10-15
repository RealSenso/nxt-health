import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Play } from 'lucide-react';
import type { Consultation, PublicExpert } from '../../types';
import { api, ApiError } from '../../services/api';
import { store } from '../../services/store';
import { firstName, GATES, formatRate, istDateKey, istDayLabel, istTime } from '../../data/experts';
import { PublicLayout } from './PublicLayout';
import { ExpertActivity, ExpertHero } from './ExpertParts';
import { ChoiceButton, SAMPLE } from './ExpertProfile';
import { PayConsultationDialog } from './PayConsultationDialog';
import { Btn, RuleList } from './ui';

const MAX_DAYS = 6;

export const ExpertDetailPage: React.FC = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<{ expert: PublicExpert; slots: string[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [minutes, setMinutes] = useState<30 | 60>(30);
  const [dayKey, setDayKey] = useState('');
  const [slot, setSlot] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState<Consultation | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.get<{ expert: PublicExpert; slots: string[] }>(`/public/experts/${expertId}`));
      setLoadError('');
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setNotFound(true);
      else setLoadError(e instanceof Error ? e.message : 'Could not load this expert.');
    }
  }, [expertId]);

  useEffect(() => { setData(null); setNotFound(false); setSlot(''); void load(); }, [load]);

  const days = useMemo(() => {
    const byDay = new Map<string, string[]>();
    for (const s of data?.slots || []) {
      const key = istDateKey(s);
      byDay.set(key, [...(byDay.get(key) || []), s]);
    }
    return Array.from(byDay.entries()).slice(0, MAX_DAYS);
  }, [data]);

  useEffect(() => {
    if (days.length && !days.some(([key]) => key === dayKey)) setDayKey(days[0][0]);
  }, [days, dayKey]);

  const times = days.find(([key]) => key === dayKey)?.[1] || [];
  const expert = data?.expert;
  const total = expert ? Math.round(((expert.rate_usd * minutes) / 60) * 100) / 100 : 0;

  const book = async () => {
    if (!expert || !slot) return;
    if (!store.isAuthenticated()) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setBusy(true);
    setError('');
    try {
      const booking = await store.bookConsultation({ mentor_uid: expert.id, minutes, slot });
      if (booking.status === 'paid') navigate(booking.thread_id ? `/messages/${booking.thread_id}` : '/messages');
      else setPaying(booking);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      if (e instanceof ApiError && e.status === 409) { setSlot(''); void load(); }
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <PublicLayout variant="experts">
        <section className="nxt-container py-24">
          <h1 className="font-display font-bold text-4xl tracking-[-0.03em]">We couldn't find that expert.</h1>
          <p className="mt-4 text-[var(--nxt-ink-soft)]">They may no longer be taking bookings.</p>
          <Btn to="/experts" className="mt-8">See all experts</Btn>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout variant="experts">
      {loadError && <div className="nxt-container pt-10"><p className="font-semibold text-[var(--nxt-peach-deep)]">{loadError}</p></div>}
      {!expert && !loadError && <div className="nxt-container pt-10"><p className="text-[var(--nxt-ink-soft)]">Loading…</p></div>}

      {expert && (
        <>
          <ExpertHero
            name={expert.name}
            title={expert.headline}
            eyebrow={expert.expert_areas[0] ? `NXT expert network · ${expert.expert_areas[0]}` : 'NXT expert network'}
            verified
            photoUrl={expert.photo_url}
            videoUrl={expert.intro_video_url || ''}
            backTo="/experts#find"
            highlights={expert.highlights && expert.highlights.length ? expert.highlights : SAMPLE.highlights}
          />
          <div className="nxt-container pt-14 pb-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_26rem] xl:grid-cols-[1fr_28rem] lg:gap-20 items-start">
            <div>
              <h2 className="font-display font-bold text-2xl tracking-[-0.02em]">About</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-[var(--nxt-ink)]/85 max-w-2xl">{expert.bio || SAMPLE.bio}</p>

              {(
                <>
                  <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">Book this expert when you need to</h2>
                  <RuleList items={expert.book_when.length ? expert.book_when : SAMPLE.bookWhen} className="mt-4 max-w-2xl text-[17px]" />
                </>
              )}

              {(
                <>
                  <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">Where this expert fits on your roadmap</h2>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {GATES.map((gate, i) => {
                      const on = (expert.fits_gates.length ? expert.fits_gates : SAMPLE.gates).includes(i + 1);
                      return (
                        <span key={gate} className={`rounded-full border px-4 py-2 text-[15px] ${on ? 'bg-[var(--nxt-mint-strong)] text-white border-[var(--nxt-mint-strong)] font-semibold' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>
                          0{i + 1} {gate}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}

              <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">On the NXT Health channel</h2>
              <div className="mt-4 max-w-xl aspect-video rounded-2xl bg-[#111] flex items-center justify-center" role="img" aria-label="Video from the NXT Health channel">
                <span className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center"><Play className="w-6 h-6 text-white fill-white ml-1" /></span>
              </div>
              <p className="mt-3 text-[15px]">{SAMPLE.channelTitle}</p>

              <ExpertActivity expertId={expert.id} firstName={firstName(expert.name)} />
            </div>

            {/* Booking */}
            <aside className="rounded-[22px] border border-[var(--nxt-ink)] bg-[var(--nxt-surface)] p-6 sm:p-7 lg:sticky lg:top-28">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display font-bold text-4xl tracking-[-0.03em]">{formatRate(expert.rate_usd)}</p>
                <p className="text-sm text-[var(--nxt-ink-soft)]">{expert.rate_usd === 0 ? 'per session' : 'per hour'}</p>
              </div>

              {days.length === 0 ? (
                <p className="mt-6 text-[var(--nxt-ink-soft)]">No open times right now — check back soon.</p>
              ) : (
                <>
                  <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Session length</p>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    {([30, 60] as const).map(m => (
                      <ChoiceButton key={m} on={minutes === m} onClick={() => setMinutes(m)}>{m} minutes</ChoiceButton>
                    ))}
                  </div>

                  <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Day</p>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    {days.map(([key, list]) => (
                      <ChoiceButton key={key} on={dayKey === key} onClick={() => { setDayKey(key); setSlot(''); }}>{istDayLabel(list[0])}</ChoiceButton>
                    ))}
                  </div>

                  <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Time, India Standard Time</p>
                  <div className="mt-2 grid grid-cols-3 gap-2.5">
                    {times.map((s, i) => (
                      <div key={s} className={i === times.length - 1 && times.length % 3 === 1 ? 'col-span-3' : ''}>
                        <ChoiceButton on={slot === s} onClick={() => setSlot(s)}><span className="block w-full">{istTime(s)}</span></ChoiceButton>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 pt-5 border-t border-[var(--nxt-line)] text-[15px]" aria-live="polite">
                    {slot ? <>{minutes} minutes · {istDayLabel(slot)} · {istTime(slot)} IST{total > 0 && <> · <strong>${total}</strong></>}</> : <span className="text-[var(--nxt-ink-soft)]">Choose a time to continue.</span>}
                  </p>
                  {error && <p className="mt-3 text-sm font-semibold text-[var(--nxt-peach-deep)] flex items-start gap-1.5" role="alert"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</p>}
                  <Btn id="btn-book-session" full disabled={!slot || busy} onClick={book} className="mt-4">
                    {busy ? 'Booking…' : store.isAuthenticated() ? 'Book session' : 'Log in to book'}
                  </Btn>
                  <p className="mt-4 text-sm text-[var(--nxt-ink-soft)] leading-snug">
                    Video and chat are built in. You pay the listed rate, and the expert keeps 80% of it.
                  </p>
                </>
              )}
            </aside>
          </div>
          </div>
        </>
      )}

      {paying && (
        <PayConsultationDialog
          booking={paying}
          onClose={() => { setPaying(null); navigate('/mentors'); }}
          onPaid={(threadId) => { setPaying(null); navigate(threadId ? `/messages/${threadId}` : '/messages'); }}
        />
      )}
    </PublicLayout>
  );
};
