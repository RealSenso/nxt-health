import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Sparkles, Check, X, Clock, MessageSquare, AlertCircle, Users, Send } from 'lucide-react';
import { MentorProfile, User } from '../types';
import { store, MentorProfileInput } from '../services/store';
import { rankMentors } from '../data/mentorMatching';
import { STAGE_TAGS } from '../data/stepGuides';
import { BACKGROUND_OPTIONS, labelFor } from '../data/profileOptions';
import { PageHeader } from './ui/PageHeader';

const inputClass = 'w-full text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl px-3 py-2.5 text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)]';

const STATUS_CHIP: Record<string, string> = {
  pending: 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]',
  accepted: 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]',
  declined: 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]',
  ended: 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]',
};

export const MentorsPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const matches = rankMentors(currentUser);
  const myRequests = store.getMentorRequests().filter(r => r.founder_uid === currentUser.id);
  const openRequestFor = (mentorId: string) => myRequests.find(r => r.mentor_uid === mentorId && (r.status === 'pending' || r.status === 'accepted'));
  const [requesting, setRequesting] = useState<MentorProfile | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Mentors"
        title="Find a mentor who's been there"
        subtitle="Matches are ranked by the categories you're building in, the stage of your current roadmap steps, and backgrounds that complement yours."
        illustration="resources"
      />

      {myRequests.length > 0 && (
        <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--nxt-ink)] mb-3">Your requests</h2>
          <ul className="space-y-2">
            {myRequests.map(r => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--nxt-bg-soft)] px-4 py-3">
                <span className="text-sm text-[var(--nxt-ink)]">{r.mentor_name}</span>
                <span className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_CHIP[r.status]}`}>{r.status}</span>
                  {r.status === 'accepted' && r.thread_id && (
                    <button onClick={() => navigate(`/messages/${r.thread_id}`)} className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Open chat
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {matches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--nxt-line)] p-10 text-center">
          <Users className="w-10 h-10 mx-auto text-[var(--nxt-ink-soft)]" />
          <p className="text-base font-bold text-[var(--nxt-ink)] mt-3">No mentors are available right now</p>
          <p className="text-sm text-[var(--nxt-ink-soft)] mt-1">We're adding mentors regularly — check back soon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {matches.map(({ mentor, reasons, score }, index) => {
            const existing = openRequestFor(mentor.id);
            const background = mentor.background || mentor.user_background;
            return (
              <article key={mentor.id} className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center font-display text-lg font-bold shrink-0">
                    {mentor.name.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)]">{mentor.name}</h3>
                    {mentor.headline && <p className="text-sm text-[var(--nxt-ink-soft)]">{mentor.headline}</p>}
                  </div>
                  {index === 0 && score > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] shrink-0 inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Best match
                    </span>
                  )}
                </div>
                {mentor.bio && <p className="text-sm text-[var(--nxt-ink-soft)] mt-3 line-clamp-3">{mentor.bio}</p>}
                {reasons.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {reasons.map(r => (
                      <li key={r} className="text-sm text-[var(--nxt-ink)] flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-[var(--nxt-mint-strong)] shrink-0" /> {r}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {background && <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]">{labelFor(BACKGROUND_OPTIONS, background)}</span>}
                  {(mentor.expertise_stages || []).slice(0, 4).map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]">{s}</span>
                  ))}
                </div>
                <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--nxt-ink-soft)]">{mentor.availability || 'Availability on request'}</span>
                  {existing ? (
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_CHIP[existing.status]}`}>Request {existing.status}</span>
                  ) : (
                    <button onClick={() => setRequesting(mentor)} className="px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-sm font-semibold">
                      Request mentorship
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {requesting && <RequestDialog mentor={requesting} onClose={() => setRequesting(null)} />}
    </div>
  );
};

const RequestDialog: React.FC<{ mentor: MentorProfile; onClose: () => void }> = ({ mentor, onClose }) => {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setBusy(true);
    setError('');
    try {
      await store.requestMentor(mentor.id, message.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send your request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-[var(--nxt-surface)] rounded-3xl max-w-md w-full p-6 border border-[var(--nxt-line)] shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)]">Ask {mentor.name.split(' ')[0]} to mentor you</h3>
          <button onClick={onClose} className="text-[var(--nxt-ink-soft)]" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-[var(--nxt-ink-soft)] mt-1">Say what you're building and where you're stuck — specific asks get faster yeses.</p>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={2000} className={`${inputClass} mt-4`} placeholder="Hi! We're building a continuous sepsis monitor and preparing our FDA Pre-Sub…" />
        {error && <p className="text-sm text-[var(--nxt-peach-deep)] font-semibold mt-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}</p>}
        <button disabled={busy || !message.trim()} onClick={handleSend} className="mt-4 w-full py-3 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> {busy ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </div>
  );
};

