import express, { Router } from 'express';
import { z } from 'zod';
import { HttpError, requireAdmin, requireMember } from '../auth.js';
import type { Database } from '../db.js';
import { out, outAll } from '../db.js';
import { parse } from '../util.js';

const text = (max: number) => z.string().trim().max(max);

const expertSchema = z.object({
  id: text(80).regex(/^exp-[a-z0-9-]+$/),
  name: text(120).min(1),
  title: text(400),
  email: text(200),
  phone: text(120),
  linkedin: text(300),
  fit: z.enum(['Strong', 'Medium', '']),
  stage: z.enum(['onboarding', 'outreach']),
  /** Shown in the expert list that founders and visitors see (name, role and LinkedIn only). */
  listed: z.boolean().optional(),
  /** What one session costs, in US dollars. Edited in the admin console. */
  rate_usd: z.number().min(0).max(1000).optional(),
  // Public profile (shown on the expert's page when listed). Never contact details.
  photo_url: z.string().trim().max(500).refine(u => /^https:\/\/[^\s]+$/i.test(u) || /^\/api\/public\/expert-photos\/[A-Za-z0-9_-]+(\?v=[a-z0-9]+)?$/.test(u), 'must be an https:// link').or(z.literal('')).optional(),
  bio: text(3000).optional(),
  specialisation: text(300).optional(),
  organisation: text(200).optional(),
  city: text(120).optional(),
  years_experience: text(40).optional(),
  credentials: text(500).optional(),
  languages: text(200).optional(),
  how_to_help: text(2000).optional(),
  tagline: text(200).optional(),
  location: text(160).optional(),
  tags: z.array(text(80)).max(25).optional(),
  facts: z.array(z.object({ title: text(80), text: text(300) })).max(6).optional(),
  /** Where the photo can be downloaded from, to make uploading it easy. */
  photo_source: text(500).optional(),
  intro_video_url: z.string().trim().max(500).refine(u => /^https:\/\/[^\s]+$/i.test(u), 'must be an https:// link').or(z.literal('')).optional(),
  highlights: z.array(z.object({ title: text(80), text: text(200) })).max(4).optional(),
  // What the expert knows, so founders can be matched to them.
  category_ids: z.array(text(120)).max(30).optional(),
  expertise_stages: z.array(text(60)).max(20).optional(),
  background: z.enum(['clinical', 'engineering', 'science', 'business', 'other', '']).optional(),
}).strict();

const RATE_STEPS = [50, 75, 100, 125, 150, 200];
/** A plausible starting rate, the same every time for the same person, until an admin sets one. */
export const defaultRate = (id: string): number => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return RATE_STEPS[h % RATE_STEPS.length];
};

/** The onboarded experts an admin has chosen to show: name, role and LinkedIn only — never contact details. */
export async function listedExperts(database: Database) {
  const docs = await database.col('expertPipeline').find({ listed: true }, { projection: { photo: 0 } }).sort({ name: 1 }).toArray();
  return docs.map(d => ({
    id: d._id as string,
    name: d.name as string,
    title: (d.title as string) || '',
    linkedin: /^https:\/\//i.test((d.linkedin as string) || '') ? (d.linkedin as string) : '',
    photo_url: (d.photo_url as string) || '',
    specialisation: (d.specialisation as string) || '',
    category_ids: (d.category_ids as string[]) || [],
    expertise_stages: (d.expertise_stages as string[]) || [],
    background: (d.background as string) || '',
    rate_usd: typeof d.rate_usd === 'number' ? (d.rate_usd as number) : defaultRate(d._id as string),
  }));
}

const PROFILE_FIELDS = ['photo_url', 'tagline', 'location', 'bio', 'specialisation', 'organisation', 'city', 'years_experience', 'credentials', 'languages', 'how_to_help'] as const;

/** Everything public about one listed expert (for their own page). */
export async function listedExpert(database: Database, id: string) {
  const d = await database.col('expertPipeline').findOne({ _id: id, listed: true }, { projection: { photo: 0 } });
  if (!d) return null;
  return {
    id: d._id as string,
    name: d.name as string,
    title: (d.title as string) || '',
    linkedin: /^https:\/\//i.test((d.linkedin as string) || '') ? (d.linkedin as string) : '',
    ...Object.fromEntries(PROFILE_FIELDS.map(f => [f, (d[f] as string) || ''])),
    rate_usd: typeof d.rate_usd === 'number' ? (d.rate_usd as number) : defaultRate(d._id as string),
    intro_video_url: (d.intro_video_url as string) || '',
    highlights: (d.highlights as { title: string; text: string }[]) || [],
    tags: (d.tags as string[]) || [],
    facts: (d.facts as { title: string; text: string }[]) || [],
  };
}

/**
 * The experts NXT is talking to: people being onboarded and people approached. Admin-only —
 * none of this is public, and nobody here appears in the public directory until an admin sets
 * them up as a bookable expert (Members → Make mentor → profile).
 */
