import { Router } from 'express';
import { MongoServerError } from 'mongodb';
import { z } from 'zod';
import { HttpError, isAdmin, requireUser, requireVerified, UserDoc } from '../auth.js';
import type { Database } from '../db.js';
import { out } from '../db.js';
import { HOLD_MINUTES, upcomingSlots } from '../slots.js';
import { newId, notify, now, parse } from '../util.js';
import { createThread } from './threads.js';

/** Hourly rate used for experts who have not set one yet. */
export const DEFAULT_RATE_USD = 200;
/** The share of each session the expert keeps; the rest funds matching, booking and payments. */
export const EXPERT_SHARE = 0.8;

const bookSchema = z.object({
  mentor_uid: z.string().min(1).max(200),
  minutes: z.union([z.literal(30), z.literal(60)]),
  slot: z.string().datetime(),
  topic: z.string().trim().max(2000).optional(),
});

const cents = (n: number) => Math.round(n * 100) / 100;
const isDuplicate = (e: unknown) => e instanceof MongoServerError && e.code === 11000;

/** Slots an expert still has open: their weekly pattern minus anything already booked or held. */
export async function openSlotsFor(database: Database, profile: Record<string, unknown>, mentorUid: string): Promise<string[]> {
  const all = upcomingSlots((profile.session_days as number[]) || [], (profile.session_times as string[]) || []);
  if (!all.length) return [];
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60_000).toISOString();
  const taken = await database.col('consultations').find({
    mentor_uid: mentorUid,
    slot: { $in: all },
    $or: [{ status: 'paid' }, { status: 'awaiting_payment', created_at: { $gt: holdCutoff } }],
  }, { projection: { slot: 1 } }).toArray();
  const takenSet = new Set(taken.map(t => t.slot as string));
  return all.filter(s => !takenSet.has(s));
}

/**
 * Paid expert sessions: a founder picks a time, pays the expert's listed rate, and a private chat opens.
 * Payment is a demo step for now — "pay" marks the booking paid without charging a card.
 */
export function consultationsRouter(database: Database): Router {
  const r = Router();
  const consultations = database.col('consultations');

  async function loadOwn(id: string, user: UserDoc) {
    const doc = await consultations.findOne({ _id: id });
    if (!doc || (doc.founder_uid !== user._id && !isAdmin(user))) throw new HttpError(404, 'Booking not found.');
    return doc;
  }

  /** Marks a booking paid, opens the chat and tells the expert. Returns the updated booking. */
  async function confirm(doc: Record<string, unknown> & { _id: string }, mentorProfile: Record<string, unknown> | null) {
    const minutes = (doc.minutes as number) || 60;
    const thread = await createThread(database, {
      subject: `Session — ${doc.mentor_name} & ${doc.founder_name} (${minutes} min)`,
      context: { type: 'consultation', id: doc._id },
      participant_uids: [doc.mentor_uid as string, doc.founder_uid as string],
      admin_visible: false,
    });
    const meetingUrl = (mentorProfile?.meeting_url as string | undefined) || '';
    const paid = await consultations.findOneAndUpdate(
      { _id: doc._id, status: 'awaiting_payment' },
      { $set: { status: 'paid', paid_at: now(), payment_method: 'demo', thread_id: thread._id, ...(meetingUrl ? { meeting_url: meetingUrl } : {}) } },
      { returnDocument: 'after' },
    );
    if (!paid) {
      await database.col('threads').deleteOne({ _id: thread._id });
      return consultations.findOne({ _id: doc._id });
    }
    const when = doc.slot ? ` on ${new Date(doc.slot as string).toUTCString()}` : '';
    await notify(
      database,
      [doc.mentor_uid as string],
      'mentorship',
      'New session booked',
      `${doc.founder_name} booked ${minutes} minutes${when}${(doc.amount_usd as number) ? ` ($${doc.amount_usd})` : ''}.`,
      `/messages/${thread._id}`,
    );
    return paid;
  }

  r.post('/consultations', async (req, res) => {
    const founder = requireVerified(req);
    const body = parse(bookSchema, req.body);
    if (body.mentor_uid === founder._id) throw new HttpError(400, "You can't book yourself.");
    const mentor = (await database.col('users').findOne({ _id: body.mentor_uid })) as UserDoc | null;
    const profile = await database.col('mentorProfiles').findOne({ _id: body.mentor_uid });
    if (!mentor?.is_mentor || !profile?.accepting) throw new HttpError(400, "This expert isn't taking bookings right now.");

    if (!(await openSlotsFor(database, profile, mentor._id)).includes(body.slot)) {
      throw new HttpError(409, 'That time is no longer available — please pick another.');
    }
    // A hold that was never paid for frees the slot after HOLD_MINUTES.
    await consultations.updateMany(
      { mentor_uid: mentor._id, slot: body.slot, status: 'awaiting_payment', created_at: { $lte: new Date(Date.now() - HOLD_MINUTES * 60_000).toISOString() } },
      { $set: { status: 'cancelled', cancelled_at: now() } },
    );

    const rate = typeof profile.rate_usd === 'number' ? profile.rate_usd : DEFAULT_RATE_USD;
    const amount = cents((rate * body.minutes) / 60);
    const doc = {
      _id: newId('consult'),
      mentor_uid: mentor._id,
      mentor_name: mentor.name,
      founder_uid: founder._id,
      founder_name: founder.name,
      minutes: body.minutes,
      slot: body.slot,
      rate_usd: rate,
      amount_usd: amount,
      expert_share_usd: cents(amount * EXPERT_SHARE),
      topic: body.topic || '',
      status: 'awaiting_payment',
      created_at: now(),
    };
    try {
      await consultations.insertOne(doc);
    } catch (e) {
      if (isDuplicate(e)) throw new HttpError(409, 'Sorry, that time was just taken — please pick another.');
      throw e;
    }
    // Free sessions need no payment step.
    const booked = amount === 0 ? await confirm(doc, profile) : doc;
    res.status(201).json({ consultation: out(booked as typeof doc) });
  });

  r.post('/consultations/:id/pay', async (req, res) => {
    const user = requireVerified(req);
    const doc = await loadOwn(String(req.params.id), user);
    if (doc.status === 'paid') return res.json({ consultation: out(doc) });
    if (doc.status !== 'awaiting_payment') throw new HttpError(400, 'This booking can no longer be paid.');
    const profile = await database.col('mentorProfiles').findOne({ _id: doc.mentor_uid as string });
    res.json({ consultation: out((await confirm(doc as never, profile)) as never) });
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
