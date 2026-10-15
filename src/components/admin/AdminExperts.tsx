import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linkedin, Mail, Phone, Trash2, Upload, Users } from 'lucide-react';
import { api } from '../../services/api';
import { ExpertItems } from './ExpertItems';
import { assetUrl } from '../../data/experts';
import { store } from '../../services/store';
import { STAGE_TAGS } from '../../data/stepGuides';

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
  intro_video_url?: string;
  highlights?: { title: string; text: string }[];
  category_ids?: string[];
  expertise_stages?: string[];
  background?: string;
  tagline?: string;
  location?: string;
  tags?: string[];
  facts?: { title: string; text: string }[];
  photo_source?: string;
}

const PROFILE_FIELDS: { key: keyof PipelineExpert; label: string; long?: boolean; placeholder?: string }[] = [
  { key: 'photo_url', label: 'Photo link', placeholder: 'https://…' },
  { key: 'intro_video_url', label: 'Introduction video link', placeholder: 'https://…' },
  { key: 'tagline', label: 'Tagline (one line under the name)' },
  { key: 'location', label: 'Location' },
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

    <label className="sm:col-span-2 block text-xs font-semibold text-[var(--nxt-ink-soft)]">
      Areas of expertise (separate with commas)
      <input
        key={`tags-${item.id}`}
        defaultValue={(item.tags || []).join(', ')}
        onBlur={(e) => {
          const next = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
          if (next.join('|') !== (item.tags || []).join('|')) onSave({ tags: next });
        }}
        className="mt-1 w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm font-normal text-[var(--nxt-ink)]"
      />
    </label>

    <div className="sm:col-span-2">
      <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Fast facts (label and value, up to five)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {[0, 1, 2, 3, 4].map(i => {
          const f = item.facts?.[i] || { title: '', text: '' };
          const update = (field: 'title' | 'text', value: string) => {
            const next = [0, 1, 2, 3, 4].map(j => (j === i ? { ...f, [field]: value } : item.facts?.[j] || { title: '', text: '' }));
            onSave({ facts: next.filter(x => x.title || x.text) });
          };
          return (
            <div key={`${item.id}-f${i}`} className="grid grid-cols-[8rem_1fr] gap-2">
              <input defaultValue={f.title} placeholder="Label" onBlur={(e) => { if (e.target.value !== f.title) update('title', e.target.value); }} className="rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm" />
              <input defaultValue={f.text} placeholder="Value" onBlur={(e) => { if (e.target.value !== f.text) update('text', e.target.value); }} className="rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm" />
            </div>
          );
        })}
      </div>
    </div>

    <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
      {item.photo_url && <img src={assetUrl(item.photo_url)} alt="" className="w-16 h-20 rounded-lg object-cover" />}
      <label className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nxt-line)] px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[var(--nxt-surface)]">
        Upload photo
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const { photo_url } = await api.upload<{ photo_url: string }>(`/admin/expert-pipeline/${item.id}/photo`, file);
              onSave({ photo_url });
            } catch (err) {
              window.alert(err instanceof Error ? err.message : 'Could not upload that photo.');
            }
          }}
        />
      </label>
      {item.photo_source && <a href={item.photo_source} target="_blank" rel="noreferrer" className="text-xs font-semibold underline">Open the photo in Drive</a>}
      <span className="text-xs text-[var(--nxt-ink-soft)]">JPEG, PNG or WebP, up to 2 MB.</span>
    </div>

    <div className="sm:col-span-2">
      <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Three things to know (shown under the video)</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {[0, 1, 2].map(i => {
          const h = item.highlights?.[i] || { title: '', text: '' };
          const update = (field: 'title' | 'text', value: string) => {
            const next = [0, 1, 2].map(j => (j === i ? { ...h, [field]: value } : item.highlights?.[j] || { title: '', text: '' }));
            onSave({ highlights: next.filter(x => x.title || x.text) });
          };
          return (
            <div key={`${item.id}-${i}`} className="space-y-1.5">
              <input defaultValue={h.title} placeholder="Short title" onBlur={(e) => { if (e.target.value !== h.title) update('title', e.target.value); }} className="w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm" />
              <textarea rows={2} defaultValue={h.text} placeholder="One sentence" onBlur={(e) => { if (e.target.value !== h.text) update('text', e.target.value); }} className="w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm" />
            </div>
          );
        })}
      </div>
    </div>

    <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
      <div>
        <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Matching: categories this expert knows</p>
        <div className="flex flex-wrap gap-1.5">
          {store.getCategories().filter(c => !c.coming_soon).map(c => {
            const on = (item.category_ids || []).includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on}
                onClick={() => onSave({ category_ids: on ? (item.category_ids || []).filter(x => x !== c.id) : [...(item.category_ids || []), c.id] })}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>{c.name}</button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Matching: stages they help with</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGE_TAGS.map(tag => {
            const on = (item.expertise_stages || []).includes(tag);
            return (
              <button key={tag} type="button" aria-pressed={on}
                onClick={() => onSave({ expertise_stages: on ? (item.expertise_stages || []).filter(x => x !== tag) : [...(item.expertise_stages || []), tag] })}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>{tag}</button>
            );
          })}
        </div>
        <label className="mt-3 block text-xs font-semibold text-[var(--nxt-ink-soft)]">
          Background
          <select value={item.background || ''} onChange={(e) => onSave({ background: e.target.value })} className="mt-1 w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm font-normal text-[var(--nxt-ink)]">
            <option value="">Not set</option>
            <option value="clinical">Clinical</option>
            <option value="engineering">Engineering</option>
            <option value="science">Science</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>
    </div>

    <ExpertItems expertId={item.id} />
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
  const [adding, setAdding] = useState(false);
  const [newExpert, setNewExpert] = useState({ name: '', title: '', email: '', phone: '', linkedin: '', fit: '' as PipelineExpert['fit'], stage: 'onboarding' as PipelineExpert['stage'] });
  const [addError, setAddError] = useState('');

  const addExpert = async () => {
    if (!newExpert.name.trim()) { setAddError('Add a name.'); return; }
    try {
      const { expert } = await api.post<{ expert: PipelineExpert }>('/admin/expert-pipeline', { ...newExpert, name: newExpert.name.trim() });
      setItems(list => [...(list || []), expert]);
      setAdding(false);
      setNewExpert({ name: '', title: '', email: '', phone: '', linkedin: '', fit: '', stage: 'onboarding' });
      setAddError('');
      setEditing(expert.id);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Could not add.');
    }
  };
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
      if (Array.isArray(data.profiles)) {
        const result = await api.post<{ added: number; updated: number }>('/admin/expert-pipeline/profiles', data);
        setMessage({ ok: true, text: `${result.added} added, ${result.updated} completed. They are now in the expert list.` });
      } else {
        const result = await api.post<{ added: number; total: number }>('/admin/expert-pipeline/import', data);
        setMessage({ ok: true, text: `${result.added} added, ${result.total - result.added} already there.` });
      }
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
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setAdding(!adding); setAddError(''); }} className="inline-flex items-center gap-2 rounded-full bg-[var(--nxt-ink-fixed)] text-white px-4 py-2 text-sm font-semibold">
            + Add an expert
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" id="input-import-experts" onChange={(e) => void importFile(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-[var(--nxt-ink)] px-4 py-2 text-sm font-semibold hover:bg-[var(--nxt-bg-soft)]">
            <Upload className="w-4 h-4" /> Import experts file
          </button>
        </div>
      </div>
      {message && <p className={`mt-3 text-sm font-semibold ${message.ok ? '' : 'text-[var(--nxt-peach-deep)]'}`} role="status">{message.text}</p>}

      {adding && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 rounded-2xl bg-[var(--nxt-bg-soft)] p-4">
          {([['name', 'Name'], ['title', 'Role and organisation'], ['email', 'Email (private)'], ['phone', 'Phone (private)'], ['linkedin', 'LinkedIn link']] as const).map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold text-[var(--nxt-ink-soft)]">
              {label}
              <input value={newExpert[key]} onChange={(e) => setNewExpert({ ...newExpert, [key]: e.target.value })} className="mt-1 w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-2 text-sm font-normal text-[var(--nxt-ink)]" />
            </label>
          ))}
          <div className="flex items-end gap-2">
            <button onClick={() => void addExpert()} className="rounded-full bg-[var(--nxt-ink-fixed)] text-white px-4 py-2 text-sm font-semibold">Add</button>
            <button onClick={() => setAdding(false)} className="px-3 py-2 text-sm font-semibold text-[var(--nxt-ink-soft)]">Cancel</button>
          </div>
          {addError && <p className="sm:col-span-2 text-sm font-semibold text-[var(--nxt-peach-deep)]">{addError}</p>}
        </div>
      )}

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
          <li key={item.id} className="py-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <p className="font-semibold">{item.name}</p>
              {item.title && <p className="text-sm text-[var(--nxt-ink-soft)] mt-0.5">{item.title}</p>}
              <p className="mt-1.5 text-sm text-[var(--nxt-ink-soft)] flex flex-wrap gap-x-4 gap-y-1">
                {item.email && <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 underline"><Mail className="w-3.5 h-3.5" /> {item.email}</a>}
                {item.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {item.phone}</span>}
                {/^https:\/\//i.test(item.linkedin) && <a className="inline-flex items-center gap-1 underline" href={item.linkedin} target="_blank" rel="noreferrer"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</a>}
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap items-center sm:justify-end gap-2 text-sm">
              <label className="inline-flex items-center gap-1.5 cursor-pointer w-36">
                <input type="checkbox" checked={!!item.listed} onChange={(e) => void change(item, { listed: e.target.checked })} aria-label={`Show ${item.name} in the expert list`} />
                <span className="text-xs font-semibold">In expert list</span>
              </label>
              <select value={item.fit} onChange={(e) => void change(item, { fit: e.target.value as PipelineExpert['fit'] })} className="w-36 rounded-full border border-[var(--nxt-line)] bg-transparent px-3 py-1.5" aria-label={`Fit for ${item.name}`}>
                <option value="">Fit: —</option>
                <option value="Strong">Strong fit</option>
                <option value="Medium">Medium fit</option>
              </select>
              <select value={item.stage} onChange={(e) => void change(item, { stage: e.target.value as PipelineExpert['stage'] })} className="w-36 rounded-full border border-[var(--nxt-line)] bg-transparent px-3 py-1.5" aria-label={`Stage for ${item.name}`}>
                <option value="onboarding">Onboarding</option>
                <option value="outreach">Approached</option>
              </select>
              <button onClick={() => setEditing(editing === item.id ? '' : item.id)} className="text-xs font-semibold underline whitespace-nowrap">{editing === item.id ? 'Close profile' : 'Edit profile'}</button>
              <button onClick={() => void remove(item)} className="p-2 rounded-full text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]" aria-label={`Remove ${item.name}`}><Trash2 className="w-4 h-4" /></button>
            </div>
            {editing === item.id && <div className="sm:col-span-2"><ProfileForm item={item} onSave={(fields) => void change(item, fields)} /></div>}
          </li>
        ))}
      </ul>
    </section>
  );
};
