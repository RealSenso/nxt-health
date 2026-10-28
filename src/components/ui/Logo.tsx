import React from 'react';

/** Text-only logo until the real mark is supplied. Size it with a font-size class. */
export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`font-display font-normal tracking-[-0.045em] leading-none text-[var(--nxt-ink)] text-[1.5rem] ${className}`}>
    SirOsler
  </span>
);
