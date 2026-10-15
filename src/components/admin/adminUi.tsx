import React from 'react';

export const inputClass = 'w-full rounded-lg border border-[var(--nxt-line)] bg-[var(--nxt-surface)] px-3 py-2 text-sm text-[var(--nxt-ink)] focus:outline-hidden focus:ring-1 focus:ring-[var(--nxt-ink)]';

export const Card: React.FC<{ title?: string; hint?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, hint, actions, children, className = '' }) => (
  <section className={`rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5 sm:p-7 ${className}`}>
    {(title || actions) && (
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          {title && <h2 className="font-display text-xl font-bold text-[var(--nxt-ink)]">{title}</h2>}
          {hint && <p className="text-sm text-[var(--nxt-ink-soft)] mt-1 max-w-2xl">{hint}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

export const Field: React.FC<{ label: string; hint?: string; className?: string; children: React.ReactNode }> = ({ label, hint, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">{label}</span>
    {children}
    {hint && <span className="block text-xs text-[var(--nxt-ink-soft)] mt-1">{hint}</span>}
  </label>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'outline' | 'ghost' | 'danger' }> = ({ variant = 'outline', className = '', ...props }) => {
  const styles = {
    solid: 'bg-[var(--nxt-ink-fixed)] text-white border-transparent hover:opacity-90',
    outline: 'border-[var(--nxt-ink)] text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]',
    ghost: 'border-transparent text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]',
    danger: 'border-[var(--nxt-peach-deep)] text-[var(--nxt-peach-deep)] hover:bg-[var(--nxt-peach)]',
  }[variant];
  return <button type="button" {...props} className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50 transition-colors ${styles} ${className}`} />;
};

export const Pill: React.FC<{ tone?: 'neutral' | 'good' | 'warn'; children: React.ReactNode }> = ({ tone = 'neutral', children }) => {
  const cls = { neutral: 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]', good: 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]', warn: 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]' }[tone];
  return <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}>{children}</span>;
};

/** A small status line that fades out its own meaning: shows nothing when there is no message. */
export const Notice: React.FC<{ message: { ok: boolean; text: string } | null }> = ({ message }) =>
  message ? <p role="status" className={`text-sm font-semibold ${message.ok ? 'text-[var(--nxt-ink)]' : 'text-[var(--nxt-peach-deep)]'}`}>{message.text}</p> : null;
