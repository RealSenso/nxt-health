import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import { authenticate, HttpError, type TokenVerifier } from './auth.js';
import type { Database } from './db.js';
import { applicationsRouter, MAX_FILE_BYTES } from './routes/applications.js';
import { bootstrapRouter } from './routes/bootstrap.js';
import { contentRouter } from './routes/content.js';
import { eventsRouter } from './routes/events.js';
import { mentorsRouter } from './routes/mentors.js';
import { scopeRouter } from './routes/scope.js';
import { teamsRouter } from './routes/teams.js';
import { threadsRouter } from './routes/threads.js';
import { usersRouter } from './routes/users.js';

export interface AppOptions {
  database: Database;
  verifyToken: TokenVerifier;
  allowedOrigins: string[];
  rateLimitPerMinute?: number;
}

export function createApp({ database, verifyToken, allowedOrigins, rateLimitPerMinute = 300 }: AppOptions) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxAge: 600,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', rateLimit({ windowMs: 60_000, limit: rateLimitPerMinute, standardHeaders: 'draft-8', legacyHeaders: false }));

  app.get('/api/health', (_req, res) => { res.json({ ok: true }); });

  const api = express.Router();
  api.use(authenticate(verifyToken, database));
  api.use(bootstrapRouter(database));
  api.use(usersRouter(database));
  api.use(teamsRouter(database));
  api.use(scopeRouter(database));
  api.use(applicationsRouter(database));
  api.use(contentRouter(database));
  api.use(threadsRouter(database));
  api.use(eventsRouter(database));
  api.use(mentorsRouter(database));
  app.use('/api', api);

  app.use('/api', (_req, res) => { res.status(404).json({ error: 'Not found.' }); });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? `Each file must be under ${MAX_FILE_BYTES / 1024 / 1024} MB.`
        : err.code === 'LIMIT_FILE_COUNT' ? 'You can attach up to 5 files at a time.' : 'Upload failed.';
      return res.status(413).json({ error: message });
    }
    if (err instanceof SyntaxError) return res.status(400).json({ error: 'Invalid JSON.' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
  });

  return app;
}
