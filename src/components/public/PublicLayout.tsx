import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/nxt-health-logo.png';
import { store } from '../../services/store';
import { Btn } from './ui';

export type PublicVariant = 'home' | 'experts' | 'join';

interface NavItem { label: string; to: string }

const NAV: Record<PublicVariant, { items: NavItem[]; cta: NavItem; subBrand?: string }> = {
  home: {
    items: [
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Problem statements', to: '/problems' },
      { label: "Who it's for", to: '/#who-its-for' },
      { label: 'Pricing', to: '/#pricing' },
      { label: 'Find an expert', to: '/experts' },
    ],
    cta: { label: 'Seed a problem', to: '/#start' },
  },
  experts: {
    subBrand: 'Experts',
    items: [
      { label: 'Find an expert', to: '/experts#find' },
      { label: 'Problem statements', to: '/problems' },
      { label: 'Become an expert', to: '/experts/join' },
      { label: 'Our mission', to: '/experts#mission' },
    ],
    cta: { label: 'Join free', to: '/signup' },
  },
  join: {
    subBrand: 'Experts',
    items: [
      { label: 'Find an expert', to: '/experts' },
      { label: 'Problem statements', to: '/problems' },
      { label: 'Why experts join', to: '/experts/join#why' },
      { label: 'What you build', to: '/experts/join#build' },
    ],
    cta: { label: 'Build with us', to: '/experts/join#apply' },
  },
};

const FOOTER_LINKS: Record<PublicVariant, NavItem[]> = {
  home: [
    { label: 'How it works', to: '/#how-it-works' },
    { label: "Who it's for", to: '/#who-its-for' },
    { label: 'Pricing', to: '/#pricing' },
    { label: 'Problem statements', to: '/problems' },
    { label: 'Find an expert', to: '/experts' },
    { label: 'Become an expert', to: '/experts/join' },
  ],
  experts: [
    { label: 'Find an expert', to: '/experts#find' },
    { label: 'Problem statements', to: '/problems' },
    { label: 'Become an expert', to: '/experts/join' },
    { label: 'Back to NXT Health', to: '/' },
  ],
  join: [
    { label: 'Find an expert', to: '/experts' },
    { label: 'Become an expert', to: '/experts/join' },
    { label: 'Back to NXT Health', to: '/' },
  ],
};

/** Scrolls to #anchors on arrival (and back to the top on a plain page change). */
function useAnchorScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
}

export const PublicLayout: React.FC<{ variant: PublicVariant; children: React.ReactNode }> = ({ variant, children }) => {
  useAnchorScroll();
  const nav = NAV[variant];
  const signedIn = store.isAuthenticated();
  // Expert pages are for members, so everyone else only sees the way to apply as an expert.
  const isMember = signedIn && store.getCurrentUser().is_member;
  const visible = (item: NavItem) => isMember || !/^\/experts(#.*)?$|^\/experts\/(?!join)/.test(item.to);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--nxt-bg)] text-[var(--nxt-ink)]">
      <header className="nxt-bar-dark sticky top-0 z-40 bg-[var(--nxt-bg)] border-b border-[var(--nxt-line)]">
        <div className="nxt-container flex h-[72px] items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-4 shrink-0" aria-label="NXT Health home">
            <img src={logo} alt="NXT Health" className="h-10 w-auto" />
            {nav.subBrand && (
              <span className="hidden sm:flex items-center gap-4 text-[15px] text-[var(--nxt-ink-soft)]">
                <span className="h-5 w-px bg-[var(--nxt-line)]" />
                {nav.subBrand}
              </span>
            )}
          </Link>
          <nav className="flex items-center gap-5 lg:gap-8">
            {nav.items.filter(visible).map(item => (
              <Link key={item.label} to={item.to} className="hidden md:inline text-[15px] text-white/90 hover:text-white">{item.label}</Link>
            ))}
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
          <p>NXT Health · nxthealth.ai · India</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS[variant].filter(visible).map(item => (
              <Link key={item.label} to={item.to} className="underline underline-offset-2 hover:text-[var(--nxt-ink)]">{item.label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};
