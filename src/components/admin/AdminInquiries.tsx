import React, { useCallback, useEffect, useState } from 'react';
import { Check, Inbox, Mail, RotateCcw } from 'lucide-react';
import type { Inquiry } from '../../types';
import { api } from '../../services/api';

const when = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Everything sent through the public forms: problems from sponsors and partners, and expert applications. */
export const AdminInquiries: React.FC = () => {
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'new' | 'all'>('new');

  const load = useCallback(async () => {
    try {
      setItems((await api.get<{ inquiries: Inquiry[] }>('/admin/inquiries')).inquiries);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load enquiries.');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const mark = async (item: Inquiry, status: Inquiry['status']) => {
    setItems(list => (list || []).map(i => (i.id === item.id ? { ...i, status } : i)));
    try { await api.patch(`/admin/inquiries/${item.id}`, { status }); } catch { void load(); }
  };

  const shown = (items || []).filter(i => filter === 'all' || i.status === 'new');
  const newCount = (items || []).filter(i => i.status === 'new').length;

  return (
    <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2"><Inbox className="w-5 h-5" /> Enquiries</h2>
          <p className="text-sm text-[var(--nxt-ink-soft)] mt-1">Sent from the home page and the "Become an expert" form. {newCount} new.</p>
        </div>
        <div className="inline-flex rounded-full border border-[var(--nxt-line)] p-1 text-sm">
          {(['new', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full font-semibold capitalize ${filter === f ? 'bg-[var(--nxt-mint-strong)] text-white' : 'text-[var(--nxt-ink-soft)]'}`}>{f}</button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-[var(--nxt-peach-deep)]">{error}</p>}
      {items === null && !error && <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Loading…</p>}
      {items !== null && shown.length === 0 && <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">{filter === 'new' ? 'Nothing new — you are all caught up.' : 'No enquiries yet.'}</p>}

      <ul className="mt-6 divide-y divide-[var(--nxt-line)]">
        {shown.map(item => (
          <li key={item.id} className="py-5 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]">
                  {item.kind === 'expert' ? 'Expert application' : 'Problem / partner'}
                </span>
                <span className="font-semibold">{item.kind === 'expert' ? item.name : item.role}</span>
                <span className="text-[var(--nxt-ink-soft)]">{when(item.created_at)}</span>
                {item.status === 'new' && <span className="text-xs font-bold text-[var(--nxt-peach-deep)]">NEW</span>}
              </p>
              <p className="mt-2 text-[15px] whitespace-pre-wrap">{item.message}</p>
              <p className="mt-2 text-sm text-[var(--nxt-ink-soft)] flex flex-wrap gap-x-4 gap-y-1">
                <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 underline"><Mail className="w-3.5 h-3.5" /> {item.email}</a>
                {item.focus && <span>Helps most: {item.focus}</span>}
                {item.linkedin && <span>{/^https?:\/\//i.test(item.linkedin) ? <a className="underline" href={item.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> : `LinkedIn: ${item.linkedin}`}</span>}
              </p>
            </div>
            {item.status === 'new' ? (
              <button onClick={() => mark(item, 'handled')} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[var(--nxt-line)] px-4 py-2 text-sm font-semibold hover:bg-[var(--nxt-bg-soft)]">
                <Check className="w-4 h-4" /> Mark handled
              </button>
            ) : (
              <button onClick={() => mark(item, 'new')} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]">
                <RotateCcw className="w-4 h-4" /> Reopen
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
