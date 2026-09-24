import { mkdirSync } from 'node:fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';
import { connect } from './db.js';
import { firebaseVerifier } from './firebase.js';
import { STARTER_CATEGORIES, STARTER_PROBLEMS, STARTER_RESOURCES, STARTER_STEPS } from './starterContent.js';

process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-nxt-health';

mkdirSync('.dev-data', { recursive: true });
const mongo = await MongoMemoryServer.create({ instance: { dbPath: '.dev-data', storageEngine: 'wiredTiger' } });
const { database } = await connect(mongo.getUri());

if (!(await database.col('categories').countDocuments())) {
  const toDocs = (items: Record<string, unknown>[]) => items.map(({ id, ...rest }) => ({ _id: id as string, ...rest }));
  await database.col('categories').insertMany(toDocs(STARTER_CATEGORIES));
  await database.col('steps').insertMany(toDocs(STARTER_STEPS));
  await database.col('resources').insertMany(toDocs(STARTER_RESOURCES).map(r => ({ ...r, rsvp_count: 0 })));
  await database.col('problems').insertMany(toDocs(STARTER_PROBLEMS).map(p => ({ ...p, created_at: new Date().toISOString() })));
  console.log('Loaded starter content into the local database.');
}

const app = createApp({
  database,
  verifyToken: firebaseVerifier({ projectId }),
  allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
});
app.listen(8080, () => console.log('Local API on http://localhost:8080 (MongoDB in-memory, data kept in server/.dev-data)'));

const shutdown = async () => { await mongo.stop({ doCleanup: false }); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
