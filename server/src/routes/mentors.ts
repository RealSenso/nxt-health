import { Router } from 'express';
import { z } from 'zod';
import { HttpError, isAdmin, requireMember, requireUser, requireVerified, UserDoc } from '../auth.js';
import type { Database } from '../db.js';
import { out } from '../db.js';
import { newId, notify, now, parse } from '../util.js';
import { createThread } from './threads.js';

const profileSchema = z.object({
  headline: z.string().trim().max(140),
  bio: z.string().trim().max(2000),
  expertise_stages: z.array(z.string().max(60)).max(20),
  category_ids: z.array(z.string().max(120)).max(30),
  background: z.enum(['clinical', 'engineering', 'science', 'business', 'other']).optional(),
  availability: z.string().trim().max(200),
  capacity: z.number().int().min(1).max(50),
  accepting: z.boolean(),
}).strict();

export function mentorsRouter(database: Database): Router {
  const r = Router();
  const profiles = database.col('mentorProfiles');
  const requests = database.col('mentorRequests');

  async function saveProfile(targetId: string, body: z.infer<typeof profileSchema>) {
    await profiles.replaceOne({ _id: targetId }, { ...body, updated_at: now() }, { upsert: true });
    return out(await profiles.findOne({ _id: targetId }));
  }

  r.put('/mentor/profile', async (req, res) => {
    const user = requireUser(req);
    if (!user.is_mentor) throw new HttpError(403, 'Only mentors can edit a mentor profile.');
    res.json({ profile: await saveProfile(user._id, parse(profileSchema, req.body)) });
  });

  r.put('/admin/mentors/:uid', async (req, res) => {
    const admin = requireUser(req);
    if (!isAdmin(admin)) throw new HttpError(403, 'Admins only.');
    const target = await database.col('users').findOne({ _id: String(req.params.uid) });
    if (!target?.is_mentor) throw new HttpError(400, 'Mark this user as a mentor first.');
    res.json({ profile: await saveProfile(target._id, parse(profileSchema, req.body)) });
  });

  r.post('/mentor-requests', async (req, res) => {
    const founder = requireMember(req);
    const { mentor_uid, message } = parse(z.object({ mentor_uid: z.string().min(1), message: z.string().trim().min(1).max(2000) }), req.body);
    if (mentor_uid === founder._id) throw new HttpError(400, "You can't request yourself.");
    const mentor = (await database.col('users').findOne({ _id: mentor_uid })) as UserDoc | null;
    const profile = await profiles.findOne({ _id: mentor_uid });
    if (!mentor?.is_mentor || !profile?.accepting) throw new HttpError(400, "This mentor isn't accepting requests right now.");
    const active = await requests.countDocuments({ mentor_uid, status: 'accepted' });
    if (active >= (profile.capacity as number)) throw new HttpError(409, 'This mentor is at capacity.');
    if (await requests.findOne({ mentor_uid, founder_uid: founder._id, status: { $in: ['pending', 'accepted'] } })) {
      throw new HttpError(400, 'You already have an open request with this mentor.');
    }
    const doc = {
      _id: newId('mreq'),
      mentor_uid,
      mentor_name: mentor.name,
      founder_uid: founder._id,
      founder_name: founder.name,
      message,
      status: 'pending',
      created_at: now(),
    };
    await requests.insertOne(doc);
    await notify(database, [mentor_uid], 'mentorship', 'New mentorship request', `${founder.name}: ${message.slice(0, 120)}`, '/mentoring');
    res.status(201).json({ request: out(doc) });
  });

  r.post('/mentor-requests/:id/respond', async (req, res) => {
    const mentor = requireVerified(req);
    const { accept } = parse(z.object({ accept: z.boolean() }), req.body);
    const request = await requests.findOne({ _id: String(req.params.id), mentor_uid: mentor._id, status: 'pending' });
    if (!request) throw new HttpError(404, 'Request not found.');
    let thread_id: string | undefined;
    if (accept) {
      const thread = await createThread(database, {
        subject: `Mentorship — ${mentor.name} & ${request.founder_name}`,
        context: { type: 'mentorship', id: request._id },
        participant_uids: [mentor._id, request.founder_uid as string],
        admin_visible: false,
      });
      thread_id = thread._id;
    }
    await requests.updateOne({ _id: request._id }, { $set: { status: accept ? 'accepted' : 'declined', responded_at: now(), ...(thread_id ? { thread_id } : {}) } });
    await notify(
      database,
      [request.founder_uid as string],
      'mentorship',
      accept ? 'Mentorship request accepted 🎉' : 'Mentorship request update',
      accept ? `${mentor.name} accepted — say hello in your new conversation.` : `${mentor.name} can't take this on right now.`,
      thread_id ? `/messages/${thread_id}` : '/mentors',
    );
    res.json({ request: out(await requests.findOne({ _id: request._id })) });
  });

  r.post('/mentor-requests/:id/end', async (req, res) => {
    const user = requireUser(req);
    const request = await requests.findOne({ _id: String(req.params.id), status: { $in: ['pending', 'accepted'] } });
    if (!request || (request.mentor_uid !== user._id && request.founder_uid !== user._id && !isAdmin(user))) {
      throw new HttpError(404, 'Request not found.');
    }
    await requests.updateOne({ _id: request._id }, { $set: { status: 'ended', ended_at: now() } });
    res.json({ ok: true });
  });

  return r;
}
