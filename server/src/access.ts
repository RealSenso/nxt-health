import type { Request } from 'express';
import { HttpError, requireVerified, type UserDoc } from './auth.js';
import type { Database } from './db.js';

/**
 * Roadmap work is for members. The one exception is the free guide: a signed-in person who is not a member may work on the
 * guide project (a problem flagged `guide`) and on categories flagged `free_access`. Every identifier supplied must be free.
 */
export async function requireRoadmapAccess(
  req: Request,
  database: Database,
  target: { problemId?: string; categoryId?: string } = {},
): Promise<UserDoc> {
  const user = requireVerified(req);
  if (user.role === 'admin' || user.membership_status === 'active') return user;

  const { problemId, categoryId } = target;
  if (!problemId && !categoryId) throw new HttpError(403, 'This needs an active membership.');
  if (problemId && !(await database.col('problems').findOne({ _id: problemId, guide: true }, { projection: { _id: 1 } }))) {
    throw new HttpError(403, 'This needs an active membership.');
  }
  if (categoryId && !(await database.col('categories').findOne({ _id: categoryId, free_access: true }, { projection: { _id: 1 } }))) {
    throw new HttpError(403, 'This needs an active membership.');
  }
  return user;
}
