import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAdmin, HttpError } from '../auth.js';
import type { Database } from '../db.js';
import { out, outAll } from '../db.js';
import { adminIds, newId, notify, now, parse } from '../util.js';

const inquirySchema = z.object({
  kind: z.enum(['lead', 'expert']),
  /** Leads: who they are ("Pharma company with a problem to fund"). */
  role: z.string().trim().max(120).optional(),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().toLowerCase().email().max(200),
  linkedin: z.string().trim().max(300).optional(),
  /** Experts: where they help most. */
  focus: z.string().trim().max(120).optional(),
  message: z.string().trim().min(1).max(3000),
  /** Honeypot — real visitors never fill this in. */
  website: z.string().max(0).optional(),
}).strict().refine(v => v.kind !== 'expert' || !!v.name, { message: 'name is required', path: ['name'] });

/** Public "get in touch" forms (problem sponsors, partners, experts) and the admin inbox for them. */
export function inquiriesRouter(database: Database, limitPerHour = 12): Router {
  const r = Router();
  const inquiries = database.col('inquiries');
  const limiter = rateLimit({ windowMs: 3_600_000, limit: limitPerHour, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests — please try again later.' } });

  r.post('/public/inquiries', limiter, async (req, res) => {
    const { website: _honeypot, ...body } = parse(inquirySchema, req.body);
    const doc = { _id: newId('inq'), ...body, status: 'new', created_at: now() };
    await inquiries.insertOne(doc);
    const what = body.kind === 'expert' ? `${body.name} wants to join as an expert` : `${body.role || 'Someone'} sent a problem`;
    await notify(database, await adminIds(database), 'inquiry', 'New enquiry', `${what} (${body.email}).`, '/admin/inquiries');
    res.status(201).json({ ok: true });
  });

  r.get('/admin/inquiries', async (req, res) => {
    requireAdmin(req);
    res.json({ inquiries: outAll(await inquiries.find().sort({ created_at: -1 }).limit(500).toArray()) });
  });

  r.patch('/admin/inquiries/:id', async (req, res) => {
    requireAdmin(req);
    const { status } = parse(z.object({ status: z.enum(['new', 'handled']) }), req.body);
    const result = await inquiries.updateOne({ _id: String(req.params.id) }, { $set: { status } });
    if (!result.matchedCount) throw new HttpError(404, 'Not found.');
    res.json({ inquiry: out(await inquiries.findOne({ _id: String(req.params.id) })) });
  });

  return r;
}
