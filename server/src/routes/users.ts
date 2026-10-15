import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { HttpError, isAdmin, requireAdmin, requireAuth, requireUser, requireVerified } from '../auth.js';
import type { Database } from '../db.js';
import { out } from '../db.js';
import { adminIds, notify, now, parse } from '../util.js';

const gender = z.enum(['female', 'male', 'other', 'prefer_not_to_say']);
const background = z.enum(['clinical', 'engineering', 'science', 'business', 'other']);
const source = z.enum(['referral', 'linkedin', 'university', 'event', 'search', 'hospital_partner', 'other']);
const shortText = (max: number) => z.string().trim().max(max);

const createSchema = z.object({
  name: shortText(120).min(1),
  location: shortText(120).optional(),
  gender: gender.optional(),
  acquisition_source: source.optional(),
  background: background.optional(),
});

const profileSchema = z.object({
  name: shortText(120).min(1).optional(),
  location: shortText(120).optional(),
  gender: gender.optional(),
  background: background.optional(),
  first_time_founder: z.boolean().optional(),
  commitment: z.enum(['full_time', 'part_time']).optional(),
  startup_stage: z.enum(['idea', 'pre_seed', 'seed', 'series_a_plus']).optional(),
  funding_raised_total: z.number().int().min(0).max(1e12).optional(),
  has_revenue: z.boolean().optional(),
  acquisition_source: source.optional(),
  outcomes: z.object({
    pilots_signed: z.number().int().min(0).max(10000),
    regulatory_filings: z.number().int().min(0).max(10000),
    funding_raised_since_joining: z.number().int().min(0).max(1e12),
  }).optional(),
}).strict();

const publicProfileSchema = z.object({
  is_public: z.boolean(),
  headline: shortText(140).optional(),
  bio: shortText(1500).optional(),
  website: z.string().trim().url().max(300).or(z.literal('')).optional(),
  linkedin: z.string().trim().url().max(300).or(z.literal('')).optional(),
  show_location: z.boolean().optional(),
  show_background: z.boolean().optional(),
  show_startup_stage: z.boolean().optional(),
  show_team: z.boolean().optional(),
}).strict();

const adminUserSchema = z.object({
  role: z.enum(['admin', 'member']).optional(),
  membership_status: z.enum(['none', 'requested', 'active', 'declined']).optional(),
  is_mentor: z.boolean().optional(),
  archived: z.boolean().optional(),
}).strict();

