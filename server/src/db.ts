import { Db, GridFSBucket, MongoClient, Collection } from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDoc = { _id: string; [key: string]: any };

export const COLLECTIONS = [
  'users', 'publicProfiles', 'teams', 'teamInvites',
  'problems', 'categories', 'steps', 'resources', 'settings',
  'scopes', 'progress', 'workspaces',
  'applications', 'submissions', 'notifications',
  'threads', 'messages',
  'rsvps', 'bookings',
  'mentorProfiles', 'mentorRequests',
  'resourceViews', 'stepRatings',
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

export interface Database {
  db: Db;
  files: GridFSBucket;
  col: (name: CollectionName) => Collection<AnyDoc>;
}

export function wrapDb(db: Db): Database {
  return {
    db,
    files: new GridFSBucket(db, { bucketName: 'evidence' }),
    col: (name) => db.collection<AnyDoc>(name),
  };
}

export async function connect(uri: string, dbName = 'nxt_health'): Promise<{ client: MongoClient; database: Database }> {
  const client = new MongoClient(uri);
  await client.connect();
  const database = wrapDb(client.db(dbName));
  await ensureIndexes(database);
  return { client, database };
}

export async function ensureIndexes({ col }: Database): Promise<void> {
  await Promise.all([
    col('users').createIndex({ email: 1 }),
    col('users').createIndex({ team_id: 1 }),
    col('teamInvites').createIndex({ to_email: 1, status: 1 }),
    col('teamInvites').createIndex({ team_id: 1, status: 1 }),
    col('progress').createIndex({ user_id: 1 }),
    col('workspaces').createIndex({ scope_key: 1 }),
    col('applications').createIndex({ scope_key: 1 }),
    col('submissions').createIndex({ scope_key: 1 }),
    col('notifications').createIndex({ user_id: 1, created_at: -1 }),
    col('threads').createIndex({ participant_uids: 1 }),
    col('threads').createIndex({ 'context.type': 1, 'context.id': 1 }, { unique: true, partialFilterExpression: { 'context.type': { $in: ['application', 'submission'] } } }),
    col('messages').createIndex({ thread_id: 1, created_at: 1 }),
    col('rsvps').createIndex({ resource_id: 1, user_id: 1 }, { unique: true }),
    col('bookings').createIndex({ resource_id: 1, slot: 1 }, { unique: true }),
    col('bookings').createIndex({ resource_id: 1, user_id: 1 }, { unique: true }),
    col('mentorRequests').createIndex({ mentor_uid: 1, status: 1 }),
    col('mentorRequests').createIndex({ founder_uid: 1 }),
    col('stepRatings').createIndex({ user_id: 1, step_id: 1 }, { unique: true }),
  ]);
}

export function out<T extends { _id: string }>(doc: T | null | undefined): (Omit<T, '_id'> & { id: string }) | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

export function outAll<T extends { _id: string }>(docs: T[]): (Omit<T, '_id'> & { id: string })[] {
  return docs.map(d => out(d)!);
}
