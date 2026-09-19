import React, { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeChoice, applyTheme, getStoredTheme } from '../services/theme';

const NEXT: Record<ThemeChoice, ThemeChoice> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const ICONS: Record<ThemeChoice, React.ElementType> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const LABELS: Record<ThemeChoice, string> = {
  system: 'Theme: System',
  light: 'Theme: Light',
  dark: 'Theme: Dark',
};

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [theme, setTheme] = useState<ThemeChoice>(getStoredTheme);
  const Icon = ICONS[theme];

  const handleClick = () => {
    const next = NEXT[theme];
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      id="btn-theme-toggle"
      onClick={handleClick}
      title={LABELS[theme]}
      className={`w-9 h-9 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] flex items-center justify-center transition-colors shrink-0 ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};