export function usersRouter(database: Database): Router {
  const r = Router();
  const users = database.col('users');

  r.post('/users/me', async (req, res) => {
    const auth = requireAuth(req);
    const body = parse(createSchema, req.body);
    const existing = await users.findOne({ _id: auth.uid });
    if (existing) return res.json({ user: out(existing) });
    const doc = {
      _id: auth.uid,
      email: auth.email.toLowerCase(),
      ...body,
      role: 'member',
      membership_status: 'none',
      is_mentor: false,
      team_id: null,
      saved_problem_ids: [],
      created_at: now(),
      last_active_at: now(),
    };
    await users.insertOne(doc);
    res.status(201).json({ user: out(doc) });
  });

  r.patch('/users/me', async (req, res) => {
    const user = requireUser(req);
    const body = parse(profileSchema, req.body);
    const update: Record<string, unknown> = { ...body };
    if (body.outcomes) update.outcomes = { ...body.outcomes, updated_at: now() };
    await users.updateOne({ _id: user._id }, { $set: update });
    res.json({ user: out(await users.findOne({ _id: user._id })) });
  });

  r.post('/users/me/activity', async (req, res) => {
    const user = requireUser(req);
    const last = user.last_active_at ? new Date(user.last_active_at as string).getTime() : 0;
    if (Date.now() - last > 3_600_000) {
      await users.updateOne({ _id: user._id }, { $set: { last_active_at: now(), email: req.auth!.email.toLowerCase() } });
    }
    res.json({ ok: true });
  });

  r.post('/users/me/membership-request', async (req, res) => {
    const user = requireVerified(req);
    if (user.membership_status === 'active') throw new HttpError(400, "You're already a member.");
    if (user.membership_status === 'requested') return res.json({ ok: true });
    await users.updateOne({ _id: user._id }, { $set: { membership_status: 'requested', membership_requested_at: now() } });
    await notify(database, await adminIds(database), 'membership', 'New membership request', `${user.name} (${user.email}) asked to become a member.`, '/admin/members');
    res.json({ ok: true });
  });

  r.post('/users/me/saved', async (req, res) => {
    const user = requireUser(req);
    const { problem_id } = parse(z.object({ problem_id: z.string().min(1) }), req.body);
    const saved = (user.saved_problem_ids as string[] | undefined) || [];
    const next = saved.includes(problem_id) ? saved.filter(id => id !== problem_id) : [...saved, problem_id];
    await users.updateOne({ _id: user._id }, { $set: { saved_problem_ids: next } });
    res.json({ saved_problem_ids: next });
  });

  r.put('/users/me/public-profile', async (req, res) => {
    const user = requireUser(req);
    const body = parse(publicProfileSchema, req.body);
    await database.col('publicProfiles').replaceOne({ _id: user._id }, { ...body, updated_at: now() }, { upsert: true });
    res.json({ profile: out(await database.col('publicProfiles').findOne({ _id: user._id })) });
  });

  r.get('/public/founders/:uid', async (req, res) => {
    const uid = String(req.params.uid);
    const profile = await database.col('publicProfiles').findOne({ _id: uid });
    const owner = await users.findOne({ _id: uid });
    const viewerCanSeePrivate = req.user && (req.user._id === uid || isAdmin(req.user));
    if (!owner || (!profile?.is_public && !viewerCanSeePrivate)) {
      return res.status(404).json({ error: 'This profile is private or does not exist.' });
    }
    const team = profile?.show_team && owner.team_id ? await database.col('teams').findOne({ _id: owner.team_id as string }) : null;
    res.json({
      profile: {
        id: uid,
        name: owner.name,
        is_public: !!profile?.is_public,
        headline: profile?.headline || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
        linkedin: profile?.linkedin || '',
        location: profile?.show_location ? owner.location || '' : '',
        background: profile?.show_background ? owner.background || '' : '',
        startup_stage: profile?.show_startup_stage ? owner.startup_stage || '' : '',
        is_mentor: !!owner.is_mentor,
        team: team && (team.is_public || viewerCanSeePrivate) ? { id: team._id, name: team.name } : null,
      },
    });
  });

  r.patch('/admin/users/:id', async (req, res) => {
    const admin = requireAdmin(req);
    const id = String(req.params.id);
    const body = parse(adminUserSchema, req.body);
    const target = await users.findOne({ _id: id });
    if (!target) throw new HttpError(404, 'User not found.');
    if (id === admin._id && body.role === 'member') throw new HttpError(400, "You can't remove your own admin role.");
    if (body.archived && (id === admin._id || target.role === 'admin')) throw new HttpError(400, "Admins can't be archived. Remove their admin role first.");
    const update: Record<string, unknown> = { ...body };
    if (body.membership_status === 'active' && target.membership_status !== 'active') update.membership_started_at = now();
    await users.updateOne({ _id: id }, { $set: update });

    if (body.membership_status && body.membership_status !== target.membership_status) {
      if (body.membership_status === 'active') {
        await notify(database, [id], 'membership', 'Membership approved 🎉', 'You now have full access to roadmaps, resources, and funding applications.', '/roadmaps');
      } else if (body.membership_status === 'declined') {
        await notify(database, [id], 'membership', 'Membership request update', "Your membership request wasn't approved this time. Reply via Founder Slack if you have questions.");
      }
    }
    if (body.is_mentor === true && !target.is_mentor) {
      await notify(database, [id], 'mentorship', "You're now an expert", 'An admin added you as an expert. Set up your expert profile so founders can find you.', '/mentoring');
    }
    res.json({ user: out(await users.findOne({ _id: id })) });
  });

  /**
   * Permanently removes one person and what they own: profile, roadmap work, applications, evidence, messages and bookings.
   * Admins can't be deleted (remove their admin role first), and nobody can delete themselves. Archive keeps the data.
   */
  r.delete('/admin/users/:id', async (req, res) => {
    const admin = requireAdmin(req);
    const id = String(req.params.id);
    const target = await users.findOne({ _id: id });
    if (!target) throw new HttpError(404, 'User not found.');
    if (id === admin._id) throw new HttpError(400, "You can't delete your own account.");
    if (target.role === 'admin') throw new HttpError(400, "Admins can't be deleted. Remove their admin role first.");

    const col = database.col;
    const submissions = await col('submissions').find({ $or: [{ user_id: id }, { scope_key: id }] }).toArray();
    for (const sub of submissions) {
      for (const file of (sub.files as { file_id: string }[] | undefined) || []) {
        await database.files.delete(new ObjectId(file.file_id)).catch(() => undefined);
      }
    }
    const threads = await col('threads').find({ participant_uids: id }).toArray();
    const ownThreadIds = threads.filter(t => (t.participant_uids as string[]).length <= 2).map(t => t._id as string);
    const team = target.team_id ? await col('teams').findOne({ _id: target.team_id as string }) : null;

    await Promise.all([
      col('messages').deleteMany({ thread_id: { $in: ownThreadIds } }),
      col('threads').deleteMany({ _id: { $in: ownThreadIds } }),
      col('threads').updateMany({ participant_uids: id }, { $pull: { participant_uids: id } as never }),
      col('notifications').deleteMany({ user_id: id }),
      col('rsvps').deleteMany({ user_id: id }),
      col('bookings').deleteMany({ user_id: id }),
      col('mentorRequests').deleteMany({ $or: [{ founder_uid: id }, { mentor_uid: id }] }),
      col('consultations').deleteMany({ $or: [{ founder_uid: id }, { mentor_uid: id }] }),
      col('teamInvites').deleteMany({ $or: [{ invited_by: id }, { to_email: target.email as string }] }),
      col('publicProfiles').deleteMany({ _id: id }),
      col('mentorProfiles').deleteMany({ _id: id }),
      col('scopes').deleteMany({ _id: id }),
      col('progress').deleteMany({ user_id: id }),
      col('workspaces').deleteMany({ scope_key: id }),
      col('applications').deleteMany({ $or: [{ user_id: id }, { scope_key: id }] }),
      col('submissions').deleteMany({ _id: { $in: submissions.map(s => s._id as string) } }),
      col('stepRatings').deleteMany({ user_id: id }),
      col('resourceViews').deleteMany({ user_id: id }),
      col('problemVotes').deleteMany({ user_id: id }),
    ]);
    if (team) {
      const remaining = ((team.member_ids as string[]) || []).filter(m => m !== id);
      if (remaining.length === 0) await col('teams').deleteOne({ _id: team._id as string });
      else await col('teams').updateOne({ _id: team._id as string }, { $set: { member_ids: remaining } });
    }
    await col('resources').updateMany({}, { $set: { rsvp_count: 0 } });
    for (const { _id, n } of await col('rsvps').aggregate<{ _id: string; n: number }>([{ $group: { _id: '$resource_id', n: { $sum: 1 } } }]).toArray()) {
      await col('resources').updateOne({ _id }, { $set: { rsvp_count: n } });
    }
    await users.deleteOne({ _id: id });

    // Their sign-in account too, when this server can reach the identity service.
    if (getApps().length) await getAuth().deleteUser(id).catch(() => undefined);
    res.json({ ok: true });
  });

  return r;
}
