import { Router } from 'express';
import { z } from 'zod';
import { HttpError, isAdmin, requireVerified, scopeKeyOf, UserDoc } from '../auth.js';
import type { Database } from '../db.js';
import { out, outAll } from '../db.js';
import { adminIds, newId, notify, now, parse } from '../util.js';

export interface ThreadDoc {
  _id: string;
  subject: string;
  context: { type: 'application' | 'submission' | 'mentorship' | 'consultation'; id: string };
  scope_key?: string;
  participant_uids: string[];
  admin_visible: boolean;
  last_message_at: string;
  last_message_preview: string;
  last_read_at: Record<string, string>;
  created_at: string;
}

export function canAccessThread(user: UserDoc, thread: ThreadDoc): boolean {
  if (thread.participant_uids.includes(user._id)) return true;
  if (thread.scope_key && scopeKeyOf(user) === thread.scope_key) return true;
  return thread.admin_visible && isAdmin(user);
}

export function threadQueryFor(user: UserDoc) {
  const clauses: Record<string, unknown>[] = [{ participant_uids: user._id }, { scope_key: scopeKeyOf(user) }];
  if (isAdmin(user)) clauses.push({ admin_visible: true });
  return { $or: clauses };
}

export async function createThread(
  database: Database,
  fields: Omit<ThreadDoc, '_id' | 'last_message_at' | 'last_message_preview' | 'last_read_at' | 'created_at'>,
): Promise<ThreadDoc> {
  const thread: ThreadDoc = {
    _id: newId('thread'),
    ...fields,
    last_message_at: now(),
    last_message_preview: '',
    last_read_at: {},
    created_at: now(),
  };
  await database.col('threads').insertOne(thread as unknown as ThreadDoc & Record<string, unknown>);
  return thread;
}

export function threadsRouter(database: Database): Router {
  const r = Router();
  const threads = database.col('threads');
  const messages = database.col('messages');

  async function loadThread(user: UserDoc, id: string): Promise<ThreadDoc> {
    const thread = (await threads.findOne({ _id: id })) as unknown as ThreadDoc | null;
    if (!thread || !canAccessThread(user, thread)) throw new HttpError(404, 'Conversation not found.');
    return thread;
  }

  r.post('/threads/context', async (req, res) => {
    const user = requireVerified(req);
    const { type, id } = parse(z.object({ type: z.enum(['application', 'submission']), id: z.string().min(1) }), req.body);
    const existing = (await threads.findOne({ 'context.type': type, 'context.id': id })) as unknown as ThreadDoc | null;
    if (existing) {
      if (!canAccessThread(user, existing)) throw new HttpError(404, 'Conversation not found.');
      return res.json({ thread: out(existing) });
    }
    const item = await database.col(type === 'application' ? 'applications' : 'submissions').findOne({ _id: id });
    if (!item || (!isAdmin(user) && scopeKeyOf(user) !== item.scope_key)) throw new HttpError(404, 'Item not found.');
    const subject = type === 'application'
      ? `Funding application — ${item.startup_name}`
      : `Evidence — ${item.submitted_by_name}`;
    try {
      const thread = await createThread(database, {
        subject,
        context: { type, id },
        scope_key: item.scope_key as string,
        participant_uids: [],
        admin_visible: true,
      });
      res.status(201).json({ thread: out(thread) });
    } catch {
      res.json({ thread: out((await threads.findOne({ 'context.type': type, 'context.id': id })) as ThreadDoc) });
    }
  });

  r.get('/threads/:id/messages', async (req, res) => {
    const user = requireVerified(req);
    const thread = await loadThread(user, String(req.params.id));
    const list = await messages.find({ thread_id: thread._id }).sort({ created_at: 1 }).limit(500).toArray();
    await threads.updateOne({ _id: thread._id }, { $set: { [`last_read_at.${user._id}`]: now() } });
    res.json({ thread: out(thread), messages: outAll(list) });
  });

  r.post('/threads/:id/messages', async (req, res) => {
    const user = requireVerified(req);
    const thread = await loadThread(user, String(req.params.id));
    const { body } = parse(z.object({ body: z.string().trim().min(1).max(5000) }), req.body);
    const message = {
      _id: newId('msg'),
      thread_id: thread._id,
      author_uid: user._id,
      author_name: user.name,
      author_is_admin: isAdmin(user),
      body,
      created_at: now(),
    };
    await messages.insertOne(message);
    await threads.updateOne(
      { _id: thread._id },
      { $set: { last_message_at: message.created_at, last_message_preview: body.slice(0, 140), [`last_read_at.${user._id}`]: message.created_at } },
    );

    const recipients = new Set<string>(thread.participant_uids);
    if (thread.scope_key) {
      const scopeMembers = await database.col('users').find(
        { $or: [{ _id: thread.scope_key }, { team_id: thread.scope_key }] },
        { projection: { _id: 1 } },
      ).toArray();
      scopeMembers.forEach(m => recipients.add(m._id));
    }
    if (thread.admin_visible && !isAdmin(user)) (await adminIds(database)).forEach(id => recipients.add(id));
    recipients.delete(user._id);
    await notify(database, [...recipients], 'message', `New message: ${thread.subject}`, `${user.name}: ${body.slice(0, 120)}`, `/messages/${thread._id}`);

    res.status(201).json({ message: out(message) });
  });

  return r;
}
