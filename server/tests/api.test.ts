import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { ensureIndexes, wrapDb, type Database } from '../src/db.js';

// Test tokens look like "uid|email|verified" so each test can act as any user.
const token = (uid: string, verified = true) => `Bearer ${uid}|${uid}@test.dev|${verified ? '1' : '0'}`;

let mongo: MongoMemoryReplSet;
let client: MongoClient;
let database: Database;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  client = await MongoClient.connect(mongo.getUri());
  database = wrapDb(client.db('test'));
  app = createApp({
    database,
    allowedOrigins: [],
    rateLimitPerMinute: 100_000,
    verifyToken: async (raw) => {
      const [uid, email, verified] = raw.split('|');
      return { uid, email, email_verified: verified === '1' };
    },
  });
}, 120_000);

afterAll(async () => {
  await client?.close();
  await mongo?.stop();
});

beforeEach(async () => {
  await database.db.dropDatabase();
  await ensureIndexes(database);
  await database.col('categories').insertOne({ _id: 'cat-1', name: 'Device', description: '', order: 1 });
  await database.col('steps').insertMany([1, 2, 3, 4].map(n => ({ _id: `step-${n}`, category_id: 'cat-1', name: `Step ${n}`, description: `Secret ${n}`, order: n })));
  await database.col('problems').insertOne({ _id: 'prob-1', title: 'Sepsis', description: '', department: 'ICU', funded: true });
  await database.col('resources').insertMany([
    ...Array.from({ length: 8 }, (_, i) => ({ _id: `res-${i}`, step_id: 'step-1', type: 'hospital_connection', title: `R${i}`, description: `Private ${i}` })),
    { _id: 'res-webinar', step_id: 'step-1', type: 'webinar', title: 'Webinar', description: '', capacity: 1, rsvp_count: 0 },
    { _id: 'res-session', step_id: 'step-1', type: 'session', title: '1:1', description: '', slots: ['2099-01-01T10:00:00.000Z', '2099-01-01T11:00:00.000Z'] },
  ]);
});

async function signup(uid: string, extra: Record<string, unknown> = {}) {
  await request(app).post('/api/users/me').set('Authorization', token(uid)).send({ name: uid }).expect(201);
  if (Object.keys(extra).length) await database.col('users').updateOne({ _id: uid }, { $set: extra });
}
const member = (uid: string) => signup(uid, { membership_status: 'active' });
const admin = (uid: string) => signup(uid, { role: 'admin', membership_status: 'active' });

describe('accounts and roles', () => {
  it('ignores attempts to self-promote to admin, member or mentor', async () => {
    await signup('eve');
    const res = await request(app).patch('/api/users/me').set('Authorization', token('eve')).send({ role: 'admin' });
    expect(res.status).toBe(400);
    for (const field of ['membership_status', 'is_mentor', 'team_id']) {
      const r = await request(app).patch('/api/users/me').set('Authorization', token('eve')).send({ [field]: 'x' });
      expect(r.status).toBe(400);
    }
    const eve = await database.col('users').findOne({ _id: 'eve' });
    expect(eve).toMatchObject({ role: 'member', membership_status: 'none', is_mentor: false });
  });

  it('blocks admin routes for non-admins', async () => {
    await member('bob');
    await request(app).post('/api/admin/problems').set('Authorization', token('bob')).send({ title: 'x', description: '', department: 'y', funded: false }).expect(403);
    await request(app).patch('/api/admin/users/bob').set('Authorization', token('bob')).send({ membership_status: 'active' }).expect(403);
  });

  it('requires a verified email to request membership', async () => {
    await request(app).post('/api/users/me').set('Authorization', token('una', false)).send({ name: 'Una' }).expect(201);
    await request(app).post('/api/users/me/membership-request').set('Authorization', token('una', false)).expect(403);
    await request(app).post('/api/users/me/membership-request').set('Authorization', token('una')).expect(200);
    await admin('boss');
    await request(app).patch('/api/admin/users/una').set('Authorization', token('boss')).send({ membership_status: 'active' }).expect(200);
    expect((await database.col('users').findOne({ _id: 'una' }))?.membership_status).toBe('active');
  });

  it('keeps member-only content out of the guest bootstrap', async () => {
    const guest = await request(app).get('/api/bootstrap').expect(200);
    const steps = guest.body.content.steps;
    expect(steps.find((s: { id: string }) => s.id === 'step-4').description).toBe('');
    expect(steps.find((s: { id: string }) => s.id === 'step-1').description).toBe('Secret 1');
    expect(guest.body.content.resources.filter((r: { locked?: boolean }) => r.locked).length).toBeGreaterThan(0);
    await member('mia');
    const full = await request(app).get('/api/bootstrap').set('Authorization', token('mia')).expect(200);
    expect(full.body.content.resources.every((r: { locked?: boolean }) => !r.locked)).toBe(true);
  });
});

