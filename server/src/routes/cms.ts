import { Router } from 'express';
import { z } from 'zod';
import { HttpError, requireAdmin, requireMember } from '../auth.js';
import type { Database } from '../db.js';
import { out, outAll } from '../db.js';
import { newId, now, parse } from '../util.js';

const text = (max: number) => z.string().trim().max(max);
const httpsLink = z.string().trim().max(500).refine(u => /^https:\/\/[^\s]+$/i.test(u), 'must be an https:// link').or(z.literal(''));

const blogSchema = z.object({
  title: text(200).min(1),
  excerpt: text(500),
  body: text(60000),
  cover_url: httpsLink,
  author: text(120),
  domain: text(80),
  content_type: text(60),
  read_minutes: z.number().int().min(0).max(120),
  status: z.enum(['draft', 'published']),
  published_at: z.string().datetime().or(z.literal('')).optional(),
});

const startupSchema = z.object({
  name: text(120).min(1),
  tagline: text(200),
  description: text(2000),
  logo_url: httpsLink,
  website: httpsLink,
  sector: text(80),
  stage: text(80),
  location: text(80),
  featured: z.boolean(),
  order: z.number().int().min(0).max(10000),
});

export const expertItemSchema = z.object({
  expert_id: text(80).min(1),
  kind: z.enum(['webinar', 'podcast', 'blog', 'publication', 'media', 'other']),
  title: text(200).min(1),
  url: httpsLink,
  date: text(40),
  summary: text(1000),
});

const siteSchema = z.object({
  hero_title: text(160),
  hero_subtitle: text(400),
  announcement: text(240),
  announcement_link: httpsLink.or(text(200).regex(/^\/[A-Za-z0-9/_#?=&-]*$/)),
  show_blogs: z.boolean(),
  show_startups: z.boolean(),
});

export const DEFAULT_SITE = { hero_title: '', hero_subtitle: '', announcement: '', announcement_link: '', show_blogs: true, show_startups: true };

/** Blog posts as the public feed shows them: published, newest first, without the body. */
export async function publicBlogs(database: Database, includeDrafts = false) {
  const docs = await database.col('blogs')
    .find(includeDrafts ? {} : { status: 'published' }, { projection: { body: 0 } })
    .sort({ published_at: -1, created_at: -1 })
    .toArray();
  return outAll(docs);
}

export async function startupList(database: Database) {
  return outAll(await database.col('startups').find().sort({ featured: -1, order: 1, name: 1 }).toArray());
}

export async function siteSettings(database: Database) {
  const doc = await database.col('settings').findOne({ _id: 'site' });
  const { _id, ...rest } = (doc || {}) as Record<string, unknown>;
  return { ...DEFAULT_SITE, ...rest };
}

/** Blogs, startups, expert items and site settings: what admins publish on the website. */
export function cmsRouter(database: Database): Router {
  const r = Router();
  const blogs = database.col('blogs');
  const startups = database.col('startups');
  const items = database.col('expertItems');

  // ----- blogs -----
  r.get('/public/blogs/:id', async (req, res) => {
    const post = await blogs.findOne({ _id: String(req.params.id) });
    const viewer = req.user as { role?: string } | null | undefined;
    if (!post || (post.status !== 'published' && !(viewer && viewer.role === 'admin'))) throw new HttpError(404, 'Post not found.');
    res.json({ post: out(post) });
  });

  r.get('/admin/blogs/:id', async (req, res) => {
    requireAdmin(req);
    const post = await blogs.findOne({ _id: String(req.params.id) });
    if (!post) throw new HttpError(404, 'Post not found.');
    res.json({ post: out(post) });
  });

  r.post('/admin/blogs', async (req, res) => {
    requireAdmin(req);
    const body = parse(blogSchema, req.body);
    const doc = {
      _id: newId('blog'),
      ...body,
      published_at: body.status === 'published' ? (body.published_at || now()) : '',
      created_at: now(),
    };
    await blogs.insertOne(doc);
    res.status(201).json({ item: out({ ...doc, body: undefined }) });
  });

  r.put('/admin/blogs/:id', async (req, res) => {
    requireAdmin(req);
    const id = String(req.params.id);
    const existing = await blogs.findOne({ _id: id });
    if (!existing) throw new HttpError(404, 'Post not found.');
    const body = parse(blogSchema, req.body);
    const published_at = body.status === 'published' ? (body.published_at || (existing.published_at as string) || now()) : '';
    await blogs.updateOne({ _id: id }, { $set: { ...body, published_at } });
    res.json({ ok: true });
  });

  r.delete('/admin/blogs/:id', async (req, res) => {
    requireAdmin(req);
    await blogs.deleteOne({ _id: String(req.params.id) });
    res.json({ ok: true });
  });

  // ----- startups -----
  r.post('/admin/startups', async (req, res) => {
    requireAdmin(req);
    const doc = { _id: newId('startup'), ...parse(startupSchema, req.body) };
    await startups.insertOne(doc);
    res.status(201).json({ item: out(doc) });
  });

  r.put('/admin/startups/:id', async (req, res) => {
    requireAdmin(req);
    const result = await startups.updateOne({ _id: String(req.params.id) }, { $set: parse(startupSchema, req.body) });
    if (!result.matchedCount) throw new HttpError(404, 'Not found.');
    res.json({ ok: true });
  });

  r.delete('/admin/startups/:id', async (req, res) => {
    requireAdmin(req);
    await startups.deleteOne({ _id: String(req.params.id) });
    res.json({ ok: true });
  });

  // ----- things experts have put out (webinars, podcasts, articles …) -----
  r.get('/public/expert-items/:expertId', async (req, res) => {
    requireMember(req);
    res.json({ items: outAll(await items.find({ expert_id: String(req.params.expertId) }).sort({ date: -1 }).toArray()) });
  });

  r.get('/admin/expert-items', async (req, res) => {
    requireAdmin(req);
    const filter = req.query.expert_id ? { expert_id: String(req.query.expert_id) } : {};
    res.json({ items: outAll(await items.find(filter).sort({ date: -1 }).limit(1000).toArray()) });
  });

  r.post('/admin/expert-items', async (req, res) => {
    requireAdmin(req);
    const doc = { _id: newId('xitem'), ...parse(expertItemSchema, req.body) };
    await items.insertOne(doc);
    res.status(201).json({ item: out(doc) });
  });

  r.put('/admin/expert-items/:id', async (req, res) => {
    requireAdmin(req);
    const result = await items.updateOne({ _id: String(req.params.id) }, { $set: parse(expertItemSchema, req.body) });
    if (!result.matchedCount) throw new HttpError(404, 'Not found.');
    res.json({ ok: true });
  });

  r.delete('/admin/expert-items/:id', async (req, res) => {
    requireAdmin(req);
    await items.deleteOne({ _id: String(req.params.id) });
    res.json({ ok: true });
  });

  // ----- site settings -----
  r.put('/admin/site-settings', async (req, res) => {
    requireAdmin(req);
    const body = parse(siteSchema, req.body);
    await database.col('settings').replaceOne({ _id: 'site' }, body, { upsert: true });
    res.json({ site: body });
  });

  return r;
}
