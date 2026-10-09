import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linkedin, Mail, Phone, Trash2, Upload, Users } from 'lucide-react';
import { api } from '../../services/api';

interface PipelineExpert {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  fit: 'Strong' | 'Medium' | '';
  stage: 'onboarding' | 'outreach';
  listed?: boolean;
  photo_url?: string;
  bio?: string;
  specialisation?: string;
  organisation?: string;
  city?: string;
  years_experience?: string;
  credentials?: string;
  languages?: string;
  how_to_help?: string;
}

const PROFILE_FIELDS: { key: keyof PipelineExpert; label: string; long?: boolean; placeholder?: string }[] = [
  { key: 'photo_url', label: 'Photo link', placeholder: 'https://…' },
  { key: 'specialisation', label: 'Specialisation' },
  { key: 'organisation', label: 'Organisation / practice' },
  { key: 'city', label: 'City' },
  { key: 'years_experience', label: 'Years of experience' },
  { key: 'languages', label: 'Languages' },
  { key: 'credentials', label: 'Credentials and qualifications' },
  { key: 'bio', label: 'About', long: true },
  { key: 'how_to_help', label: 'How they help founders', long: true },
];

/** The public profile fields of an expert (never contact details). Saved when a field loses focus. */
const ProfileForm: React.FC<{ item: PipelineExpert; onSave: (fields: Partial<PipelineExpert>) => void }> = ({ item, onSave }) => (
  <div className="mt-4 grid gap-3 sm:grid-cols-2 rounded-2xl bg-[var(--nxt-bg-soft)] p-4">
    {PROFILE_FIELDS.map(({ key, label, long, placeholder }) => (
      <label key={key} className={`block text-xs font-semibold text-[var(--nxt-ink-soft)] ${long ? 'sm:col-span-2' : ''}`}>
        {label}
        {long
          ? <textarea rows={3} defaultValue={(item[key] as string) || ''} onBlur={(e) => { if (e.target.value !== ((item[key] as string) || '')) onSave({ [key]: e.target.value }); }} className="mt-1 w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm font-normal text-[var(--nxt-ink)]" />
          : <input defaultValue={(item[key] as string) || ''} placeholder={placeholder} onBlur={(e) => { if (e.target.value !== ((item[key] as string) || '')) onSave({ [key]: e.target.value }); }} className="mt-1 w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm font-normal text-[var(--nxt-ink)]" />}
      </label>
    ))}
  </div>
);

const STAGES = { onboarding: 'Onboarding', outreach: 'Approached' } as const;

