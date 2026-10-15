import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ExpertItem, ExpertItemKind } from '../../types';
import { api } from '../../services/api';
import { Button, Field, inputClass, Notice } from './adminUi';

const KINDS: { value: ExpertItemKind; label: string }[] = [
  { value: 'webinar', label: 'Webinar' }, { value: 'podcast', label: 'Podcast' }, { value: 'blog', label: 'Article or blog' },
  { value: 'publication', label: 'Publication' }, { value: 'media', label: 'In the media' }, { value: 'other', label: 'Other' },
];

const EMPTY = { kind: 'webinar' as ExpertItemKind, title: '', url: '', date: '', summary: '' };
type Draft = typeof EMPTY & { id?: string };

/** Webinars, podcasts, articles and other things one expert has put out. Add, edit and delete them here. */
export const ExpertItems: React.FC<{ expertId: string }> = ({ expertId }) => {
  const [items, setItems] = useState<ExpertItem[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setItems((await api.get<{ items: ExpertItem[] }>(`/admin/expert-items?expert_id=${encodeURIComponent(expertId)}`)).items);
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not load.' });
    }
  }, [expertId]);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!draft || !draft.title.trim()) { setMessage({ ok: false, text: 'Add a title.' }); return; }
    const { id, ...fields } = draft;
    try {
      const body = { ...fields, expert_id: expertId, title: fields.title.trim() };
      await (id ? api.put(`/admin/expert-items/${id}`, body) : api.post('/admin/expert-items', body));
      setDraft(null);
      setMessage(null);
      await load();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not save.' });
    }
  };

  const remove = async (item: ExpertItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    await api.delete(`/admin/expert-items/${item.id}`);
    await load();
  };

  return (
    <div className="mt-6 sm:col-span-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[var(--nxt-ink)]">Webinars, podcasts, articles and more</h4>
        {!draft && <Button onClick={() => { setMessage(null); setDraft({ ...EMPTY }); }}><Plus className="w-4 h-4" /> Add</Button>}
      </div>
      <Notice message={message} />

      {draft && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-4">
          <Field label="Type">
            <select className={inputClass} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as ExpertItemKind })}>
              {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </Field>
          <Field label="Date"><input className={inputClass} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="2026-06-24" /></Field>
          <Field label="Title" className="sm:col-span-2"><input className={inputClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          <Field label="Link" hint="An https:// link, if there is one." className="sm:col-span-2"><input className={inputClass} value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://" /></Field>
          <Field label="Short description" className="sm:col-span-2"><textarea rows={2} className={inputClass} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></Field>
          <div className="sm:col-span-2 flex gap-2">
            <Button variant="solid" onClick={() => void save()}>Save</Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {items && items.length > 0 && (
        <ul className="mt-3 divide-y divide-[var(--nxt-line)] rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
          {items.map(item => (
            <li key={item.id} className="px-4 py-3 flex items-center gap-3 justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                <p className="text-xs text-[var(--nxt-ink-soft)]">{[KINDS.find(k => k.value === item.kind)?.label, item.date].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="p-2 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]" aria-label="Open link"><ExternalLink className="w-4 h-4" /></a>}
                <button onClick={() => { setMessage(null); setDraft({ id: item.id, kind: item.kind, title: item.title, url: item.url, date: item.date, summary: item.summary }); }} className="p-2 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]" aria-label={`Edit ${item.title}`}><Pencil className="w-4 h-4" /></button>
                <button onClick={() => void remove(item)} className="p-2 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)]" aria-label={`Delete ${item.title}`}><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {items && items.length === 0 && !draft && <p className="mt-2 text-sm text-[var(--nxt-ink-soft)]">Nothing added yet.</p>}
    </div>
  );
};
