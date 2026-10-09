import { createApp } from './app.js';
import { connect } from './db.js';
import { firebaseVerifier } from './firebase.js';
import { loadBundledContent } from './bundledContent.js';
import { removeObsoleteStarterContent } from './syncContent.js';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

const { database } = await connect(required('MONGODB_URI'), process.env.MONGODB_DB || 'nxt_health');
// One-time tidy-up of sample content that older versions loaded; a no-op once it is gone.
const removed = await removeObsoleteStarterContent(database);
if (removed.removed_categories || removed.removed_problems) {
  console.log(`Removed ${removed.removed_categories} old starter categories and ${removed.removed_problems} sample problems.`);
}
const loaded = await loadBundledContent(database);
if (loaded.steps) console.log(`Loaded ${loaded.steps} roadmap steps.`);

const app = createApp({
  database,
  verifyToken: firebaseVerifier({ serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT, projectId: process.env.FIREBASE_PROJECT_ID }),
  allowedOrigins: required('ALLOWED_ORIGINS').split(',').map(o => o.trim()),
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => console.log(`NXT Health API listening on :${port}`));
