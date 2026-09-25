import React from 'react';
import { motion, MotionProps } from 'motion/react';

interface RevealProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'span' | 'li' | 'h1' | 'h2' | 'h3' | 'p';
}
export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  delay = 0,
  y = 6,
  as = 'div',
  ...rest
}) => {
  const Component = motion[as] as any;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(delay, 0.1), ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
};
export const RevealGroup: React.FC<{ children: React.ReactNode; className?: string; stagger?: number }> = ({
  children,
  className,
  stagger = 0.02,
}) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    transition={{ staggerChildren: Math.min(stagger, 0.03) }}
  >
    {children}
  </motion.div>
);
export const RevealItem: React.FC<{ children: React.ReactNode; className?: string; y?: number }> = ({
  children,
  className,
  y = 6,
}) => (
  <motion.div
    className={className}
    variants={{ hidden: { opacity: 0, y }, visible: { opacity: 1, y: 0 } }}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);
export const PillButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'mint' | 'lavender' | 'blue' | 'ghost' }
> = ({ tone = 'mint', className = '', children, ...rest }) => {
  const toneClasses =
    tone === 'mint'
      ? 'bg-[var(--nxt-mint-strong)] text-white hover:bg-[var(--nxt-mint-deep)]'
      : tone === 'lavender'
      ? 'bg-[var(--nxt-lavender-strong)] text-white hover:bg-[var(--nxt-lavender-deep)]'
      : tone === 'blue'
      ? 'bg-[var(--nxt-blue-strong)] text-white hover:bg-[var(--nxt-blue-deep)]'
      : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink)] border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)]';
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors ${toneClasses} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
};