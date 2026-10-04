import React from 'react';
import { Link } from 'react-router-dom';

type Variant = 'solid' | 'outline' | 'light' | 'outline-light';

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-[var(--nxt-mint-strong)] text-white hover:opacity-85',
  outline: 'border border-[var(--nxt-mint-strong)] text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]',
  light: 'bg-white text-[#111] hover:bg-white/85',
  'outline-light': 'border border-white/70 text-white hover:bg-white/10',
};

interface BtnProps {
  variant?: Variant;
  size?: 'md' | 'sm';
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  full?: boolean;
  className?: string;
  id?: string;
  children: React.ReactNode;
}

/** Pill button / link used across the public pages. */
export const Btn: React.FC<BtnProps> = ({ variant = 'solid', size = 'md', to, href, onClick, type = 'button', disabled, full, className = '', id, children }) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition disabled:opacity-50 disabled:pointer-events-none ${
    size === 'md' ? 'h-12 px-7 text-[15px]' : 'h-10 px-5 text-sm'
  } ${full ? 'w-full' : ''} ${VARIANTS[variant]} ${className}`;
  if (to) return <Link id={id} to={to} className={cls}>{children}</Link>;
  if (href) return <a id={id} href={href} className={cls}>{children}</a>;
  return <button id={id} type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
};

export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-[var(--nxt-ink-soft)] ${className}`}>{children}</p>
);

export const H1: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h1 className={`font-display font-bold text-[clamp(2.5rem,6vw,5.25rem)] leading-[1.03] tracking-[-0.035em] ${className}`}>{children}</h1>
);

export const H2: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <h2 id={id} className={`font-display font-bold text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.1] tracking-[-0.03em] ${className}`}>{children}</h2>
);

/** A numbered column with a heavy top rule, e.g. "01 Find a problem". */
export const Step: React.FC<{ n: string; title: string; children: React.ReactNode; tone?: 'light' | 'dark' }> = ({ n, title, children, tone = 'light' }) => (
  <div className={`border-t-2 pt-4 ${tone === 'dark' ? 'border-white' : 'border-[var(--nxt-ink)]'}`}>
    <p className="text-[13px] text-[var(--nxt-ink-soft)]">{n}</p>
    <h3 className="font-display font-bold text-xl mt-3 tracking-[-0.02em]">{title}</h3>
    <p className="text-[15px] leading-relaxed text-[var(--nxt-ink-soft)] mt-2">{children}</p>
  </div>
);

/** A bordered bullet list with hairline separators. */
export const RuleList: React.FC<{ items: string[]; className?: string }> = ({ items, className = '' }) => (
  <ul className={`border-t border-[var(--nxt-line)] ${className}`}>
    {items.map(item => (
      <li key={item} className="py-3 border-b border-[var(--nxt-line)] text-[15px] leading-snug">{item}</li>
    ))}
  </ul>
);

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm mb-1.5">{label}</span>
    {children}
  </label>
);

export const fieldClass = 'w-full rounded-xl border border-[#111] bg-white text-[#111] px-4 py-3 text-[15px] placeholder:text-[#777] focus:outline-none focus:ring-2 focus:ring-[#111]/30';
export const fieldClassDark = 'w-full rounded-xl border border-white/80 bg-transparent text-white px-4 py-3 text-[15px] placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-[#111]';
