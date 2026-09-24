import { Router } from 'express';
import { z } from 'zod';
import { HttpError, requireAdmin, requireUser } from '../auth.js';
import type { CollectionName, Database } from '../db.js';
import { out } from '../db.js';
import { STARTER_CATEGORIES, STARTER_PROBLEMS, STARTER_RESOURCES, STARTER_STEPS } from '../starterContent.js';
import { newId, now, parse } from '../util.js';

const text = (max: number) => z.string().trim().max(max);
const optionalUrl = z.string().trim().url().max(500).or(z.literal('')).optional();

const schemas = {
  problems: z.object({
    title: text(300).min(1),
    description: text(5000),
    department: text(200).min(1),
    funded: z.boolean(),
    funding_amount: text(200).optional(),
  }),
  categories: z.object({ name: text(200).min(1), description: text(2000), order: z.number().int().min(0).max(10000) }),
  steps: z.object({
    category_id: z.string().min(1),
    name: text(300).min(1),
    description: text(5000),
    order: z.number().int().min(0).max(10000),
    stage_tag: text(80).optional(),
  }),
  resources: z.object({
    step_id: z.string().min(1),
    type: z.enum(['session', 'webinar', 'seminar', 'hospital_connection']),
    title: text(300).min(1),
    description: text(5000),
    link: optionalUrl,
    date: text(40).optional(),
    host_or_speaker: text(200).optional(),
    hospital_name: text(200).optional(),
    clinical_department: text(200).optional(),
    contact_person: text(200).optional(),
    contact_email: z.string().trim().email().max(200).or(z.literal('')).optional(),
    pilot_status: text(200).optional(),
    assigned_user_id: z.string().max(200).optional(),
    assigned_problem_id: z.string().max(200).optional(),
    capacity: z.number().int().min(1).max(100000).nullable().optional(),
    slots: z.array(z.string().datetime()).max(200).optional(),
    slot_minutes: z.number().int().min(5).max(480).optional(),
  }),
} as const;

type ContentKind = keyof typeof schemas;
const PREFIX: Record<ContentKind, string> = { problems: 'prob', categories: 'cat', steps: 'step', resources: 'res' };

export function contentRouter(database: Database): Router {
  const r = Router();

  for (const kind of Object.keys(schemas) as ContentKind[]) {
    const col = database.col(kind as CollectionName);

    r.post(`/admin/${kind}`, async (req, res) => {
      const admin = requireAdmin(req);
      const body = parse(schemas[kind], req.body);
      const doc = {
        _id: newId(PREFIX[kind]),
        ...body,
        ...(kind === 'problems' ? { created_by_admin: admin._id, created_at: now() } : {}),
        ...(kind === 'resources' ? { rsvp_count: 0 } : {}),
      };
      await col.insertOne(doc);
      res.status(201).json({ item: out(doc) });
    });

    r.put(`/admin/${kind}/:id`, async (req, res) => {
      requireAdmin(req);
      const body = parse(schemas[kind], req.body);
      const result = await col.updateOne({ _id: String(req.params.id) }, { $set: body });
      if (!result.matchedCount) throw new HttpError(404, 'Not found.');
      res.json({ item: out(await col.findOne({ _id: String(req.params.id) })) });
    });

    r.delete(`/admin/${kind}/:id`, async (req, res) => {
      requireAdmin(req);
      const id = String(req.params.id);
      await col.deleteOne({ _id: id });
      if (kind === 'categories') {
        const steps = await database.col('steps').find({ category_id: id }).toArray();
        await database.col('steps').deleteMany({ category_id: id });
        await database.col('resources').deleteMany({ step_id: { $in: steps.map(s => s._id) } });
        await database.col('scopes').updateMany({}, [{
          $set: {
            category_locks: {
              $arrayToObject: {
                $filter: { input: { $objectToArray: { $ifNull: ['$category_locks', {}] } }, cond: { $ne: ['$$this.v', id] } },
              },
            },
          },
        }]);
      }
      if (kind === 'steps') await database.col('resources').deleteMany({ step_id: id });
      res.json({ ok: true });
    });
  }

  r.put('/admin/settings/slack', async (req, res) => {
    requireAdmin(req);
    const { url } = parse(z.object({ url: z.string().trim().url().max(500) }), req.body);
    await database.col('settings').replaceOne({ _id: 'slack' }, { url }, { upsert: true });
    res.json({ ok: true });
  });

  r.post('/admin/starter-content', async (req, res) => {
    const admin = requireAdmin(req);
    if (await database.col('categories').countDocuments({}, { limit: 1 })) {
      throw new HttpError(409, 'Content already exists — starter content can only be loaded into an empty database.');
    }
    const toDocs = (items: Record<string, unknown>[]) => items.map(({ id, ...rest }) => ({ _id: id as string, ...rest }));
    await database.col('categories').insertMany(toDocs(STARTER_CATEGORIES));
    await database.col('steps').insertMany(toDocs(STARTER_STEPS));
    await database.col('resources').insertMany(toDocs(STARTER_RESOURCES).map(r => ({ ...r, rsvp_count: 0 })));
    await database.col('problems').insertMany(
      toDocs(STARTER_PROBLEMS).map(p => ({ ...p, created_by_admin: admin._id, created_at: now() })),
    );
    res.status(201).json({ ok: true });
  });

  r.post('/notifications/:id/read', async (req, res) => {
    const user = requireUser(req);
    await database.col('notifications').updateOne({ _id: String(req.params.id), user_id: user._id }, { $set: { read: true } });
    res.json({ ok: true });
  });

  r.post('/notifications/read-all', async (req, res) => {
    const user = requireUser(req);
    await database.col('notifications').updateMany({ user_id: user._id, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  });

  return r;
}