describe('scope isolation', () => {
  it("doesn't leak another founder's roadmap, applications or files", async () => {
    await member('alice');
    await member('bob');
    await request(app).put('/api/scope/working-problems/prob-1').set('Authorization', token('alice')).expect(200);
    await request(app).post('/api/applications').set('Authorization', token('alice')).send({
      applicant_name: 'A', applicant_email: 'a@test.dev', startup_name: 'Acme', problem_statement_id: 'prob-1',
      pitch: 'p', amount_requested: 10, supporting_notes: '', status: 'Pending',
    }).expect(201);
    const upload = await request(app).post('/api/submissions').set('Authorization', token('alice'))
      .field('step_id', 'step-1').field('category_id', 'cat-1').field('problem_id', 'prob-1').field('note', 'n')
      .attach('files', Buffer.from('secret-bytes'), 'irb.pdf').expect(201);
    const fileId = upload.body.submission.files[0].file_id;

    const bob = await request(app).get('/api/bootstrap').set('Authorization', token('bob')).expect(200);
    expect(bob.body.applications).toHaveLength(0);
    expect(bob.body.submissions).toHaveLength(0);
    expect(bob.body.scope.working_problem_ids).toHaveLength(0);
    await request(app).get(`/api/files/${fileId}`).set('Authorization', token('bob')).expect(404);

    const own = await request(app).get(`/api/files/${fileId}`).set('Authorization', token('alice')).buffer(true).expect(200);
    expect(Buffer.from(own.body).toString()).toBe('secret-bytes');
  });

  it("stops founders from deciding their own application", async () => {
    await member('alice');
    const created = await request(app).post('/api/applications').set('Authorization', token('alice')).send({
      applicant_name: 'A', applicant_email: 'a@test.dev', startup_name: 'Acme', problem_statement_id: 'prob-1',
      pitch: 'p', amount_requested: 10, supporting_notes: '', status: 'Pending',
    }).expect(201);
    await request(app).post(`/api/admin/applications/${created.body.application.id}/decision`).set('Authorization', token('alice')).send({ status: 'Approved' }).expect(403);
  });

  it('shares data only after an invite is accepted', async () => {
    await member('alice');
    await member('bob');
    await request(app).put('/api/scope/working-problems/prob-1').set('Authorization', token('alice')).expect(200);
    const invite = await request(app).post('/api/teams/invites').set('Authorization', token('alice')).send({ email: 'bob@test.dev' }).expect(201);
    const before = await request(app).get('/api/bootstrap').set('Authorization', token('bob'));
    expect(before.body.scope.working_problem_ids).toHaveLength(0);
    expect(before.body.invites.incoming).toHaveLength(1);
    await member('carol');
    await request(app).post(`/api/teams/invites/${invite.body.invite.id}/accept`).set('Authorization', token('carol')).expect(404);
    await request(app).post(`/api/teams/invites/${invite.body.invite.id}/accept`).set('Authorization', token('bob')).expect(200);
    const after = await request(app).get('/api/bootstrap').set('Authorization', token('bob'));
    expect(after.body.scope.working_problem_ids).toEqual(['prob-1']);
  });

  it('keeps comment threads private to the scope and admins', async () => {
    await member('alice');
    await member('bob');
    await admin('boss');
    const app1 = await request(app).post('/api/applications').set('Authorization', token('alice')).send({
      applicant_name: 'A', applicant_email: 'a@test.dev', startup_name: 'Acme', problem_statement_id: 'prob-1',
      pitch: 'p', amount_requested: 10, supporting_notes: '', status: 'Pending',
    });
    await request(app).post('/api/threads/context').set('Authorization', token('bob')).send({ type: 'application', id: app1.body.application.id }).expect(404);
    const thread = await request(app).post('/api/threads/context').set('Authorization', token('alice')).send({ type: 'application', id: app1.body.application.id }).expect(201);
    await request(app).post(`/api/threads/${thread.body.thread.id}/messages`).set('Authorization', token('boss')).send({ body: 'Can you share the budget?' }).expect(201);
    await request(app).get(`/api/threads/${thread.body.thread.id}/messages`).set('Authorization', token('bob')).expect(404);
    const read = await request(app).get(`/api/threads/${thread.body.thread.id}/messages`).set('Authorization', token('alice')).expect(200);
    expect(read.body.messages[0].body).toBe('Can you share the budget?');
  });
});

