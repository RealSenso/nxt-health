import { Router } from 'express';
import { z } from 'zod';
import { HttpError, isAdmin, requireUser, requireVerified, UserDoc } from '../auth.js';
import type { Database } from '../db.js';
import { out } from '../db.js';
import { mergeScope, newId, notify, now, parse } from '../util.js';

const teamUpdateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  tagline: z.string().trim().max(160).optional(),
  website: z.string().trim().url().max(300).or(z.literal('')).optional(),
  is_public: z.boolean().optional(),
}).strict();

export function teamsRouter(database: Database): Router {
  const r = Router();
  const teams = database.col('teams');
  const users = database.col('users');
  const invites = database.col('teamInvites');

  async function createTeam(user: UserDoc, name?: string) {
    const team = {
      _id: newId('team'),
      name: name?.trim() || `${user.name.split(' ')[0]}'s Team`,
      owner_id: user._id,
      member_ids: [user._id],
      is_public: false,
      created_at: now(),
    };
    await teams.insertOne(team);
    await users.updateOne({ _id: user._id }, { $set: { team_id: team._id } });
    await mergeScope(database, user._id, team._id);
    return team;
  }

  r.post('/teams', async (req, res) => {
    const user = requireVerified(req);
    if (user.team_id) throw new HttpError(400, "You're already on a team.");
    const { name } = parse(z.object({ name: z.string().max(80).optional() }), req.body);
    res.status(201).json({ team: out(await createTeam(user, name)) });
  });

  r.patch('/teams/mine', async (req, res) => {
    const user = requireUser(req);
    const team = user.team_id ? await teams.findOne({ _id: user.team_id }) : null;
    if (!team) throw new HttpError(404, "You're not on a team.");
    if (team.owner_id !== user._id) throw new HttpError(403, 'Only the team owner can edit the team.');
    await teams.updateOne({ _id: team._id }, { $set: parse(teamUpdateSchema, req.body) });
    res.json({ team: out(await teams.findOne({ _id: team._id })) });
  });

  r.post('/teams/invites', async (req, res) => {
    const user = requireVerified(req);
    const { email } = parse(z.object({ email: z.string().trim().toLowerCase().email() }), req.body);
    if (email === user.email) throw new HttpError(400, "That's your own account.");
    const target = await users.findOne({ email });
    if (target?.team_id) throw new HttpError(400, `${target.name} is already on a team.`);

    const team = user.team_id ? await teams.findOne({ _id: user.team_id }) : await createTeam(user);
    if (!team) throw new HttpError(404, 'Team not found.');
    if (await invites.findOne({ team_id: team._id, to_email: email, status: 'pending' })) {
      throw new HttpError(400, 'That person already has a pending invite.');
    }
    const invite = {
      _id: newId('invite'),
      team_id: team._id,
      team_name: team.name,
      from_uid: user._id,
      from_name: user.name,
      to_email: email,
      status: 'pending',
      created_at: now(),
    };
    await invites.insertOne(invite);
    if (target) {
      await notify(database, [target._id], 'team_invite', 'Team invitation', `${user.name} invited you to join "${team.name}".`, '/dashboard');
    }
    res.status(201).json({ invite: out(invite), registered: !!target });
  });

  r.post('/teams/invites/:id/:action', async (req, res) => {
    const user = requireVerified(req);
    const action = String(req.params.action);
    if (action !== 'accept' && action !== 'decline') throw new HttpError(404, 'Unknown action.');
    const invite = await invites.findOne({ _id: String(req.params.id), status: 'pending' });
    if (!invite || invite.to_email !== user.email) throw new HttpError(404, 'Invitation not found.');

    if (action === 'decline') {
      await invites.updateOne({ _id: invite._id }, { $set: { status: 'declined', responded_at: now() } });
      await notify(database, [invite.from_uid as string], 'team_invite', 'Invitation declined', `${user.name} declined your team invitation.`);
      return res.json({ ok: true });
    }

    if (user.team_id) throw new HttpError(400, 'Leave your current team before joining another.');
    const team = await teams.findOne({ _id: invite.team_id as string });
    if (!team) throw new HttpError(404, 'That team no longer exists.');
    await teams.updateOne({ _id: team._id }, { $addToSet: { member_ids: user._id } });
    await users.updateOne({ _id: user._id }, { $set: { team_id: team._id } });
    await mergeScope(database, user._id, team._id);
    await invites.updateOne({ _id: invite._id }, { $set: { status: 'accepted', responded_at: now() } });
    await notify(database, (team.member_ids as string[]), 'team_invite', 'New teammate', `${user.name} joined "${team.name}".`);
    res.json({ team: out(await teams.findOne({ _id: team._id })) });
  });

  r.delete('/teams/invites/:id', async (req, res) => {
    const user = requireUser(req);
    const invite = await invites.findOne({ _id: String(req.params.id), status: 'pending' });
    if (!invite || (invite.team_id !== user.team_id && !isAdmin(user))) throw new HttpError(404, 'Invitation not found.');
    await invites.updateOne({ _id: invite._id }, { $set: { status: 'cancelled' } });
    res.json({ ok: true });
  });

  r.delete('/teams/members/:uid', async (req, res) => {
    const user = requireUser(req);
    const memberId = String(req.params.uid);
    const team = user.team_id ? await teams.findOne({ _id: user.team_id }) : null;
    if (!team) throw new HttpError(404, "You're not on a team.");
    if (team.owner_id !== user._id) throw new HttpError(403, 'Only the team owner can remove members.');
    if (memberId === user._id) throw new HttpError(400, 'Use "Leave team" to remove yourself.');
    await teams.updateOne({ _id: team._id }, { $pull: { member_ids: memberId } as never });
    await users.updateOne({ _id: memberId, team_id: team._id }, { $set: { team_id: null } });
    await notify(database, [memberId], 'team_invite', 'Removed from team', `You were removed from "${team.name}".`);
    res.json({ ok: true });
  });

  r.post('/teams/leave', async (req, res) => {
    const user = requireUser(req);
    const team = user.team_id ? await teams.findOne({ _id: user.team_id }) : null;
    if (!team) return res.json({ ok: true });
    const remaining = (team.member_ids as string[]).filter(id => id !== user._id);
    if (remaining.length === 0) {
      await teams.deleteOne({ _id: team._id });
    } else {
      await teams.updateOne(
        { _id: team._id },
        { $set: { member_ids: remaining, owner_id: team.owner_id === user._id ? remaining[0] : team.owner_id } },
      );
    }
    await users.updateOne({ _id: user._id }, { $set: { team_id: null } });
    res.json({ ok: true });
  });

  r.get('/public/teams/:id', async (req, res) => {
    const team = await teams.findOne({ _id: String(req.params.id) });
    const viewer = req.user;
    const isMemberOrAdmin = !!viewer && (isAdmin(viewer) || (team?.member_ids as string[] | undefined)?.includes(viewer._id));
    if (!team || (!team.is_public && !isMemberOrAdmin)) {
      return res.status(404).json({ error: 'This team page is private or does not exist.' });
    }
    const memberIds = team.member_ids as string[];
    const [members, profiles] = await Promise.all([
      users.find({ _id: { $in: memberIds } }, { projection: { name: 1 } }).toArray(),
      database.col('publicProfiles').find({ _id: { $in: memberIds }, is_public: true }, { projection: { headline: 1 } }).toArray(),
    ]);
    res.json({
      team: {
        id: team._id,
        name: team.name,
        tagline: team.tagline || '',
        website: team.website || '',
        is_public: !!team.is_public,
        member_count: memberIds.length,
        members: members
          .filter(m => isMemberOrAdmin || profiles.some(p => p._id === m._id))
          .map(m => {
            const p = profiles.find(pp => pp._id === m._id);
            return { id: m._id, name: m.name, headline: p?.headline || '', has_public_profile: !!p };
          }),
      },
    });
  });

  return r;
}
