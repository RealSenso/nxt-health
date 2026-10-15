import React, { useState } from 'react';
import { ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { Startup } from '../../types';
import { store } from '../../services/store';
import { Button, Card, Field, inputClass, Notice, Pill } from './adminUi';

const EMPTY = { name: '', tagline: '', description: '', logo_url: '', website: '', sector: '', stage: '', location: '', featured: false, order: 10 };
type Draft = typeof EMPTY & { id?: string };

/** The startups promoted in the "Startups working with us" section of the home page. */
export const AdminStartups: React.FC = () => {
  const startups = store.getStartups();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { setMessage({ ok: false, text: 'Add the startup name.' }); return; }
    setBusy(true);
    try {
      await store.saveStartup({ ...draft, name: draft.name.trim() });
      setDraft(null);
      setMessage({ ok: true, text: 'Saved.' });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s: Startup) => {
    if (window.confirm(`Remove ${s.name} from the home page?`)) await store.deleteStartup(s.id);
  };

  if (draft) {
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
    return (
      <Card title={draft.id ? 'Edit startup' : 'Add a startup'} actions={<Button variant="ghost" onClick={() => setDraft(null)}>Back to startups</Button>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input className={inputClass} value={draft.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="One-line description"><input className={inputClass} value={draft.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
          <Field label="About" className="sm:col-span-2"><textarea rows={3} className={inputClass} value={draft.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <Field label="Sector"><input className={inputClass} value={draft.sector} onChange={(e) => set('sector', e.target.value)} placeholder="MedTech, Digital health…" /></Field>
          <Field label="Stage"><input className={inputClass} value={draft.stage} onChange={(e) => set('stage', e.target.value)} placeholder="Pre-seed, Seed, Pilot…" /></Field>
          <Field label="Location"><input className={inputClass} value={draft.location} onChange={(e) => set('location', e.target.value)} /></Field>
          <Field label="Website" hint="An https:// link. The card links to it."><input className={inputClass} value={draft.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
          <Field label="Logo link" hint="An https:// link to a square logo. Leave empty to show the first letter."><input className={inputClass} value={draft.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://" /></Field>
          <Field label="Order" hint="Lower numbers come first."><input type="number" min={0} className={inputClass} value={draft.order} onChange={(e) => set('order', Math.max(0, Number(e.target.value)))} /></Field>
          <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
            <input type="checkbox" checked={draft.featured} onChange={(e) => set('featured', e.target.checked)} /> Feature at the front of the list
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="solid" disabled={busy} onClick={() => void save()}>Save</Button>
          <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
          <Notice message={message} />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Startups working with us"
      hint="Shown as cards on the home page. Remove them all and the section hides itself."
      actions={<Button variant="solid" onClick={() => { setMessage(null); setDraft({ ...EMPTY }); }}><Plus className="w-4 h-4" /> Add a startup</Button>}
    >
      <Notice message={message} />
      {startups.length === 0 ? (
        <p className="text-sm text-[var(--nxt-ink-soft)] py-6">No startups yet. Add the companies you want to promote.</p>
      ) : (
        <ul className="divide-y divide-[var(--nxt-line)]">
          {startups.map(s => (
            <li key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--nxt-ink)]">{s.name}</span>
                  {s.featured && <Pill tone="good"><Star className="w-3 h-3 inline -mt-0.5" /> Featured</Pill>}
                </p>
                <p className="mt-1 text-sm text-[var(--nxt-ink-soft)]">{[s.tagline, s.sector, s.stage, s.location].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {s.website && <a href={s.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold underline">Site <ExternalLink className="w-3.5 h-3.5" /></a>}
                <Button onClick={() => { setMessage(null); setDraft({ ...s }); }}><Pencil className="w-4 h-4" /> Edit</Button>
                <Button variant="danger" onClick={() => void remove(s)} aria-label={`Remove ${s.name}`}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
