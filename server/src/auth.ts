import type { NextFunction, Request, Response } from 'express';
import type { Database } from './db.js';

export interface VerifiedToken {
  uid: string;
  email: string;
  email_verified: boolean;
}

export type TokenVerifier = (token: string) => Promise<VerifiedToken>;

export interface UserDoc {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  membership_status: 'none' | 'requested' | 'active' | 'declined';
  is_mentor?: boolean;
  team_id?: string | null;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      auth?: VerifiedToken;
      user?: UserDoc | null;
    }
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function authenticate(verify: TokenVerifier, database: Database) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    try {
      req.auth = await verify(header.slice(7));
      req.user = (await database.col('users').findOne({ _id: req.auth.uid })) as UserDoc | null;
      next();
    } catch {
      next(new HttpError(401, 'Your session has expired. Please log in again.'));
    }
  };
}

export function requireAuth(req: Request): VerifiedToken {
  if (!req.auth) throw new HttpError(401, 'Please log in first.');
  return req.auth;
}

export function requireUser(req: Request): UserDoc {
  requireAuth(req);
  if (!req.user) throw new HttpError(403, 'Finish creating your profile first.');
  return req.user;
}

export function requireVerified(req: Request): UserDoc {
  const user = requireUser(req);
  if (!req.auth!.email_verified) throw new HttpError(403, 'Please verify your email address first.');
  return user;
}

export function requireMember(req: Request): UserDoc {
  const user = requireVerified(req);
  if (user.role !== 'admin' && user.membership_status !== 'active') {
    throw new HttpError(403, 'This needs an active membership.');
  }
  return user;
}

export function requireAdmin(req: Request): UserDoc {
  const user = requireUser(req);
  if (user.role !== 'admin') throw new HttpError(403, 'Admins only.');
  return user;
}

export const isAdmin = (user?: UserDoc | null) => user?.role === 'admin';

export const scopeKeyOf = (user: UserDoc) => user.team_id || user._id;

export async function scopeUserIds(database: Database, user: UserDoc): Promise<string[]> {
  if (!user.team_id) return [user._id];
  const team = await database.col('teams').findOne({ _id: user.team_id });
  return (team?.member_ids as string[] | undefined) || [user._id];
}

export function canAccessScope(user: UserDoc, scopeKey: string): boolean {
  return isAdmin(user) || scopeKeyOf(user) === scopeKey;
}
