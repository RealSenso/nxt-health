import { Router } from 'express';
import { z } from 'zod';
import { HttpError, requireAdmin } from '../auth.js';
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
}).strict();

/**
 * The experts NXT is talking to: people being onboarded and people approached. Admin-only —
 * none of this is public, and nobody here appears in the public directory until an admin sets
 * them up as a bookable expert (Members → Make mentor → profile).
 */
export function expertPipelineRouter(database: Database): Router {
  const r = Router();
  const pipeline = database.col('expertPipeline');

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
