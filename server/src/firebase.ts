import { cert, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { TokenVerifier } from './auth.js';

/**
 * Production: pass the service-account JSON (FIREBASE_SERVICE_ACCOUNT).
 * Local dev: set FIREBASE_AUTH_EMULATOR_HOST and a project id; the Admin SDK then trusts emulator tokens.
 */
export function firebaseVerifier(options: { serviceAccountJson?: string; projectId?: string }): TokenVerifier {
  let app: App;
  if (options.serviceAccountJson) {
    app = initializeApp({ credential: cert(JSON.parse(options.serviceAccountJson)) });
  } else if (process.env.FIREBASE_AUTH_EMULATOR_HOST && options.projectId) {
    app = initializeApp({ projectId: options.projectId });
  } else {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT (production) or FIREBASE_AUTH_EMULATOR_HOST + FIREBASE_PROJECT_ID (local).');
  }
  const auth = getAuth(app);
  return async (token) => {
    const decoded = await auth.verifyIdToken(token, true);
    return { uid: decoded.uid, email: (decoded.email || '').toLowerCase(), email_verified: !!decoded.email_verified };
  };
}
