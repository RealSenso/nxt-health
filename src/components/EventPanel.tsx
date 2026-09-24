import React, { useState } from 'react';
import { CalendarCheck, CalendarPlus, Clock, Users, Lock, AlertCircle, Check } from 'lucide-react';
import { Resource, User } from '../types';
import { store } from '../services/store';

interface EventPanelProps {
  resource: Resource;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenMembershipModal: () => void;
}

const DEFAULT_EVENT_MINUTES = 60;

function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function downloadIcs(resource: Resource, startIso: string, minutes: number) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + minutes * 60_000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NxT Health//Events//EN',
    'BEGIN:VEVENT',
    `UID:${resource.id}-${start.getTime()}@nxt-health`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(resource.title)}`,
    `DESCRIPTION:${escapeIcs(`${resource.description}${resource.link ? `\n${resource.link}` : ''}`)}`,
    ...(resource.link ? [`URL:${resource.link}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${resource.title.slice(0, 40).replace(/[^\w\s-]/g, '')}.ics` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const formatSlot = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const EventPanel: React.FC<EventPanelProps> = ({ resource, currentUser, onOpenLogin, onOpenMembershipModal }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (resource.type === 'hospital_connection') return null;

  const isMember = !!currentUser?.is_member;
  const isAdmin = !!currentUser && store.isAdmin(currentUser);
  const slots = (resource.slots || []).filter(slot => new Date(slot).getTime() > Date.now()).sort();
  const isBookable = resource.type === 'session' && (resource.slots || []).length > 0;
  const minutes = resource.slot_minutes || DEFAULT_EVENT_MINUTES;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const gate = !currentUser ? (
    <button onClick={onOpenLogin} className="px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] text-white text-sm font-semibold">Log in to sign up</button>
  ) : !isMember ? (
    <button onClick={onOpenMembershipModal} className="px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] text-white text-sm font-semibold inline-flex items-center gap-1.5">
      <Lock className="w-4 h-4" /> Members can sign up
    </button>
  ) : null;

  const attendees = isAdmin ? store.getEventAttendees(resource.id) : null;

  return (
    <section className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
      <h2 className="font-display text-lg font-bold text-[var(--nxt-ink)] flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-[var(--nxt-mint-strong)]" />
        {isBookable ? 'Book a time' : 'Attend this event'}
      </h2>

      {error && (
        <p className="p-2.5 rounded-xl bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}

      {isBookable ? (
        <BookingSection resource={resource} slots={slots} minutes={minutes} busy={busy} gate={gate} run={run} />
      ) : (
        <RsvpSection resource={resource} minutes={minutes} busy={busy} gate={gate} run={run} />
      )}

      {attendees && (
        <div className="pt-4 border-t border-[var(--nxt-line)]">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Attendees (admin view)
          </p>
          {attendees.rsvps.length === 0 && attendees.bookings.length === 0 ? (
            <p className="text-sm text-[var(--nxt-ink-soft)]">No sign-ups yet.</p>
          ) : (
            <ul className="text-sm text-[var(--nxt-ink)] space-y-1">
              {attendees.rsvps.map(r => <li key={r.id}>{r.user_name}</li>)}
              {attendees.bookings.map(b => <li key={b.slot}>{b.user_name} — {formatSlot(b.slot)}</li>)}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

interface SectionProps {
  resource: Resource;
  minutes: number;
  busy: boolean;
  gate: React.ReactNode;
  run: (action: () => Promise<void>) => Promise<void>;
}

const RsvpSection: React.FC<SectionProps> = ({ resource, minutes, busy, gate, run }) => {
  const going = store.hasRsvp(resource.id);
  const count = resource.rsvp_count || 0;
  const full = !!resource.capacity && count >= resource.capacity;
  const ended = !!resource.starts_at && new Date(resource.starts_at).getTime() < Date.now() - 86_400_000;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[var(--nxt-ink-soft)]">
        {(resource.starts_at || resource.date) && (
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {resource.starts_at ? formatSlot(resource.starts_at) : resource.date}</span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {resource.capacity ? `${count} of ${resource.capacity} spots taken` : `${count} attending`}
        </span>
      </div>
      {ended ? (
        <p className="text-sm text-[var(--nxt-ink-soft)]">This event has already happened.</p>
      ) : gate ? gate : going ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] text-sm font-semibold">
            <Check className="w-4 h-4" /> You're going
          </span>
          {resource.starts_at && (
            <button onClick={() => downloadIcs(resource, resource.starts_at!, minutes)} className="px-4 py-2 rounded-full border border-[var(--nxt-line)] text-sm font-semibold text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)] inline-flex items-center gap-1.5">
              <CalendarPlus className="w-4 h-4" /> Add to calendar
            </button>
          )}
          <button disabled={busy} onClick={() => run(() => store.cancelRsvp(resource.id))} className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)]">
            Cancel RSVP
          </button>
        </div>
      ) : (
        <button
          id="btn-rsvp"
          disabled={busy || full}
          onClick={() => run(() => store.rsvp(resource.id))}
          className="px-5 py-2.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] disabled:opacity-60 text-white text-sm font-semibold"
        >
          {full ? 'Event is full' : busy ? 'Saving…' : 'RSVP'}
        </button>
      )}
    </div>
  );
};

const BookingSection: React.FC<SectionProps & { slots: string[] }> = ({ resource, slots, minutes, busy, gate, run }) => {
  const mine = store.getMyBooking(resource.id);
  const taken = new Set(store.getBookedSlots(resource.id));

  if (gate) return <>{gate}</>;

  if (mine) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] text-sm font-semibold">
          <Check className="w-4 h-4" /> Booked for {formatSlot(mine.slot)}
        </span>
        <button onClick={() => downloadIcs(resource, mine.slot, minutes)} className="px-4 py-2 rounded-full border border-[var(--nxt-line)] text-sm font-semibold text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)] inline-flex items-center gap-1.5">
          <CalendarPlus className="w-4 h-4" /> Add to calendar
        </button>
        <button disabled={busy} onClick={() => run(() => store.cancelBooking(resource.id, mine.slot))} className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)]">
          Cancel booking
        </button>
      </div>
    );
  }

  if (slots.length === 0) return <p className="text-sm text-[var(--nxt-ink-soft)]">No upcoming times are open right now — check back soon.</p>;

  return (
    <div>
      <p className="text-sm text-[var(--nxt-ink-soft)] mb-3">{minutes}-minute 1-on-1 · pick a time that works (shown in your local time zone).</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {slots.map(slot => {
          const isTaken = taken.has(slot);
          return (
            <button
              key={slot}
              disabled={busy || isTaken}
              onClick={() => run(() => store.bookSlot(resource.id, slot))}
              className={`px-3 py-2.5 rounded-2xl border text-sm font-semibold text-left transition-colors ${
                isTaken
                  ? 'border-[var(--nxt-line)] bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] line-through cursor-not-allowed'
                  : 'border-[var(--nxt-line)] hover:border-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint)]/30 text-[var(--nxt-ink)]'
              }`}
            >
              {formatSlot(slot)}
              {isTaken && <span className="block text-xs font-normal no-underline">Taken</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
