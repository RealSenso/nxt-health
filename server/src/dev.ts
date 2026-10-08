import { mkdirSync, readFileSync } from 'node:fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';
import { connect } from './db.js';
import { firebaseVerifier } from './firebase.js';
import { syncStarterContent } from './syncContent.js';
import { roadmapContentSchema } from './roadmapTypes.js';

process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-nxt-health';

mkdirSync('.dev-data', { recursive: true });
const mongo = await MongoMemoryServer.create({ instance: { dbPath: '.dev-data', storageEngine: 'wiredTiger' } });
const { database } = await connect(mongo.getUri());

if (!(await database.col('categories').countDocuments())) {
  // The roadmap checklist is not in the repository; use it for local development when the file is present.
  let roadmap;
  try {
    roadmap = roadmapContentSchema.parse(JSON.parse(readFileSync(new URL('../content/marketplace-roadmap.json', import.meta.url), 'utf8')));
  } catch {
    console.log('No server/content/marketplace-roadmap.json — starting without roadmap steps (import one from the admin console).');
  }
  const result = await syncStarterContent(database, 'local-dev', roadmap);
  console.log(`Loaded starter content into the local database (${result.categories} categories, ${result.steps} roadmap steps).`);
}

const app = createApp({
  database,
  verifyToken: firebaseVerifier({ projectId }),
  allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
});
app.listen(8080, () => {
  console.log('Local API on http://localhost:8080 (MongoDB in-memory, data kept in server/.dev-data)');
  console.log(`Local MongoDB URI (for make-admin): ${mongo.getUri()}`);
});

const shutdown = async () => { await mongo.stop({ doCleanup: false }); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
