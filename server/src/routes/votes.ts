import { Router } from 'express';
import { z } from 'zod';
import { HttpError, requireVerified } from '../auth.js';
import type { Database } from '../db.js';
import { now, parse } from '../util.js';

export type VoteTally = Record<string, { agree: number; disagree: number }>;

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

/** Signed-in people vote on whether they agree a problem statement is a real problem. One vote each, changeable. */
export function votesRouter(database: Database): Router {
  const r = Router();
  const votes = database.col('problemVotes');

  r.put('/problems/:id/vote', async (req, res) => {
    const user = requireVerified(req);
    const problemId = String(req.params.id);
    const { vote } = parse(z.object({ vote: z.enum(['agree', 'disagree']).nullable() }), req.body);
    if (!(await database.col('problems').findOne({ _id: problemId }, { projection: { _id: 1 } }))) throw new HttpError(404, 'Problem not found.');
    const _id = `${problemId}:${user._id}`;
    if (vote === null) await votes.deleteOne({ _id });
    else await votes.replaceOne({ _id }, { problem_id: problemId, user_id: user._id, vote, updated_at: now() }, { upsert: true });
    res.json({ ok: true, tally: (await voteTally(database))[problemId] ?? { agree: 0, disagree: 0 } });
  });

  return r;
}
