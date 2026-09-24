import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { HttpError } from './auth.js';
import type { Database } from './db.js';

export const newId = (prefix: string) => `${prefix}-${randomUUID()}`;
export const now = () => new Date().toISOString();

export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new HttpError(400, `${issue.path.join('.') || 'input'}: ${issue.message}`);
  }
  return result.data;
}

export type NotificationType =
  | 'application_status' | 'submission_review' | 'team_invite' | 'membership' | 'message' | 'mentorship' | 'event';

export async function notify(
  database: Database,
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
): Promise<void> {
  const unique = Array.from(new Set(userIds));
  if (!unique.length) return;
  await database.col('notifications').insertMany(
    unique.map(user_id => ({
      _id: newId('notif'),
      user_id,
      type,
      title,
      message,
      ...(link ? { link } : {}),
      read: false,
      created_at: now(),
    })),
  );
}

export async function adminIds(database: Database): Promise<string[]> {
  const admins = await database.col('users').find({ role: 'admin' }, { projection: { _id: 1 } }).toArray();
  return admins.map(a => a._id);
}

/** Moves a founder's personal roadmap data into a team scope when they create or join a team. */
export async function mergeScope(database: Database, fromKey: string, toKey: string): Promise<void> {
  if (fromKey === toKey) return;
  const { col } = database;

  const from = await col('scopes').findOne({ _id: fromKey });
  if (from) {
    const to = (await col('scopes').findOne({ _id: toKey })) || { _id: toKey } as Record<string, unknown>;
    await col('scopes').replaceOne(
      { _id: toKey },
      {
        working_problem_ids: Array.from(new Set([...((to.working_problem_ids as string[]) || []), ...((from.working_problem_ids as string[]) || [])])),
        category_locks: { ...((from.category_locks as object) || {}), ...((to.category_locks as object) || {}) },
        project_notes: { ...((from.project_notes as object) || {}), ...((to.project_notes as object) || {}) },
      },
      { upsert: true },
    );
    await col('scopes').deleteOne({ _id: fromKey });
  }

  for (const doc of await col('progress').find({ user_id: fromKey }).toArray()) {
    const targetId = `${toKey}:${doc.category_id}:${doc.step_id}`;
    if (!(await col('progress').findOne({ _id: targetId }))) {
      await col('progress').insertOne({ ...doc, _id: targetId, user_id: toKey });
    }
  }
  await col('progress').deleteMany({ user_id: fromKey });

  for (const doc of await col('workspaces').find({ scope_key: fromKey }).toArray()) {
    const targetId = `${toKey}::${doc.problem_id}::${doc.step_id}`;
    if (!(await col('workspaces').findOne({ _id: targetId }))) {
      await col('workspaces').insertOne({ ...doc, _id: targetId, scope_key: toKey });
    }
  }
  await col('workspaces').deleteMany({ scope_key: fromKey });

  await col('applications').updateMany({ scope_key: fromKey }, { $set: { scope_key: toKey } });
  await col('submissions').updateMany({ scope_key: fromKey }, { $set: { scope_key: toKey } });
}
