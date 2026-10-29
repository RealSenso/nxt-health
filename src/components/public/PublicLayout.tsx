import React, { useEffect } from 'react';
import { scrollToId, useSmoothScroll } from './smoothScroll';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { store } from '../../services/store';
import { Btn } from './ui';
import { AnnouncementBar } from '../ui/AnnouncementBar';
import { useInAppShell } from '../ui/shellContext';
import { ThemeToggle } from '../ThemeToggle';

export type PublicVariant = 'home' | 'experts' | 'join';

interface NavItem { label: string; to: string }

const NAV: Record<PublicVariant, { items: NavItem[]; cta: NavItem; subBrand?: string }> = {
  home: {
    items: [
      { label: 'Problems', to: '/problems' },
      { label: 'How to?', to: '/start-in-india' },
    ],
    cta: { label: 'Log in / Sign up', to: '/login' },
  },
  experts: {
    subBrand: 'Experts',
    items: [
      { label: 'Find an expert', to: '/experts#find' },
      { label: 'Problems', to: '/problems' },
      { label: 'Become an expert', to: '/experts/join' },
      { label: 'Our mission', to: '/experts#mission' },
    ],
    cta: { label: 'Join free', to: '/signup' },
  },
  join: {
    subBrand: 'Experts',
    items: [
      { label: 'Find an expert', to: '/experts' },
      { label: 'Problems', to: '/problems' },
      { label: 'Why experts join', to: '/experts/join#why' },
      { label: 'What you build', to: '/experts/join#build' },
    ],
    cta: { label: 'Build with us', to: '/experts/join#apply' },
  },
};

/** Scrolls to #anchors on arrival (and back to the top on a plain page change). */
function useAnchorScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    const timer = window.setTimeout(() => scrollToId(hash.slice(1)), 60);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
}

export const PublicLayout: React.FC<{ variant: PublicVariant; children: React.ReactNode }> = ({ variant, children }) => {
  useAnchorScroll();
  const location = useLocation();
  const inApp = useInAppShell();
  useSmoothScroll(!inApp);
  // Inside the signed-in app the app's own navigation is already on screen.
  if (inApp) return <>{children}</>;
  const nav = NAV[variant];
  const signedIn = store.isAuthenticated();
  // Expert pages are for members, so everyone else only sees the way to apply as an expert.
  const isMember = signedIn && store.getCurrentUser().is_member;
  const visible = (item: NavItem) => isMember || !/^\/experts(#.*)?$|^\/experts\/(?!join)/.test(item.to);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--nxt-bg)] text-[var(--nxt-ink)]">
      <AnnouncementBar />
      <header className="nxt-bar-dark sticky top-0 z-40 bg-[var(--nxt-bg)] border-b border-[var(--nxt-line)]">
        <div className="nxt-container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-4 shrink-0" aria-label="SirOsler home">
            <Logo />
            {nav.subBrand && (
              <span className="hidden sm:flex items-center gap-4 text-[15px] text-[var(--nxt-ink-soft)]">
                <span className="h-5 w-px bg-[var(--nxt-line)]" />
                {nav.subBrand}
              </span>
            )}
          </Link>
          <nav className="flex items-center gap-5 lg:gap-8">
            {nav.items.filter(visible).map(item => (
              <Link
                key={item.label}
                to={item.to}
                className="hidden md:inline text-[15px] text-white/90 hover:text-white"
                onClick={(e) => {
                  // Already on this page: the URL would not change, so scroll to the section ourselves, every time.
                  const [path, hash] = item.to.split('#');
                  if (hash && (path === '' || path === location.pathname) && document.getElementById(hash)) {
                    e.preventDefault();
                    scrollToId(hash);
                  }
                }}
              >{item.label}</Link>
            ))}
            <ThemeToggle />
            {signedIn ? (
              <Btn variant="light" size="sm" to="/problems">Open app</Btn>
            ) : (
              <Btn variant="light" size="sm" to={nav.cta.to}>{nav.cta.label}</Btn>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--nxt-line)]">
        <div className="nxt-container py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[15px] text-[var(--nxt-ink-soft)]">
          <p>SirOsler · nxthealth.ai · India</p>
        </div>
      </footer>
    </div>
  );
};
