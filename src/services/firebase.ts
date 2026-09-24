import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'
  || (import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_API_KEY);

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-nxt-health.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-nxt-health',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
