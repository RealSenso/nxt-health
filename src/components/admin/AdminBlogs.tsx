import React, { useState } from 'react';
import { Eye, EyeOff, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import type { BlogPost } from '../../types';
import { api } from '../../services/api';
import { store } from '../../services/store';
import { RichText } from '../ui/RichText';
import { Button, Card, Field, inputClass, Notice, Pill } from './adminUi';

const DOMAINS = [
  'Healthcare Innovation', 'Digital Health', 'HealthTech Startups', 'AI in Healthcare', 'Clinical Research', 'Hospital Operations',
  'Patient Experience', 'Public Health', 'Healthcare Policy', 'Diagnostics', 'MedTech', 'Healthcare Financing & Access',
  'Rare Diseases', 'Translational Medicine', 'Healthcare Ecosystem & Partnerships',
];
const TYPES = ['Explainer', 'Perspective', 'Opinion', 'Unpopular Opinion', 'Myth vs Reality', 'Case Study', 'Industry Insight', 'Trend Watch', 'Founder Story', 'Expert Viewpoint', 'Deep Dive', 'Quick Read'];

const EMPTY = { title: '', excerpt: '', body: '', cover_url: '', author: '', domain: '', content_type: '', read_minutes: 0, status: 'draft' as const };
type Draft = typeof EMPTY & { id?: string };

/** Reading time from word count, using the guide in the blog SOP (about 230 words a minute). */
const minutesFor = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 230));

/** Write, publish, unpublish and delete the posts shown in the blog section of the site. */
export const AdminBlogs: React.FC = () => {
  const posts = store.getBlogs();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const edit = async (post: BlogPost) => {
    setMessage(null);
    setPreview(false);
    try {
      const { post: full } = await api.get<{ post: BlogPost }>(`/admin/blogs/${post.id}`);
      setDraft({ id: full.id, title: full.title, excerpt: full.excerpt, body: full.body || '', cover_url: full.cover_url, author: full.author, domain: full.domain, content_type: full.content_type, read_minutes: full.read_minutes, status: full.status as 'draft' });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not open that post.' });
    }
  };

  const save = async (status?: 'draft' | 'published') => {
    if (!draft) return;
    if (!draft.title.trim()) { setMessage({ ok: false, text: 'Add a title first.' }); return; }
    setBusy(true);
    try {
      await store.saveBlog({ ...draft, title: draft.title.trim(), status: status ?? draft.status, read_minutes: draft.read_minutes || minutesFor(draft.body) });
      setMessage({ ok: true, text: status === 'published' ? 'Published.' : 'Saved.' });
      setDraft(null);
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (post: BlogPost) => {
    const { post: full } = await api.get<{ post: BlogPost }>(`/admin/blogs/${post.id}`);
    await store.saveBlog({ ...full, status: post.status === 'published' ? 'draft' : 'published' } as Partial<BlogPost> & { title: string });
  };

  const remove = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    await store.deleteBlog(post.id);
  };

  const shown = posts.filter(p => filter === 'all' || p.status === filter);

  if (draft) {
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
    return (
      <Card
        title={draft.id ? 'Edit post' : 'New post'}
        hint="Posts are written in plain text: blank lines between paragraphs, ## for headings, - for bullets, 1. for numbered lists, > for a callout, and **bold**."
        actions={<Button variant="ghost" onClick={() => setDraft(null)}>Back to posts</Button>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2"><input className={inputClass} value={draft.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Short summary" hint="Shown on the cards. One or two sentences." className="sm:col-span-2">
            <textarea rows={2} className={inputClass} value={draft.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
          </Field>
          <Field label="Author"><input className={inputClass} value={draft.author} onChange={(e) => set('author', e.target.value)} /></Field>
          <Field label="Domain">
            <input list="blog-domains" className={inputClass} value={draft.domain} onChange={(e) => set('domain', e.target.value)} />
            <datalist id="blog-domains">{DOMAINS.map(d => <option key={d} value={d} />)}</datalist>
          </Field>
          <Field label="Content type">
            <input list="blog-types" className={inputClass} value={draft.content_type} onChange={(e) => set('content_type', e.target.value)} />
            <datalist id="blog-types">{TYPES.map(t => <option key={t} value={t} />)}</datalist>
          </Field>
          <Field label="Read time (minutes)" hint="Leave 0 to work it out from the length.">
            <input type="number" min={0} className={inputClass} value={draft.read_minutes} onChange={(e) => set('read_minutes', Math.max(0, Number(e.target.value)))} />
          </Field>
          <Field label="Cover image link" hint="An https:// link. Leave empty for a plain cover." className="sm:col-span-2">
            <input className={inputClass} value={draft.cover_url} onChange={(e) => set('cover_url', e.target.value)} placeholder="https://" />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--nxt-ink-soft)]">Article text</p>
          <Button variant="ghost" onClick={() => setPreview(!preview)}>{preview ? <><EyeOff className="w-4 h-4" /> Edit</> : <><Eye className="w-4 h-4" /> Preview</>}</Button>
        </div>
        {preview
          ? <div className="mt-2 rounded-xl border border-[var(--nxt-line)] p-5"><RichText text={draft.body} /></div>
          : <textarea rows={22} className={`${inputClass} mt-2 font-mono`} value={draft.body} onChange={(e) => set('body', e.target.value)} />}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="solid" disabled={busy} onClick={() => void save('published')}>Publish</Button>
          <Button disabled={busy} onClick={() => void save('draft')}>Save as draft</Button>
          <Notice message={message} />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Blog posts"
      hint="Published posts appear in the blog section on the home page and on the blog page. Drafts are only visible here."
      actions={<Button variant="solid" onClick={() => { setMessage(null); setPreview(false); setDraft({ ...EMPTY }); }}><Plus className="w-4 h-4" /> New post</Button>}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex rounded-full border border-[var(--nxt-line)] p-1 text-sm">
          {(['all', 'published', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full font-semibold capitalize ${filter === f ? 'bg-[var(--nxt-ink-fixed)] text-white' : 'text-[var(--nxt-ink-soft)]'}`}>{f}</button>
          ))}
        </div>
        <Notice message={message} />
      </div>
      {shown.length === 0 ? (
        <p className="text-sm text-[var(--nxt-ink-soft)] py-6">No posts here yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--nxt-line)]">
          {shown.map(post => (
            <li key={post.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--nxt-ink-soft)] shrink-0" />
                  <span className="font-semibold text-[var(--nxt-ink)]">{post.title}</span>
                  <Pill tone={post.status === 'published' ? 'good' : 'warn'}>{post.status}</Pill>
                </p>
                <p className="mt-1 text-sm text-[var(--nxt-ink-soft)]">
                  {[post.author, post.domain, post.content_type, post.read_minutes ? `${post.read_minutes} min` : ''].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {post.status === 'published' && <a href={`${import.meta.env.BASE_URL}blog/${post.id}`} target="_blank" rel="noreferrer" className="text-sm font-semibold underline">View</a>}
                <Button onClick={() => void toggle(post)}>{post.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
                <Button onClick={() => void edit(post)}><Pencil className="w-4 h-4" /> Edit</Button>
                <Button variant="danger" onClick={() => void remove(post)} aria-label={`Delete ${post.title}`}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
