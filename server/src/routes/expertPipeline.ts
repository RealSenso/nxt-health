import { Router } from 'express';
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
  // Public profile (shown on the expert's page when listed). Never contact details.
  photo_url: z.string().trim().max(500).refine(u => /^https:\/\/[^\s]+$/i.test(u), 'must be an https:// link').or(z.literal('')).optional(),
  bio: text(3000).optional(),
  specialisation: text(300).optional(),
  organisation: text(200).optional(),
  city: text(120).optional(),
  years_experience: text(40).optional(),
  credentials: text(500).optional(),
  languages: text(200).optional(),
  how_to_help: text(2000).optional(),
}).strict();

/** The onboarded experts an admin has chosen to show: name, role and LinkedIn only — never contact details. */
export async function listedExperts(database: Database) {
  const docs = await database.col('expertPipeline').find({ listed: true }).sort({ name: 1 }).toArray();
  return docs.map(d => ({
    id: d._id as string,
    name: d.name as string,
    title: (d.title as string) || '',
    linkedin: /^https:\/\//i.test((d.linkedin as string) || '') ? (d.linkedin as string) : '',
    photo_url: (d.photo_url as string) || '',
  }));
}

const PROFILE_FIELDS = ['photo_url', 'bio', 'specialisation', 'organisation', 'city', 'years_experience', 'credentials', 'languages', 'how_to_help'] as const;

/** Everything public about one listed expert (for their own page). */
export async function listedExpert(database: Database, id: string) {
  const d = await database.col('expertPipeline').findOne({ _id: id, listed: true });
  if (!d) return null;
  return {
    id: d._id as string,
    name: d.name as string,
    title: (d.title as string) || '',
    linkedin: /^https:\/\//i.test((d.linkedin as string) || '') ? (d.linkedin as string) : '',
    ...Object.fromEntries(PROFILE_FIELDS.map(f => [f, (d[f] as string) || ''])),
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
    res.json({ experts: outAll(await pipeline.find().sort({ stage: 1, name: 1 }).limit(1000).toArray()) });
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

  r.patch('/admin/expert-pipeline/:id', async (req, res) => {
    requireAdmin(req);
    const fields = parse(expertSchema.omit({ id: true }).partial(), req.body);
    const result = await pipeline.updateOne({ _id: String(req.params.id) }, { $set: fields });
    if (!result.matchedCount) throw new HttpError(404, 'Not found.');
    res.json({ expert: out(await pipeline.findOne({ _id: String(req.params.id) })) });
  });

  r.delete('/admin/expert-pipeline/:id', async (req, res) => {
    requireAdmin(req);
    await pipeline.deleteOne({ _id: String(req.params.id) });
    res.json({ ok: true });
  });

  return r;
}
