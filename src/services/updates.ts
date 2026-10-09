declare const __BUILD_ID__: string;

const CHECK_EVERY_MS = 60_000;

/** True while the person is typing, so a reload would lose what they have written. */
const busyTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
};

/**
 * Open tabs pick up new versions of the site by themselves. The build writes version.json next to the page;
 * when it names a different build than the one running, the page reloads (waiting until nothing is being typed).
 */
export function watchForNewVersion(): void {
  if (import.meta.env.DEV || typeof __BUILD_ID__ === 'undefined') return;
  let newer = false;

  const check = async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      if (!newer) {
        const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const { build } = await res.json();
        newer = typeof build === 'string' && build !== __BUILD_ID__;
      }
      if (newer && !busyTyping()) window.location.reload();
    } catch { /* offline or blocked: try again at the next check */ }
  };

  setInterval(() => void check(), CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => void check());
  window.addEventListener('focus', () => void check());
}
