import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { HttpError } from '../auth.js';
import type { Database } from '../db.js';
import { now, parse } from '../util.js';

export type VoteTally = Record<string, { agree: number; disagree: number }>;
export type VoteBreakdown = { problem_id: string; agree: number; disagree: number; members: number; guests: number }[];

/** Agree / disagree counts for every problem statement. */
export async function voteTally(database: Database): Promise<VoteTally> {
  const rows = await database.col('problemVotes').aggregate<{ _id: { problem_id: string; vote: string }; n: number }>([
    { $group: { _id: { problem_id: '$problem_id', vote: '$vote' }, n: { $sum: 1 } } },
  ]).toArray();
  const tally: VoteTally = {};
  for (const { _id, n } of rows) {
    const entry = (tally[_id.problem_id] ||= { agree: 0, disagree: 0 });
    if (_id.vote === 'agree' || _id.vote === 'disagree') entry[_id.vote] = n;
  }
  return tally;
}

/** For admins: the same counts, split by whether the voter was signed in. */
export async function voteBreakdown(database: Database): Promise<VoteBreakdown> {
  const rows = await database.col('problemVotes').aggregate<{ _id: { problem_id: string; vote: string; guest: boolean }; n: number }>([
    { $group: { _id: { problem_id: '$problem_id', vote: '$vote', guest: { $eq: ['$kind', 'guest'] } }, n: { $sum: 1 } } },
  ]).toArray();
  const byProblem = new Map<string, VoteBreakdown[number]>();
  for (const { _id, n } of rows) {
    const entry = byProblem.get(_id.problem_id) ?? { problem_id: _id.problem_id, agree: 0, disagree: 0, members: 0, guests: 0 };
    if (_id.vote === 'agree' || _id.vote === 'disagree') entry[_id.vote] += n;
    if (_id.guest) entry.guests += n; else entry.members += n;
    byProblem.set(_id.problem_id, entry);
  }
  return [...byProblem.values()];
}

/**
 * Anyone can vote on whether a problem statement is a real problem — no account needed. One vote each, changeable.
 * Signed-in people vote under their account. Visitors vote under a random id their browser keeps, and a per-IP limit
 * keeps casual ballot-stuffing in check.
 */
export function votesRouter(database: Database, limitPerHour = 60): Router {
  const r = Router();
  const votes = database.col('problemVotes');
  const limiter = rateLimit({ windowMs: 3_600_000, limit: limitPerHour, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many votes from this connection — please try again later.' } });

  r.put('/problems/:id/vote', limiter, async (req, res) => {
    const problemId = String(req.params.id);
    const { vote, voter_id } = parse(z.object({
      vote: z.enum(['agree', 'disagree']).nullable(),
      voter_id: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/).optional(),
    }), req.body);
    const user = req.user as { _id: string } | null | undefined;
    if (!user && !voter_id) throw new HttpError(400, 'Missing voter id.');
    if (!(await database.col('problems').findOne({ _id: problemId }, { projection: { _id: 1 } }))) throw new HttpError(404, 'Problem not found.');
    const who = user ? { kind: 'member', user_id: user._id } : { kind: 'guest', voter_id };
    const _id = `${problemId}:${user ? user._id : `guest-${voter_id}`}`;
    if (vote === null) await votes.deleteOne({ _id });
    else await votes.replaceOne({ _id }, { problem_id: problemId, ...who, vote, updated_at: now() }, { upsert: true });
    res.json({ ok: true, tally: (await voteTally(database))[problemId] ?? { agree: 0, disagree: 0 } });
  });

  return r;
}
