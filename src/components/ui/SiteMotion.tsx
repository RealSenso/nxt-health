import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

/** Cards, headings and numbers that get movement: everything rounded like a card, plus page headings. */
const CARDS = '[class*="rounded-2xl"], [class*="rounded-3xl"], h1, h2';
const NUMBER = /^\d{1,3}(,\d{3})*(\.\d+)?[%+]?$/;

const skip = (el: HTMLElement) =>
  !!el.closest('[role="dialog"], nav, header, [data-no-motion]') || !!el.style.opacity || !!el.style.transform || el.dataset.nxtMotion === '1';

function countUp(el: HTMLElement) {
  const raw = (el.textContent || '').trim();
  const match = raw.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return;
  const to = parseFloat(match[1].replace(/,/g, ''));
  const decimals = (match[1].split('.')[1] || '').length;
  const commas = match[1].includes(',');
  const t0 = performance.now();
  const run = (now: number) => {
    const p = Math.min(1, (now - t0) / 1100);
    const v = to * (1 - Math.pow(1 - p, 3));
    el.textContent = (commas ? v.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) : v.toFixed(decimals)) + match[2];
    if (p < 1) requestAnimationFrame(run); else el.textContent = raw;
  };
  requestAnimationFrame(run);
}

function fillBars(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[style*="width"]').forEach(bar => {
    const width = bar.style.width;
    if (!width.endsWith('%') || !bar.parentElement?.className.includes('rounded-full') || bar.dataset.nxtBar) return;
    bar.dataset.nxtBar = '1';
    bar.animate([{ width: '0%' }, { width }], { duration: 1000, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 150 });
  });
}

/**
 * Motion for every page: a scroll line along the top, cards that rise into view, numbers that count up,
 * progress bars that fill and clickable cards that lift. Pure presentation: it adds classes and animations
 * to what the pages already render and changes nothing they do.
 */
export const SiteMotion: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.4 });

  useEffect(() => {
    let order = 0;
    const seen = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        seen.unobserve(el);
        el.style.setProperty('--nxt-rv-delay', `${Math.min(order++ % 6, 5) * 70}ms`);
        el.classList.remove('nxt-rv');
        el.classList.add('nxt-in');
        if (el.dataset.nxtNum === '1') countUp(el);
        fillBars(el);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    const prepare = (el: HTMLElement) => {
      if (skip(el)) return;
      el.dataset.nxtMotion = '1';
      if (el.matches('a, button, [role="button"]') || el.style.cursor === 'pointer') el.classList.add('nxt-lift');
      el.classList.add('nxt-rv');
      seen.observe(el);
    };
    const prepareNumber = (el: HTMLElement) => {
      if (el.dataset.nxtNum || el.children.length || !NUMBER.test((el.textContent || '').trim())) return;
      if (!/font-display|text-[2-6]xl/.test(el.className) || el.closest('[role="dialog"]')) return;
      el.dataset.nxtNum = '1';
      seen.observe(el);
    };
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(CARDS).forEach(prepare);
      root.querySelectorAll<HTMLElement>('span, p, div').forEach(prepareNumber);
    };

    scan(document.body);
    let queued = false;
    const watcher = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; order = 0; scan(document.body); });
    });
    watcher.observe(document.body, { childList: true, subtree: true });
    return () => { seen.disconnect(); watcher.disconnect(); };
  }, []);

  return (
    <motion.div aria-hidden="true" style={{ scaleX }} className="fixed top-0 left-0 right-0 z-[70] h-[2px] origin-left bg-[var(--nxt-green)] shadow-[0_0_10px_var(--nxt-green)] pointer-events-none" />
  );
};
