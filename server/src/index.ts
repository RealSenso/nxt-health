import { createApp } from './app.js';
import { connect } from './db.js';
import { firebaseVerifier } from './firebase.js';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

const { database } = await connect(required('MONGODB_URI'), process.env.MONGODB_DB || 'nxt_health');
const app = createApp({
  database,
  verifyToken: firebaseVerifier({ serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT, projectId: process.env.FIREBASE_PROJECT_ID }),
  allowedOrigins: required('ALLOWED_ORIGINS').split(',').map(o => o.trim()),
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => console.log(`NxT Health API listening on :${port}`));
