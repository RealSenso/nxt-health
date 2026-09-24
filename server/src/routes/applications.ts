import { Router } from 'express';
import multer from 'multer';
import { ObjectId } from 'mongodb';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { canAccessScope, HttpError, requireAdmin, requireMember, requireUser, scopeKeyOf } from '../auth.js';
import type { Database } from '../db.js';
import { out } from '../db.js';
import { adminIds, newId, notify, now, parse } from '../util.js';

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

const applicationSchema = z.object({
  applicant_name: z.string().trim().min(1).max(120),
  applicant_email: z.string().trim().email().max(200),
  startup_name: z.string().trim().min(1).max(120),
  problem_statement_id: z.string().min(1).max(120),
  pitch: z.string().trim().max(5000),
  amount_requested: z.number().min(0).max(1e10),
  supporting_notes: z.string().trim().max(5000),
  status: z.enum(['Draft', 'Pending']),
});

const decisionSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  admin_feedback: z.string().trim().max(2000).optional(),
});

const reviewSchema = z.object({
  status: z.enum(['Submitted', 'Approved', 'Changes Requested']),
  admin_feedback: z.string().trim().max(2000).optional(),
});

export function applicationsRouter(database: Database): Router {
  const r = Router();
  const apps = database.col('applications');
  const submissions = database.col('submissions');
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES } });

  async function problemTitle(problemId: string) {
    const problem = await database.col('problems').findOne({ _id: problemId });
    if (!problem) throw new HttpError(404, 'Problem statement not found.');
    return problem.title as string;
  }

  r.post('/applications', async (req, res) => {
    const user = requireMember(req);
    const body = parse(applicationSchema, req.body);
    const doc = {
      _id: newId('app'),
      ...body,
      user_id: user._id,
      scope_key: scopeKeyOf(user),
      problem_title: await problemTitle(body.problem_statement_id),
      submitted_at: now(),
    };
    await apps.insertOne(doc);
    if (body.status === 'Pending') {
      await notify(database, await adminIds(database), 'application_status', 'New funding application', `${body.startup_name} applied for "${doc.problem_title}".`, '/admin/funding');
    }
    res.status(201).json({ application: out(doc) });
  });

  r.patch('/applications/:id', async (req, res) => {
    const user = requireMember(req);
    const existing = await apps.findOne({ _id: String(req.params.id) });
    if (!existing || !canAccessScope(user, existing.scope_key as string)) throw new HttpError(404, 'Application not found.');
    if (existing.status !== 'Draft') throw new HttpError(400, 'Only drafts can be edited.');
    const body = parse(applicationSchema, req.body);
    await apps.updateOne(
      { _id: existing._id },
      { $set: { ...body, problem_title: await problemTitle(body.problem_statement_id), ...(body.status === 'Pending' ? { submitted_at: now() } : {}) } },
    );
    if (body.status === 'Pending') {
      await notify(database, await adminIds(database), 'application_status', 'New funding application', `${body.startup_name} applied for funding.`, '/admin/funding');
    }
    res.json({ application: out(await apps.findOne({ _id: existing._id })) });
  });

  r.delete('/applications/:id', async (req, res) => {
    const user = requireUser(req);
    const existing = await apps.findOne({ _id: String(req.params.id) });
    if (!existing || !canAccessScope(user, existing.scope_key as string)) throw new HttpError(404, 'Application not found.');
    if (existing.status !== 'Draft' && user.role !== 'admin') throw new HttpError(400, 'Only drafts can be deleted.');
    await apps.deleteOne({ _id: existing._id });
    res.json({ ok: true });
  });

  r.post('/admin/applications/:id/decision', async (req, res) => {
    requireAdmin(req);
    const body = parse(decisionSchema, req.body);
    const app = await apps.findOne({ _id: String(req.params.id) });
    if (!app) throw new HttpError(404, 'Application not found.');
    await apps.updateOne(
      { _id: app._id },
      { $set: { status: body.status, ...(body.admin_feedback !== undefined ? { admin_feedback: body.admin_feedback } : {}), reviewed_at: now() } },
    );
    if (body.status === 'Approved' || body.status === 'Rejected') {
      const feedback = body.admin_feedback ?? (app.admin_feedback as string | undefined);
      await notify(
        database,
        [app.user_id as string],
        'application_status',
        body.status === 'Approved' ? 'Funding application approved 🎉' : 'Funding application update',
        `Your application for "${app.problem_title}" was ${body.status.toLowerCase()}.${feedback ? ` "${feedback}"` : ''}`,
        '/funds',
      );
    }
    res.json({ application: out(await apps.findOne({ _id: app._id })) });
  });

  r.post('/submissions', (req, _res, next) => { requireMember(req); next(); }, upload.array('files', MAX_FILES), async (req, res) => {
    const user = requireMember(req);
    const body = parse(
      z.object({ step_id: z.string().min(1), category_id: z.string().min(1), problem_id: z.string().min(1), note: z.string().max(5000).default('') }),
      req.body,
    );
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    if (!body.note.trim() && files.length === 0) throw new HttpError(400, 'Add a note or attach at least one file.');

    const stored = [];
    for (const file of files) {
      const fileId = new ObjectId();
      await new Promise<void>((resolve, reject) => {
        Readable.from(file.buffer)
          .pipe(database.files.openUploadStreamWithId(fileId, file.originalname, { metadata: { contentType: file.mimetype, uploaded_by: user._id } }))
          .on('finish', () => resolve())
          .on('error', reject);
      });
      stored.push({ file_id: fileId.toHexString(), name: file.originalname, size: file.size, type: file.mimetype });
    }

    const doc = {
      _id: newId('sub'),
      step_id: body.step_id,
      category_id: body.category_id,
      problem_id: body.problem_id,
      note: body.note.trim(),
      files: stored,
      user_id: user._id,
      scope_key: scopeKeyOf(user),
      submitted_by_name: user.name,
      status: 'Submitted',
      submitted_at: now(),
    };
    await submissions.insertOne(doc);
    await notify(database, await adminIds(database), 'submission_review', 'New evidence to review', `${user.name} submitted evidence for a roadmap step.`, '/admin/evidence');
    res.status(201).json({ submission: out(doc) });
  });

  r.get('/files/:fileId', async (req, res) => {
    const user = requireUser(req);
    const fileId = String(req.params.fileId);
    if (!/^[a-f0-9]{24}$/.test(fileId)) throw new HttpError(404, 'File not found.');
    const submission = await submissions.findOne({ 'files.file_id': fileId });
    if (!submission || !canAccessScope(user, submission.scope_key as string)) throw new HttpError(404, 'File not found.');
    const meta = (submission.files as { file_id: string; name: string }[]).find(f => f.file_id === fileId)!;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(meta.name)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    database.files.openDownloadStream(new ObjectId(fileId)).on('error', () => res.status(404).end()).pipe(res);
  });

  r.post('/admin/submissions/:id/review', async (req, res) => {
    requireAdmin(req);
    const body = parse(reviewSchema, req.body);
    const sub = await submissions.findOne({ _id: String(req.params.id) });
    if (!sub) throw new HttpError(404, 'Submission not found.');
    await submissions.updateOne({ _id: sub._id }, { $set: { status: body.status, admin_feedback: body.admin_feedback, reviewed_at: now() } });
    if (body.status !== 'Submitted') {
      await notify(
        database,
        [sub.user_id as string],
        'submission_review',
        body.status === 'Approved' ? 'Evidence approved ✅' : 'Changes requested on your submission',
        `Your submission for a roadmap step was reviewed: ${body.status}.${body.admin_feedback ? ` "${body.admin_feedback}"` : ''}`,
        `/roadmaps/${sub.problem_id}/steps/${sub.step_id}`,
      );
    }
    res.json({ submission: out(await submissions.findOne({ _id: sub._id })) });
  });

  r.delete('/admin/submissions/:id', async (req, res) => {
    requireAdmin(req);
    const sub = await submissions.findOne({ _id: String(req.params.id) });
    if (!sub) throw new HttpError(404, 'Submission not found.');
    for (const f of (sub.files as { file_id: string }[]) || []) {
      await database.files.delete(new ObjectId(f.file_id)).catch(() => undefined);
    }
    await submissions.deleteOne({ _id: sub._id });
    res.json({ ok: true });
  });

  return r;
}
