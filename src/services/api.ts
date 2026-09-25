import { auth } from './firebase';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function headers(json: boolean, forceRefresh = false): Promise<HeadersInit> {
  const token = await auth.currentUser?.getIdToken(forceRefresh);
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * A sign-in token remembers whether the email was verified when it was issued, so after the user
 * clicks the link (often in another tab) the server still sees "unverified". When that happens,
 * reload the account and retry once with a fresh token.
 */
async function tokenWasStale(status: number, error: string | undefined): Promise<boolean> {
  const user = auth.currentUser;
  if (status !== 403 || !user || !/verify your email/i.test(error || '')) return false;
  await user.reload();
  return user.emailVerified;
}

async function send<T>(method: string, path: string, body?: unknown, retried = false): Promise<T> {
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: await headers(!isForm && body !== undefined, retried),
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (!retried && await tokenWasStale(res.status, data.error)) return send<T>(method, path, body, true);
    throw new ApiError(res.status, data.error || `Request failed (${res.status}).`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  get: <T>(path: string) => send<T>('GET', path),
  post: <T>(path: string, body?: unknown) => send<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => send<T>('PUT', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => send<T>('PATCH', path, body ?? {}),
  delete: <T>(path: string) => send<T>('DELETE', path),

  async download(path: string, filename: string): Promise<void> {
    const res = await fetch(`${API_URL}/api${path}`, { headers: await headers(false) });
    if (!res.ok) throw new ApiError(res.status, "Couldn't download that file.");
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
