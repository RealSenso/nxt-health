import { Router } from 'express';
import { MongoServerError } from 'mongodb';
import { z } from 'zod';
import { HttpError, isAdmin, requireMember, requireUser } from '../auth.js';
import type { Database } from '../db.js';
import { out } from '../db.js';
import { newId, notify, now, parse } from '../util.js';

const isDuplicate = (e: unknown) => e instanceof MongoServerError && e.code === 11000;

export function eventsRouter(database: Database): Router {
  const r = Router();
  const resources = database.col('resources');
  const rsvps = database.col('rsvps');
  const bookings = database.col('bookings');

  async function loadEvent(id: string, kinds: string[]) {
    const resource = await resources.findOne({ _id: id });
    if (!resource || !kinds.includes(resource.type as string)) throw new HttpError(404, 'Event not found.');
    return resource;
  }

  r.post('/events/:id/rsvp', async (req, res) => {
    const user = requireMember(req);
    const resource = await loadEvent(String(req.params.id), ['webinar', 'seminar', 'session']);
    if (resource.date && new Date(resource.date as string).getTime() < Date.now() - 86_400_000) {
      throw new HttpError(400, 'This event has already happened.');
    }
    if (await rsvps.findOne({ resource_id: resource._id, user_id: user._id })) return res.json({ ok: true });

    const reserved = await resources.findOneAndUpdate(
      {
        _id: resource._id,
        $or: [{ capacity: null }, { capacity: { $exists: false } }, { $expr: { $lt: [{ $ifNull: ['$rsvp_count', 0] }, '$capacity'] } }],
      },
      { $inc: { rsvp_count: 1 } },
    );
    if (!reserved) throw new HttpError(409, 'This event is full.');
    try {
      await rsvps.insertOne({ _id: newId('rsvp'), resource_id: resource._id, user_id: user._id, user_name: user.name, created_at: now() });
    } catch (e) {
      await resources.updateOne({ _id: resource._id }, { $inc: { rsvp_count: -1 } });
      if (isDuplicate(e)) return res.json({ ok: true });
      throw e;
    }
    res.status(201).json({ ok: true });
  });

  r.delete('/events/:id/rsvp', async (req, res) => {
    const user = requireUser(req);
    const removed = await rsvps.deleteOne({ resource_id: String(req.params.id), user_id: user._id });
    if (removed.deletedCount) await resources.updateOne({ _id: String(req.params.id) }, { $inc: { rsvp_count: -1 } });
    res.json({ ok: true });
  });

  r.post('/events/:id/bookings', async (req, res) => {
    const user = requireMember(req);
    const resource = await loadEvent(String(req.params.id), ['session']);
    const { slot } = parse(z.object({ slot: z.string().datetime() }), req.body);
    if (!((resource.slots as string[] | undefined) || []).includes(slot)) throw new HttpError(400, 'That time slot is not offered.');
    if (new Date(slot).getTime() < Date.now()) throw new HttpError(400, 'That time slot has passed.');
    try {
      await bookings.insertOne({ _id: newId('booking'), resource_id: resource._id, slot, user_id: user._id, user_name: user.name, created_at: now() });
    } catch (e) {
      if (!isDuplicate(e)) throw e;
      const mine = await bookings.findOne({ resource_id: resource._id, user_id: user._id });
      throw new HttpError(409, mine ? 'You already have a booking for this session — cancel it first to pick another time.' : 'Sorry, that slot was just taken.');
    }
    await notify(database, [user._id], 'event', 'Session booked', `You're booked for "${resource.title}" on ${new Date(slot).toUTCString()}.`, `/resources/${resource._id}`);
    res.status(201).json({ ok: true });
  });

  r.delete('/events/:id/bookings/:slot', async (req, res) => {
    const user = requireUser(req);
    const filter = { resource_id: String(req.params.id), slot: String(req.params.slot) };
    const booking = await bookings.findOne(filter);
    if (!booking || (booking.user_id !== user._id && !isAdmin(user))) throw new HttpError(404, 'Booking not found.');
    await bookings.deleteOne(filter);
    res.json({ ok: true });
  });

  r.post('/events/resource-view', async (req, res) => {
    const user = requireUser(req);
    const { resource_id } = parse(z.object({ resource_id: z.string().min(1).max(200) }), req.body);
    await database.col('resourceViews').insertOne({ _id: newId('view'), user_id: user._id, resource_id, viewed_at: now() });
    res.json({ ok: true });
  });

  r.put('/ratings/:stepId', async (req, res) => {
    const user = requireUser(req);
    const body = parse(z.object({ score: z.number().int().min(0).max(10), comment: z.string().trim().max(1000).optional() }), req.body);
    const step_id = String(req.params.stepId);
    await database.col('stepRatings').updateOne(
      { user_id: user._id, step_id },
      { $set: { ...body, created_at: now() }, $setOnInsert: { _id: newId('rating') } },
      { upsert: true },
    );
    res.json({ rating: out(await database.col('stepRatings').findOne({ user_id: user._id, step_id })) });
  });

  return r;
}