export const MentoringPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const requests = store.getMentorRequests().filter(r => r.mentor_uid === currentUser.id);
  const pending = requests.filter(r => r.status === 'pending');
  const active = requests.filter(r => r.status === 'accepted');
  const myProfile = store.getMentors().find(m => m.id === currentUser.id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const respond = async (id: string, accept: boolean) => {
    setBusyId(id);
    setError('');
    try {
      await store.respondToMentorRequest(id, accept);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={GraduationCap} eyebrow="Mentoring" title="Your mentoring" subtitle="Keep your profile current so founders find you, and respond to requests." />
      {error && <p className="text-sm text-[var(--nxt-peach-deep)] font-semibold">{error}</p>}

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[var(--nxt-ink)] flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--nxt-mint-strong)]" /> Requests ({pending.length})</h2>
          {pending.length === 0 && <p className="text-sm text-[var(--nxt-ink-soft)]">No pending requests.</p>}
          {pending.map(r => (
            <div key={r.id} className="rounded-2xl bg-[var(--nxt-bg-soft)] p-4">
              <p className="text-sm font-bold text-[var(--nxt-ink)]">{r.founder_name}</p>
              <p className="text-sm text-[var(--nxt-ink-soft)] mt-1 whitespace-pre-wrap">{r.message}</p>
              <div className="flex gap-2 mt-3">
                <button disabled={busyId === r.id} onClick={() => respond(r.id, true)} className="px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] text-white text-sm font-semibold disabled:opacity-60">Accept</button>
                <button disabled={busyId === r.id} onClick={() => respond(r.id, false)} className="px-4 py-2 rounded-full border border-[var(--nxt-line)] text-sm font-semibold text-[var(--nxt-ink-soft)]">Decline</button>
              </div>
            </div>
          ))}

          <h2 className="font-display text-base font-bold text-[var(--nxt-ink)] pt-2">Mentees ({active.length}{myProfile?.capacity ? ` of ${myProfile.capacity}` : ''})</h2>
          {active.length === 0 && <p className="text-sm text-[var(--nxt-ink-soft)]">No active mentees yet.</p>}
          {active.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--nxt-bg-soft)] px-4 py-3">
              <span className="text-sm text-[var(--nxt-ink)]">{r.founder_name}</span>
              <span className="flex items-center gap-3">
                {r.thread_id && (
                  <button onClick={() => navigate(`/messages/${r.thread_id}`)} className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline">Open chat</button>
                )}
                <button onClick={() => { if (window.confirm(`End your mentorship with ${r.founder_name}?`)) void store.endMentorship(r.id); }} className="text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)]">End</button>
              </span>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6">
          <h2 className="font-display text-base font-bold text-[var(--nxt-ink)] mb-4">Mentor profile</h2>
          <MentorProfileForm initial={myProfile} />
        </section>
      </div>
    </div>
  );
};

export const MentorProfileForm: React.FC<{ initial?: MentorProfile; forUserId?: string; onSaved?: () => void }> = ({ initial, forUserId, onSaved }) => {
  const categories = store.getCategories();
  const [form, setForm] = useState<MentorProfileInput>({
    headline: initial?.headline || '',
    bio: initial?.bio || '',
    expertise_stages: initial?.expertise_stages || [],
    category_ids: initial?.category_ids || [],
    background: initial?.background,
    availability: initial?.availability || '',
    capacity: initial?.capacity || 3,
    accepting: initial?.accepting ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const toggle = (key: 'expertise_stages' | 'category_ids', value: string) =>
    setForm(f => ({ ...f, [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value] }));

  const save = async () => {
    setBusy(true);
    setStatus('');
    try {
      await store.saveMentorProfile({ ...form, ...(form.background ? {} : { background: undefined }) }, forUserId);
      setStatus('Saved.');
      onSaved?.();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <input value={form.headline} maxLength={140} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Headline — e.g. Former FDA reviewer, 510(k) specialist" className={inputClass} />
      <textarea value={form.bio} maxLength={2000} rows={3} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What you've done and how you can help" className={inputClass} />
      <div>
        <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] mb-2">Expertise (roadmap stages)</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGE_TAGS.map(tag => (
            <button key={tag} type="button" onClick={() => toggle('expertise_stages', tag)} className={`text-xs px-3 py-1.5 rounded-full border ${form.expertise_stages.includes(tag) ? 'bg-[var(--nxt-mint-strong)] border-[var(--nxt-mint-strong)] text-white' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] mb-2">Product categories</p>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {categories.map(c => (
            <button key={c.id} type="button" onClick={() => toggle('category_ids', c.id)} className={`text-xs px-3 py-1.5 rounded-full border ${form.category_ids.includes(c.id) ? 'bg-[var(--nxt-mint-strong)] border-[var(--nxt-mint-strong)] text-white' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select value={form.background || ''} onChange={(e) => setForm({ ...form, background: (e.target.value || undefined) as MentorProfileInput['background'] })} className={inputClass}>
          <option value="">Background…</option>
          {BACKGROUND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--nxt-ink)]">
          Max mentees
          <input type="number" min={1} max={50} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Math.max(1, Number(e.target.value) || 1) })} className={`${inputClass} w-20`} />
        </label>
      </div>
      <input value={form.availability} maxLength={200} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="Availability — e.g. One 30-min call every two weeks" className={inputClass} />
      <label className="flex items-center gap-2 text-sm text-[var(--nxt-ink)] cursor-pointer">
        <input type="checkbox" checked={form.accepting} onChange={(e) => setForm({ ...form, accepting: e.target.checked })} className="w-4 h-4 accent-[var(--nxt-mint-strong)]" />
        Accepting new mentees
      </label>
      <div className="flex items-center gap-3">
        <button id="btn-save-mentor-profile" disabled={busy} onClick={save} className="px-5 py-2.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] disabled:opacity-60 text-white text-sm font-semibold">
          {busy ? 'Saving…' : 'Save profile'}
        </button>
        {status && <span className="text-sm text-[var(--nxt-ink-soft)]">{status}</span>}
      </div>
    </div>
  );
};