export function expertPipelineRouter(database: Database): Router {
  const r = Router();
  const pipeline = database.col('expertPipeline');

  r.get('/public/listed-experts/:id', async (req, res) => {
    requireMember(req);
    const expert = await listedExpert(database, String(req.params.id));
    if (!expert) throw new HttpError(404, 'Expert not found.');
    res.json({ expert });
  });

  r.get('/admin/expert-pipeline', async (req, res) => {
    requireAdmin(req);
    res.json({ experts: outAll(await pipeline.find({}, { projection: { photo: 0 } }).sort({ stage: 1, name: 1 }).limit(1000).toArray()) });
  });

  /** Adds people from a file (the private experts.json). Existing records keep whatever an admin changed. */
  r.post('/admin/expert-pipeline/import', async (req, res) => {
    requireAdmin(req);
    const { experts } = parse(z.object({ experts: z.array(expertSchema).min(1).max(1000) }), req.body);
    let added = 0;
    for (const { id, ...fields } of experts) {
      const result = await pipeline.updateOne({ _id: id }, { $setOnInsert: fields }, { upsert: true });
      if (result.upsertedCount) added++;
    }
    res.status(201).json({ ok: true, added, total: experts.length });
  });

  /**
   * Adds or completes expert profiles from a file (name, role, tagline, location, tags, bio and facts). People already on
   * the list are matched by name; only their empty fields are filled, so nothing an admin edited is overwritten.
   * Everyone in the file is shown in the expert list.
   */
  r.post('/admin/expert-pipeline/profiles', express.json({ limit: '2mb' }), async (req, res) => {
    requireAdmin(req);
    const { profiles } = parse(z.object({
      profiles: z.array(z.object({
        name: text(120).min(1), title: text(400), tagline: text(200), location: text(160), specialisation: text(300),
        linkedin: text(300), tags: z.array(text(80)).max(25), bio: text(3000),
        facts: z.array(z.object({ title: text(80), text: text(300) })).max(6),
        photo_source: text(500).optional(),
      })).min(1).max(300),
    }), req.body);

    const key = (name: string) => name.toLowerCase().replace(/\b(dr|md|mba|phd|mph|prof)\b/g, '').replace(/[^a-z]+/g, '');
    const existing = await pipeline.find({}, { projection: { photo: 0 } }).toArray();
    const byKey = new Map(existing.map(d => [key(d.name as string), d]));
    let added = 0;
    let updated = 0;

    for (const p of profiles) {
      const link = /^https:\/\/[^\s]+$/i.test(p.linkedin) ? p.linkedin : '';
      const fields: Record<string, unknown> = {
        title: p.title, tagline: p.tagline, location: p.location, specialisation: p.specialisation, linkedin: link,
        tags: p.tags, bio: p.bio, facts: p.facts, photo_source: p.photo_source || '',
      };
      const found = byKey.get(key(p.name));
      if (found) {
        const empty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
        const fill = Object.fromEntries(Object.entries(fields).filter(([f, v]) => !empty(v) && empty(found[f])));
        await pipeline.updateOne({ _id: found._id as string }, { $set: { ...fill, listed: true } });
        updated++;
      } else {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'expert';
        await pipeline.insertOne({ _id: `exp-${slug}`, name: p.name, email: '', phone: '', fit: '', stage: 'onboarding', listed: true, ...fields });
        added++;
      }
    }
    res.status(201).json({ ok: true, added, updated });
  });

  /** Stores an expert's photo in the database; it is shown on their page. */
  r.put('/admin/expert-pipeline/:id/photo', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '2mb' }), async (req, res) => {
    requireAdmin(req);
    const id = String(req.params.id);
    const data = req.body as Buffer;
    if (!Buffer.isBuffer(data) || data.length === 0) throw new HttpError(400, 'Choose a JPEG, PNG or WebP image (up to 2 MB).');
    const type = data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? 'image/jpeg'
      : data.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) ? 'image/png'
      : data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP' ? 'image/webp' : '';
    if (!type) throw new HttpError(400, "That file isn't a JPEG, PNG or WebP image.");
    const url = `/api/public/expert-photos/${id}?v=${Date.now().toString(36)}`;
    const result = await pipeline.updateOne({ _id: id }, { $set: { photo: data, photo_type: type, photo_url: url } });
    if (!result.matchedCount) throw new HttpError(404, 'Expert not found.');
    res.json({ photo_url: url });
  });

  r.get('/public/expert-photos/:id', async (req, res) => {
    const doc = await pipeline.findOne({ _id: String(req.params.id), listed: true }, { projection: { photo: 1, photo_type: 1 } });
    const photo = doc?.photo as { buffer?: Buffer } | Buffer | undefined;
    const bytes = photo && ('buffer' in photo ? photo.buffer : photo);
    if (!bytes) throw new HttpError(404, 'No photo.');
    res.set({ 'Content-Type': String(doc?.photo_type || 'image/jpeg'), 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    res.send(Buffer.from(bytes as Buffer));
  });

  /** Adds one person by hand. */
  r.post('/admin/expert-pipeline', async (req, res) => {
    requireAdmin(req);
    const body = parse(expertSchema.omit({ id: true }), req.body);
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'expert';
    const id = `exp-${slug}-${Date.now().toString(36)}`;
    await pipeline.insertOne({ _id: id, ...body });
    res.status(201).json({ expert: out(await pipeline.findOne({ _id: id }, { projection: { photo: 0 } })) });
  });

  r.patch('/admin/expert-pipeline/:id', async (req, res) => {
    requireAdmin(req);
    const fields = parse(expertSchema.omit({ id: true }).partial(), req.body);
    const result = await pipeline.updateOne({ _id: String(req.params.id) }, { $set: fields });
    if (!result.matchedCount) throw new HttpError(404, 'Not found.');
    res.json({ expert: out(await pipeline.findOne({ _id: String(req.params.id) }, { projection: { photo: 0 } })) });
  });

  r.delete('/admin/expert-pipeline/:id', async (req, res) => {
    requireAdmin(req);
    await pipeline.deleteOne({ _id: String(req.params.id) });
    res.json({ ok: true });
  });

  return r;
}
