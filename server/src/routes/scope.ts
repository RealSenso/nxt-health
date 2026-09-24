import { Router } from 'express';
import { z } from 'zod';
import { HttpError, requireMember, scopeKeyOf } from '../auth.js';
import type { Database } from '../db.js';
import { now, parse } from '../util.js';

const id = z.string().regex(/^[A-Za-z0-9_-]{1,120}$/, 'invalid id');
const param = (value: unknown) => parse(id, String(value));

const workspaceSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'blocked', 'done']),
  started_at: z.string().optional(),
  target_date: z.string().max(40).optional(),
  blocker: z.string().max(500).optional(),
  checklist: z.array(z.object({ id, label: z.string().trim().min(1).max(300), done: z.boolean(), custom: z.boolean() })).max(100),
  log: z.array(z.object({ id, text: z.string().max(5000), author_name: z.string().max(120), created_at: z.string() })).max(1000),
});

export function scopeRouter(database: Database): Router {
  const r = Router();
  const scopes = database.col('scopes');
  const progress = database.col('progress');
  const workspaces = database.col('workspaces');

  r.put('/scope/working-problems/:problemId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    await scopes.updateOne({ _id: key }, { $addToSet: { working_problem_ids: param(req.params.problemId) } }, { upsert: true });
    res.json({ ok: true });
  });

  r.delete('/scope/working-problems/:problemId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    await scopes.updateOne({ _id: key }, { $pull: { working_problem_ids: param(req.params.problemId) } as never });
    res.json({ ok: true });
  });

  r.delete('/scope/working-problems', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    await scopes.updateOne({ _id: key }, { $set: { working_problem_ids: [] } }, { upsert: true });
    res.json({ ok: true });
  });

  r.put('/scope/locks/:problemId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    const { category_id } = parse(z.object({ category_id: id }), req.body);
    if (!(await database.col('categories').findOne({ _id: category_id }))) throw new HttpError(404, 'Category not found.');
    await scopes.updateOne({ _id: key }, { $set: { [`category_locks.${param(req.params.problemId)}`]: category_id } }, { upsert: true });
    res.json({ ok: true });
  });

  r.delete('/scope/locks/:problemId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    await scopes.updateOne({ _id: key }, { $unset: { [`category_locks.${param(req.params.problemId)}`]: '' } });
    res.json({ ok: true });
  });

  r.put('/scope/notes/:problemId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    const { note } = parse(z.object({ note: z.string().max(5000) }), req.body);
    await scopes.updateOne({ _id: key }, { $set: { [`project_notes.${param(req.params.problemId)}`]: note } }, { upsert: true });
    res.json({ ok: true });
  });

  r.post('/scope/progress/toggle', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    const { category_id, step_id } = parse(z.object({ category_id: id, step_id: id }), req.body);
    const docId = `${key}:${category_id}:${step_id}`;
    const existing = await progress.findOne({ _id: docId });
    const completed = !existing?.completed;
    await progress.replaceOne(
      { _id: docId },
      { user_id: key, category_id, step_id, completed, updated_at: now() },
      { upsert: true },
    );
    res.json({ completed });
  });

  r.delete('/scope/progress/:categoryId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    await progress.deleteMany({ user_id: key, category_id: param(req.params.categoryId) });
    res.json({ ok: true });
  });

  r.put('/scope/workspaces/:problemId/:stepId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    const body = parse(workspaceSchema, req.body);
    const problem_id = param(req.params.problemId);
    const step_id = param(req.params.stepId);
    const docId = `${key}::${problem_id}::${step_id}`;
    await workspaces.replaceOne({ _id: docId }, { ...body, scope_key: key, problem_id, step_id, updated_at: now() }, { upsert: true });
    res.json({ ok: true });
  });

  r.delete('/scope/workspaces/:problemId', async (req, res) => {
    const key = scopeKeyOf(requireMember(req));
    await workspaces.deleteMany({ scope_key: key, problem_id: param(req.params.problemId) });
    res.json({ ok: true });
  });

  return r;
}