/** The experts NXT is talking to. Private to admins; not the public directory. */
export const AdminExperts: React.FC = () => {
  const [items, setItems] = useState<PipelineExpert[] | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [stage, setStage] = useState<'all' | PipelineExpert['stage']>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setItems((await api.get<{ experts: PipelineExpert[] }>('/admin/expert-pipeline')).experts);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load experts.');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    try {
      const data = JSON.parse(await file.text());
      const result = await api.post<{ added: number; total: number }>('/admin/expert-pipeline/import', data);
      setMessage({ ok: true, text: `${result.added} added, ${result.total - result.added} already there.` });
      await load();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof SyntaxError ? "That file isn't valid JSON." : e instanceof Error ? e.message : 'Could not import that file.' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const change = async (item: PipelineExpert, fields: Partial<PipelineExpert>) => {
    setItems(list => (list || []).map(i => (i.id === item.id ? { ...i, ...fields } : i)));
    try { await api.patch(`/admin/expert-pipeline/${item.id}`, fields); } catch { void load(); }
  };

  const remove = async (item: PipelineExpert) => {
    if (!window.confirm(`Remove ${item.name} from this list?`)) return;
    setItems(list => (list || []).filter(i => i.id !== item.id));
    try { await api.delete(`/admin/expert-pipeline/${item.id}`); } catch { void load(); }
  };

  const q = query.trim().toLowerCase();
  const shown = (items || []).filter(i => (stage === 'all' || i.stage === stage) && (!q || `${i.name} ${i.title}`.toLowerCase().includes(q)));
  const count = (s: PipelineExpert['stage']) => (items || []).filter(i => i.stage === s).length;

  return (
    <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Experts</h2>
          <p className="text-sm text-[var(--nxt-ink-soft)] mt-1 max-w-xl">
            The experts NXT is talking to. This list is private to admins. Tick "In expert list" to show someone's name, role and LinkedIn to founders and visitors. They are bookable in the directory only once you make them a mentor (Members) and fill in their profile.
          </p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" id="input-import-experts" onChange={(e) => void importFile(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-[var(--nxt-ink)] px-4 py-2 text-sm font-semibold hover:bg-[var(--nxt-bg-soft)]">
            <Upload className="w-4 h-4" /> Import experts file
          </button>
        </div>
      </div>
      {message && <p className={`mt-3 text-sm font-semibold ${message.ok ? '' : 'text-[var(--nxt-peach-deep)]'}`} role="status">{message.text}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-[var(--nxt-line)] p-1 text-sm">
          {(['all', 'onboarding', 'outreach'] as const).map(s => (
            <button key={s} onClick={() => setStage(s)} className={`px-4 py-1.5 rounded-full font-semibold ${stage === s ? 'bg-[var(--nxt-mint-strong)] text-white' : 'text-[var(--nxt-ink-soft)]'}`}>
              {s === 'all' ? `All (${items?.length ?? 0})` : `${STAGES[s]} (${count(s)})`}
            </button>
          ))}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or role" className="flex-1 min-w-[12rem] rounded-full border border-[var(--nxt-line)] bg-transparent px-4 py-2 text-sm" id="input-search-experts" />
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-[var(--nxt-peach-deep)]">{error}</p>}
      {items === null && !error && <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">Loading…</p>}
      {items !== null && items.length === 0 && <p className="mt-6 text-sm text-[var(--nxt-ink-soft)]">No experts yet. Import the experts file to add them.</p>}

      <ul className="mt-4 divide-y divide-[var(--nxt-line)]">
        {shown.map(item => (
          <li key={item.id} className="py-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{item.name}</p>
              {item.title && <p className="text-sm text-[var(--nxt-ink-soft)] mt-0.5">{item.title}</p>}
              <p className="mt-1.5 text-sm text-[var(--nxt-ink-soft)] flex flex-wrap gap-x-4 gap-y-1">
                {item.email && <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 underline"><Mail className="w-3.5 h-3.5" /> {item.email}</a>}
                {item.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {item.phone}</span>}
                {/^https:\/\//i.test(item.linkedin) && <a className="inline-flex items-center gap-1 underline" href={item.linkedin} target="_blank" rel="noreferrer"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</a>}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-sm">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={!!item.listed} onChange={(e) => void change(item, { listed: e.target.checked })} aria-label={`Show ${item.name} in the expert list`} />
                <span className="text-xs font-semibold">In expert list</span>
              </label>
              <select value={item.fit} onChange={(e) => void change(item, { fit: e.target.value as PipelineExpert['fit'] })} className="rounded-full border border-[var(--nxt-line)] bg-transparent px-3 py-1.5" aria-label={`Fit for ${item.name}`}>
                <option value="">Fit: —</option>
                <option value="Strong">Strong fit</option>
                <option value="Medium">Medium fit</option>
              </select>
              <select value={item.stage} onChange={(e) => void change(item, { stage: e.target.value as PipelineExpert['stage'] })} className="rounded-full border border-[var(--nxt-line)] bg-transparent px-3 py-1.5" aria-label={`Stage for ${item.name}`}>
                <option value="onboarding">Onboarding</option>
                <option value="outreach">Approached</option>
              </select>
              <button onClick={() => setEditing(editing === item.id ? '' : item.id)} className="text-xs font-semibold underline whitespace-nowrap">{editing === item.id ? 'Close profile' : 'Edit profile'}</button>
              <button onClick={() => void remove(item)} className="p-2 rounded-full text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]" aria-label={`Remove ${item.name}`}><Trash2 className="w-4 h-4" /></button>
            </div>
            {editing === item.id && <div className="w-full sm:basis-full"><ProfileForm item={item} onSave={(fields) => void change(item, fields)} /></div>}
          </li>
        ))}
      </ul>
    </section>
  );
};
