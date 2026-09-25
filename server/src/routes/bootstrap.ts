import { Router } from 'express';
import { isAdmin, scopeKeyOf, UserDoc } from '../auth.js';
import type { Database } from '../db.js';
import { out, outAll } from '../db.js';
import { threadQueryFor } from './threads.js';
import { CONSULTATION_RATE_USD } from './consultations.js';

const DEFAULT_SLACK_URL = 'https://join.slack.com/';
export const PREVIEW_STEPS = 3;
export const PREVIEW_RESOURCES = 6;

export function bootstrapRouter(database: Database): Router {
  const r = Router();
  const { col } = database;

  r.get('/bootstrap', async (req, res) => {
    const [problems, categories, steps, resources, slack, allBookings] = await Promise.all([
      col('problems').find().sort({ created_at: -1 }).toArray(),
      col('categories').find().sort({ order: 1 }).toArray(),
      col('steps').find().sort({ order: 1 }).toArray(),
      col('resources').find().sort({ _id: 1 }).toArray(),
      col('settings').findOne({ _id: 'slack' }),
      col('bookings').find({}, { projection: { resource_id: 1, slot: 1 } }).toArray(),
    ]);

    const bookedSlots: Record<string, string[]> = {};
    allBookings.forEach(b => { (bookedSlots[b.resource_id as string] ||= []).push(b.slot as string); });

    const viewer = req.user as UserDoc | null | undefined;
    const fullAccess = !!viewer && (isAdmin(viewer) || viewer.membership_status === 'active');
    const stepRank = new Map<string, number>();
    steps.forEach(st => {
      const siblings = steps.filter(x => x.category_id === st.category_id);
      stepRank.set(st._id, siblings.indexOf(st));
    });
    const visibleSteps = fullAccess
      ? outAll(steps)
      : outAll(steps).map(st => (stepRank.get(st.id)! < PREVIEW_STEPS ? st : { ...st, description: '', locked: true }));
    const visibleResources = fullAccess
      ? outAll(resources)
      : outAll(resources).map((res, i) => (i < PREVIEW_RESOURCES
        ? res
        : { id: res.id, step_id: res.step_id, type: res.type, title: res.title, description: '', locked: true }));

    const payload: Record<string, unknown> = {
      content: {
        problems: outAll(problems),
        categories: outAll(categories),
        steps: visibleSteps,
        resources: visibleResources,
        slack_url: (slack?.url as string) || DEFAULT_SLACK_URL,
        booked_slots: bookedSlots,
      },
      me: null,
      needs_profile: !!req.auth && !req.user,
    };

    const user = viewer;
    if (!req.auth || !user) return res.json(payload);

    const scopeKey = scopeKeyOf(user);
    const admin = isAdmin(user);
    const team = user.team_id ? await col('teams').findOne({ _id: user.team_id }) : null;
    const memberIds = (team?.member_ids as string[] | undefined) || [user._id];

    const scopeFilter = admin ? {} : { scope_key: scopeKey };
    const [
      teamMembers, incomingInvites, outgoingInvites, scope, progress, workspaces, applications, submissions,
      notifications, threads, myRsvps, myBookings, myRatings, publicProfile, mentorProfiles, mentorUsers,
      mentorRequests, consultations,
    ] = await Promise.all([
      col('users').find({ _id: { $in: memberIds } }, { projection: { name: 1, email: 1 } }).toArray(),
      col('teamInvites').find({ to_email: user.email, status: 'pending' }).toArray(),
      team ? col('teamInvites').find({ team_id: team._id, status: 'pending' }).toArray() : Promise.resolve([]),
      col('scopes').findOne({ _id: scopeKey }),
      col('progress').find(admin ? {} : { user_id: scopeKey }).toArray(),
      col('workspaces').find(scopeFilter).toArray(),
      col('applications').find(scopeFilter).sort({ submitted_at: -1 }).toArray(),
      col('submissions').find(scopeFilter).sort({ submitted_at: -1 }).toArray(),
      col('notifications').find({ user_id: user._id }).sort({ created_at: -1 }).limit(100).toArray(),
      col('threads').find(threadQueryFor(user)).sort({ last_message_at: -1 }).limit(200).toArray(),
      col('rsvps').find({ user_id: user._id }).toArray(),
      col('bookings').find({ user_id: user._id }).toArray(),
      col('stepRatings').find({ user_id: user._id }).toArray(),
      col('publicProfiles').findOne({ _id: user._id }),
      col('mentorProfiles').find().toArray(),
      col('users').find({ is_mentor: true }, { projection: { name: 1, background: 1 } }).toArray(),
      col('mentorRequests').find(admin ? {} : { $or: [{ mentor_uid: user._id }, { founder_uid: user._id }] }).sort({ created_at: -1 }).toArray(),
      col('consultations').find(admin ? {} : { $or: [{ mentor_uid: user._id }, { founder_uid: user._id }] }).sort({ created_at: -1 }).toArray(),
    ]);

    const acceptedCounts: Record<string, number> = {};
    (await col('mentorRequests').find({ status: 'accepted' }, { projection: { mentor_uid: 1 } }).toArray())
      .forEach(m => { acceptedCounts[m.mentor_uid as string] = (acceptedCounts[m.mentor_uid as string] || 0) + 1; });

    const canSeeMentors = admin || user.membership_status === 'active' || !!user.is_mentor;

    Object.assign(payload, {
      me: { ...out(user), email_verified: req.auth.email_verified },
      team: out(team as never),
      team_members: teamMembers.map(m => ({ id: m._id, name: m.name, email: m.email })),
      invites: { incoming: outAll(incomingInvites), outgoing: outAll(outgoingInvites) },
      scope: {
        key: scopeKey,
        working_problem_ids: (scope?.working_problem_ids as string[]) || [],
        category_locks: (scope?.category_locks as Record<string, string>) || {},
        project_notes: (scope?.project_notes as Record<string, string>) || {},
      },
      progress: progress.map(({ _id, ...p }) => p),
      workspaces: Object.fromEntries(workspaces.map(({ _id, ...w }) => [_id, w])),
      applications: outAll(applications),
      submissions: outAll(submissions),
      notifications: outAll(notifications),
      threads: threads.map(t => {
        const lastRead = (t.last_read_at as Record<string, string> | undefined)?.[user._id];
        return { ...out(t), unread: !!t.last_message_preview && (!lastRead || lastRead < (t.last_message_at as string)) };
      }),
      my_rsvps: myRsvps.map(r => r.resource_id),
      my_bookings: myBookings.map(b => ({ resource_id: b.resource_id, slot: b.slot })),
      my_ratings: outAll(myRatings),
      public_profile: out(publicProfile as never),
      mentors: canSeeMentors
        ? mentorUsers.map(m => {
          const profile = mentorProfiles.find(p => p._id === m._id);
          return { ...(profile ? out(profile) : {}), id: m._id, name: m.name, user_background: m.background, active_mentees: acceptedCounts[m._id] || 0, has_profile: !!profile };
        })
        : [],
      mentor_requests: outAll(mentorRequests),
      consultations: outAll(consultations),
      consultation_rate_usd: CONSULTATION_RATE_USD,
    });

    if (admin) {
      const [users, teams, scopes, resourceViews, stepRatings, rsvps, bookings] = await Promise.all([
        col('users').find().toArray(),
        col('teams').find().toArray(),
        col('scopes').find().toArray(),
        col('resourceViews').find().toArray(),
        col('stepRatings').find().toArray(),
        col('rsvps').find().toArray(),
        col('bookings').find().toArray(),
      ]);
      payload.admin = {
        users: outAll(users),
        teams: outAll(teams),
        scopes: outAll(scopes),
        resource_views: outAll(resourceViews),
        step_ratings: outAll(stepRatings),
        rsvps: outAll(rsvps),
        bookings: outAll(bookings),
      };
    }

    res.json(payload);
  });

  return r;
}