describe('events', () => {
  it('enforces RSVP capacity under concurrent requests', async () => {
    await Promise.all(['u1', 'u2', 'u3', 'u4'].map(member));
    const results = await Promise.all(['u1', 'u2', 'u3', 'u4'].map(u =>
      request(app).post('/api/events/res-webinar/rsvp').set('Authorization', token(u))));
    expect(results.filter(r => r.status === 201)).toHaveLength(1);
    expect(await database.col('rsvps').countDocuments()).toBe(1);
    expect((await database.col('resources').findOne({ _id: 'res-webinar' }))?.rsvp_count).toBe(1);
  });

  it('never double-books a slot', async () => {
    await member('a');
    await member('b');
    const slot = '2099-01-01T10:00:00.000Z';
    const [r1, r2] = await Promise.all([
      request(app).post('/api/events/res-session/bookings').set('Authorization', token('a')).send({ slot }),
      request(app).post('/api/events/res-session/bookings').set('Authorization', token('b')).send({ slot }),
    ]);
    expect([r1.status, r2.status].sort()).toEqual([201, 409]);
    await request(app).post('/api/events/res-session/bookings').set('Authorization', token('a')).send({ slot: '2099-05-05T10:00:00.000Z' }).expect(400);
  });
});

describe('uploads and profiles', () => {
  it('rejects files over 10 MB', async () => {
    await member('alice');
    const res = await request(app).post('/api/submissions').set('Authorization', token('alice'))
      .field('step_id', 'step-1').field('category_id', 'cat-1').field('problem_id', 'prob-1')
      .attach('files', Buffer.alloc(10 * 1024 * 1024 + 1), 'big.bin');
    expect(res.status).toBe(413);
  });

  it('hides private profiles from logged-out visitors', async () => {
    await member('alice');
    await request(app).put('/api/users/me/public-profile').set('Authorization', token('alice')).send({ is_public: false, headline: 'Hi' }).expect(200);
    await request(app).get('/api/public/founders/alice').expect(404);
    await request(app).put('/api/users/me/public-profile').set('Authorization', token('alice')).send({ is_public: true, headline: 'Hi', show_location: false }).expect(200);
    const pub = await request(app).get('/api/public/founders/alice').expect(200);
    expect(pub.body.profile).toMatchObject({ headline: 'Hi', location: '' });
  });

  it('lets only mentors accept mentorship requests addressed to them', async () => {
    await admin('boss');
    await member('mentor');
    await member('founder');
    await member('other');
    await request(app).patch('/api/admin/users/mentor').set('Authorization', token('boss')).send({ is_mentor: true }).expect(200);
    await request(app).put('/api/mentor/profile').set('Authorization', token('mentor')).send({
      headline: 'Regulatory', bio: '', expertise_stages: ['Regulatory'], category_ids: ['cat-1'], availability: 'Weekly', capacity: 2, accepting: true,
    }).expect(200);
    await request(app).put('/api/mentor/profile').set('Authorization', token('other')).send({
      headline: '', bio: '', expertise_stages: [], category_ids: [], availability: '', capacity: 1, accepting: true,
    }).expect(403);
    const req1 = await request(app).post('/api/mentor-requests').set('Authorization', token('founder')).send({ mentor_uid: 'mentor', message: 'Help with 510(k)?' }).expect(201);
    await request(app).post(`/api/mentor-requests/${req1.body.request.id}/respond`).set('Authorization', token('other')).send({ accept: true }).expect(404);
    const accepted = await request(app).post(`/api/mentor-requests/${req1.body.request.id}/respond`).set('Authorization', token('mentor')).send({ accept: true }).expect(200);
    await request(app).get(`/api/threads/${accepted.body.request.thread_id}/messages`).set('Authorization', token('founder')).expect(200);
    await request(app).get(`/api/threads/${accepted.body.request.thread_id}/messages`).set('Authorization', token('boss')).expect(404);
  });

  describe('expert sessions', () => {
    const profile = (extra: Record<string, unknown> = {}) => ({
      headline: 'Regulatory lead', bio: 'CDSCO, FDA and CE.', expertise_stages: ['Regulatory'], category_ids: ['cat-1'],
      availability: 'Weekdays', capacity: 3, accepting: true, rate_usd: 200, expert_areas: ['Regulatory'],
      session_days: [0, 1, 2, 3, 4, 5, 6], session_times: ['10:00', '15:00'], meeting_url: 'https://meet.example.com/abc', ...extra,
    });

    async function setupExpert(uid = 'mentor', extra: Record<string, unknown> = {}) {
      await request(app).patch(`/api/admin/users/${uid}`).set('Authorization', token('boss')).send({ is_mentor: true }).expect(200);
      await request(app).put('/api/mentor/profile').set('Authorization', token(uid)).send(profile(extra)).expect(200);
    }

    const firstSlot = async (uid = 'mentor') => (await request(app).get(`/api/public/experts/${uid}`).expect(200)).body.slots[0] as string;

    it('lists experts publicly without leaking the private call link, and only while they take bookings', async () => {
      await admin('boss');
      await member('mentor');
      await setupExpert();
      const list = await request(app).get('/api/public/experts').expect(200);
      expect(list.body.experts).toHaveLength(1);
      expect(list.body.experts[0]).toMatchObject({ id: 'mentor', rate_usd: 200, open_slots: expect.any(Number) });
      expect(JSON.stringify(list.body)).not.toContain('meet.example.com');
      const detail = await request(app).get('/api/public/experts/mentor').expect(200);
      expect(detail.body.slots.length).toBeGreaterThan(0);
      expect(JSON.stringify(detail.body)).not.toContain('meet.example.com');

      // Members see mentor data in their bootstrap, but never another mentor's call link.
      await member('other');
      const other = await request(app).get('/api/bootstrap').set('Authorization', token('other')).expect(200);
      expect(JSON.stringify(other.body.mentors)).not.toContain('meet.example.com');
      const own = await request(app).get('/api/bootstrap').set('Authorization', token('mentor')).expect(200);
      expect(JSON.stringify(own.body.mentors)).toContain('meet.example.com');

      await request(app).put('/api/mentor/profile').set('Authorization', token('mentor')).send(profile({ accepting: false })).expect(200);
      expect((await request(app).get('/api/public/experts').expect(200)).body.experts).toHaveLength(0);
      await request(app).get('/api/public/experts/mentor').expect(404);
    });

    it('rejects unsafe links and out-of-range rates on an expert profile', async () => {
      await admin('boss');
      await member('mentor');
      await request(app).patch('/api/admin/users/mentor').set('Authorization', token('boss')).send({ is_mentor: true }).expect(200);
      await request(app).put('/api/mentor/profile').set('Authorization', token('mentor')).send(profile({ meeting_url: 'javascript:alert(1)' })).expect(400);
      await request(app).put('/api/mentor/profile').set('Authorization', token('mentor')).send(profile({ photo_url: 'http://insecure.example.com/a.jpg' })).expect(400);
      await request(app).put('/api/mentor/profile').set('Authorization', token('mentor')).send(profile({ rate_usd: 900 })).expect(400);
      await request(app).put('/api/mentor/profile').set('Authorization', token('mentor')).send(profile({ session_times: ['25:99'] })).expect(400);
    });

    it('opens the chat only after the founder pays, at a price set by the expert', async () => {
      await admin('boss');
      await member('mentor');
      await signup('founder'); // a free, verified account is enough to book
      await member('other');
      await setupExpert();
      const slot = await firstSlot();

      await request(app).post('/api/consultations').set('Authorization', token('founder', false)).send({ mentor_uid: 'mentor', minutes: 30, slot }).expect(403);
      await request(app).post('/api/consultations').set('Authorization', token('mentor')).send({ mentor_uid: 'mentor', minutes: 30, slot }).expect(400);
      await request(app).post('/api/consultations').set('Authorization', token('founder')).send({ mentor_uid: 'mentor', minutes: 45, slot }).expect(400);
      await request(app).post('/api/consultations').set('Authorization', token('founder')).send({ mentor_uid: 'mentor', minutes: 30, slot: '2020-01-01T10:00:00.000Z' }).expect(409);

      const booked = await request(app).post('/api/consultations').set('Authorization', token('founder'))
        .send({ mentor_uid: 'mentor', minutes: 30, slot, amount_usd: 1, status: 'paid' }).expect(201);
      expect(booked.body.consultation).toMatchObject({ status: 'awaiting_payment', amount_usd: 100, expert_share_usd: 80, minutes: 30 });
      expect(booked.body.consultation.thread_id).toBeUndefined();
      expect(booked.body.consultation.meeting_url).toBeUndefined();
      const id = booked.body.consultation.id;

      await request(app).post(`/api/consultations/${id}/pay`).set('Authorization', token('other')).expect(404);
      const paid = await request(app).post(`/api/consultations/${id}/pay`).set('Authorization', token('founder')).expect(200);
      expect(paid.body.consultation).toMatchObject({ status: 'paid', meeting_url: 'https://meet.example.com/abc' });
      const threadId = paid.body.consultation.thread_id;
      await request(app).get(`/api/threads/${threadId}/messages`).set('Authorization', token('mentor')).expect(200);
      await request(app).get(`/api/threads/${threadId}/messages`).set('Authorization', token('other')).expect(404);

      const again = await request(app).post(`/api/consultations/${id}/pay`).set('Authorization', token('founder')).expect(200);
      expect(again.body.consultation.thread_id).toBe(threadId);
      await request(app).post(`/api/consultations/${id}/cancel`).set('Authorization', token('founder')).expect(400);
      const mentorView = await request(app).get('/api/bootstrap').set('Authorization', token('mentor')).expect(200);
      expect(mentorView.body.consultations).toHaveLength(1);
    });

    it('never double-books a time, and a cancelled booking frees it', async () => {
      await admin('boss');
      await member('mentor');
      await signup('a');
      await signup('b');
      await setupExpert();
      const slot = await firstSlot();
      const first = await request(app).post('/api/consultations').set('Authorization', token('a')).send({ mentor_uid: 'mentor', minutes: 60, slot }).expect(201);
      expect((await request(app).get('/api/public/experts/mentor').expect(200)).body.slots).not.toContain(slot);
      await request(app).post('/api/consultations').set('Authorization', token('b')).send({ mentor_uid: 'mentor', minutes: 30, slot }).expect(409);
      await request(app).post(`/api/consultations/${first.body.consultation.id}/cancel`).set('Authorization', token('a')).expect(200);
      await request(app).post('/api/consultations').set('Authorization', token('b')).send({ mentor_uid: 'mentor', minutes: 30, slot }).expect(201);
    });

    it('confirms free sessions straight away', async () => {
      await admin('boss');
      await member('mentor');
      await signup('founder');
      await setupExpert('mentor', { rate_usd: 0 });
      const slot = await firstSlot();
      const booked = await request(app).post('/api/consultations').set('Authorization', token('founder')).send({ mentor_uid: 'mentor', minutes: 60, slot }).expect(201);
      expect(booked.body.consultation).toMatchObject({ status: 'paid', amount_usd: 0 });
      await request(app).get(`/api/threads/${booked.body.consultation.thread_id}/messages`).set('Authorization', token('mentor')).expect(200);
    });
  });

  describe('enquiries', () => {
    it('accepts public enquiries, ignores bots, and shows them only to admins', async () => {
      await admin('boss');
      await member('someone');
      await request(app).post('/api/public/inquiries').send({ kind: 'lead', role: 'Pharma company with a problem to fund', email: 'Buyer@Pharma.com', message: 'Sepsis alerts in the ICU' }).expect(201);
      await request(app).post('/api/public/inquiries').send({ kind: 'lead', email: 'not-an-email', message: 'x' }).expect(400);
      await request(app).post('/api/public/inquiries').send({ kind: 'lead', email: 'bot@spam.com', message: 'buy now', website: 'http://spam' }).expect(400);
      await request(app).post('/api/public/inquiries').send({ kind: 'expert', email: 'e@x.com', message: 'FDA lead' }).expect(400);
      await request(app).post('/api/public/inquiries').send({ kind: 'expert', name: 'Dr E', email: 'e@x.com', focus: 'Regulatory', message: 'FDA lead' }).expect(201);

      await request(app).get('/api/admin/inquiries').expect(401);
      await request(app).get('/api/admin/inquiries').set('Authorization', token('someone')).expect(403);
      const list = await request(app).get('/api/admin/inquiries').set('Authorization', token('boss')).expect(200);
      expect(list.body.inquiries).toHaveLength(2);
      expect(list.body.inquiries.map((i: { email: string }) => i.email)).toContain('buyer@pharma.com');
      const done = await request(app).patch(`/api/admin/inquiries/${list.body.inquiries[0].id}`).set('Authorization', token('boss')).send({ status: 'handled' }).expect(200);
      expect(done.body.inquiry.status).toBe('handled');
      const note = await request(app).get('/api/bootstrap').set('Authorization', token('boss')).expect(200);
      expect(note.body.notifications.some((n: { type: string }) => n.type === 'inquiry')).toBe(true);
    });
  });
});
