import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, CheckCircle2 } from 'lucide-react';
import type { Consultation, PublicExpert } from '../../types';
import { api, ApiError } from '../../services/api';
import { store } from '../../services/store';
import { GATES, formatRate, istDateKey, istDayLabel, istTime } from '../../data/experts';
import { PublicLayout } from './PublicLayout';
import { ExpertPhoto } from './ExpertsPage';
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
      <div className="nxt-container pt-10 pb-24">
        <Link to="/experts#find" className="inline-flex items-center gap-1 text-[15px] hover:underline"><ChevronLeft className="w-4 h-4" /> All experts</Link>

        {loadError && <p className="mt-8 font-semibold text-[var(--nxt-peach-deep)]">{loadError}</p>}
        {!expert && !loadError && <p className="mt-8 text-[var(--nxt-ink-soft)]">Loading…</p>}

        {expert && (
          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_26rem] xl:grid-cols-[1fr_28rem] lg:gap-20 items-start">
            <div>
              <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                <ExpertPhoto expert={expert} className="w-32 h-32 rounded-[18px] text-3xl shrink-0" />
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h1 className="font-display font-bold text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.03em]">{expert.name}</h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nxt-ink)] px-3 py-1 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Verified by NXT
                    </span>
                  </div>
                  {expert.headline && <p className="mt-2 text-xl">{expert.headline}</p>}
                  {expert.topics.length > 0 && <p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)]">{expert.topics.join(' · ')}</p>}
                </div>
              </div>

              {expert.bio && (
                <>
                  <h2 className="font-display font-bold text-xl mt-12 tracking-[-0.02em]">About</h2>
                  <p className="mt-3 text-[17px] leading-relaxed text-[var(--nxt-ink)]/80 max-w-2xl whitespace-pre-line">{expert.bio}</p>
                </>
              )}

              {expert.book_when.length > 0 && (
                <>
                  <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">Book this expert when you need to</h2>
                  <RuleList items={expert.book_when} className="mt-4 max-w-2xl text-[17px]" />
                </>
              )}

              {expert.fits_gates.length > 0 && (
                <>
                  <h2 className="font-display font-bold text-2xl mt-12 tracking-[-0.02em]">Where this expert fits on your roadmap</h2>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {GATES.map((gate, i) => {
                      const on = expert.fits_gates.includes(i + 1);
                      return (
                        <span key={gate} className={`rounded-full border px-4 py-2 text-[15px] ${on ? 'bg-[var(--nxt-mint-strong)] text-white border-[var(--nxt-mint-strong)] font-semibold' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>
                          0{i + 1} {gate}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
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
                    {times.map(s => (
                      <ChoiceButton key={s} on={slot === s} onClick={() => setSlot(s)}>{istTime(s)}</ChoiceButton>
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
        )}
      </div>

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

const ChoiceButton: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode }> = ({ on, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    className={`h-11 rounded-xl border text-[15px] transition-colors ${
      on ? 'bg-[var(--nxt-mint-strong)] text-white border-[var(--nxt-mint-strong)] font-semibold' : 'border-[var(--nxt-ink)]/80 hover:bg-[var(--nxt-bg-soft)]'
    }`}
  >
    {children}
  </button>
);
