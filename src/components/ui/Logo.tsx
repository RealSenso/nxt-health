import React from 'react';

/** The SirOsler mark: a ring (the "O", a lens) with a guiding star inside it and a small star in orbit. */
export const LogoMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
    <circle cx="16" cy="16" r="12.6" stroke="currentColor" strokeWidth="2.2" />
    <path d="M16 6.6Q16 16 25.4 16Q16 16 16 25.4Q16 16 6.6 16Q16 16 16 6.6Z" fill="var(--nxt-green)" />
    <circle cx="25.6" cy="6.4" r="2" fill="var(--nxt-green)" />
  </svg>
);

/** Mark plus wordmark. Size it with a font-size class; everything scales from that. */
export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex items-center gap-[0.5em] text-[var(--nxt-ink)] text-[1.4rem] leading-none ${className}`}>
    <LogoMark className="h-[1.55em] w-[1.55em] shrink-0" />
    <span className="font-display tracking-[-0.045em]">
      <span className="font-normal">Sir</span>
      <span className="font-bold">Osler</span>
    </span>
  </span>
);
