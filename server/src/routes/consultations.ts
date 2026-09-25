import { Router } from 'express';
import { z } from 'zod';
import { HttpError, isAdmin, requireMember, requireUser, UserDoc } from '../auth.js';
import type { Database } from '../db.js';
import { out } from '../db.js';
import { newId, notify, now, parse } from '../util.js';
import { createThread } from './threads.js';

/** Price of a paid mentor consultation, per hour. The server is the source of truth for amounts. */
export const CONSULTATION_RATE_USD = 200;

const bookSchema = z.object({
  mentor_uid: z.string().min(1).max(200),
  hours: z.number().int().min(1).max(4),
  topic: z.string().trim().min(1).max(2000),
  preferred_time: z.string().datetime().or(z.literal('')).optional(),
});

/**
 * Paid consultations: a founder books hours with a mentor, pays, and a private chat opens.
 * Payment is a demo step for now — "pay" marks the booking paid without charging a card.
 */
export function consultationsRouter(database: Database): Router {
  const r = Router();
  const consultations = database.col('consultations');

  async function loadOwn(id: string, founder: UserDoc) {
    const doc = await consultations.findOne({ _id: id });
    if (!doc || (doc.founder_uid !== founder._id && !isAdmin(founder))) throw new HttpError(404, 'Consultation not found.');
    return doc;
  }

  r.post('/consultations', async (req, res) => {
    const founder = requireMember(req);
    const body = parse(bookSchema, req.body);
    if (body.mentor_uid === founder._id) throw new HttpError(400, "You can't book yourself.");
    const mentor = (await database.col('users').findOne({ _id: body.mentor_uid })) as UserDoc | null;
    if (!mentor?.is_mentor) throw new HttpError(400, 'That person is not a mentor.');
    const doc = {
      _id: newId('consult'),
      mentor_uid: mentor._id,
      mentor_name: mentor.name,
      founder_uid: founder._id,
      founder_name: founder.name,
      hours: body.hours,
      rate_usd: CONSULTATION_RATE_USD,
      amount_usd: body.hours * CONSULTATION_RATE_USD,
      topic: body.topic,
      ...(body.preferred_time ? { preferred_time: body.preferred_time } : {}),
      status: 'awaiting_payment',
      created_at: now(),
    };
    await consultations.insertOne(doc);
    res.status(201).json({ consultation: out(doc) });
  });

  r.post('/consultations/:id/pay', async (req, res) => {
    const founder = requireMember(req);
    const doc = await loadOwn(String(req.params.id), founder);
    if (doc.status === 'paid') return res.json({ consultation: out(doc) });
    if (doc.status !== 'awaiting_payment') throw new HttpError(400, 'This consultation can no longer be paid.');

    const thread = await createThread(database, {
      subject: `Consultation — ${doc.mentor_name} & ${doc.founder_name} (${doc.hours} h)`,
      context: { type: 'consultation', id: doc._id as string },
      participant_uids: [doc.mentor_uid as string, doc.founder_uid as string],
      admin_visible: false,
    });
    const paid = await consultations.findOneAndUpdate(
      { _id: doc._id, status: 'awaiting_payment' },
      { $set: { status: 'paid', paid_at: now(), payment_method: 'demo', thread_id: thread._id } },
      { returnDocument: 'after' },
    );
    if (!paid) {
      await database.col('threads').deleteOne({ _id: thread._id });
      return res.json({ consultation: out(await consultations.findOne({ _id: doc._id })) });
    }
    const when = doc.preferred_time ? ` Preferred time: ${new Date(doc.preferred_time as string).toUTCString()}.` : '';
    await notify(
      database,
      [doc.mentor_uid as string],
      'mentorship',
      'New paid consultation',
      `${doc.founder_name} booked ${doc.hours} h with you ($${doc.amount_usd}).${when} Topic: ${(doc.topic as string).slice(0, 100)}`,
      `/messages/${thread._id}`,
    );
    res.json({ consultation: out(paid) });
  });

  r.post('/consultations/:id/cancel', async (req, res) => {
    const user = requireUser(req);
    const doc = await loadOwn(String(req.params.id), user);
    if (doc.status !== 'awaiting_payment') throw new HttpError(400, 'Only unpaid bookings can be cancelled.');
    await consultations.updateOne({ _id: doc._id }, { $set: { status: 'cancelled', cancelled_at: now() } });
    res.json({ ok: true });
  });

  return r;
}
