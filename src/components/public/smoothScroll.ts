import { useEffect } from 'react';
import Lenis from 'lenis';

let active: Lenis | null = null;

/** Scrolls to an element, easing through Lenis when it is running and falling back to the browser otherwise. */
export function scrollToId(id: string, block?: 'start' | 'center') {
  const el = document.getElementById(id);
  if (!el) return;
  const header = 64;
  const height = el.getBoundingClientRect().height;
  const room = window.innerHeight - header;
  // "How it works" always lands in the middle of the screen; anything taller than the screen starts at its top.
  const centre = (block ?? (id === 'how-it-works' ? 'center' : 'start')) === 'center' && height < room;
  // Lenis already honours the element's scroll-margin, so take it out of the offset.
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const offset = (centre ? -(header + (room - height) / 2) : -(header + 16)) + margin;
  if (active) {
    active.scrollTo(el, { offset, duration: 1.2 });
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset - margin, behavior: 'smooth' });
  }
}

/** Inertial smooth scrolling for the public pages. Off for people who ask for reduced motion. */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    active = lenis;
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      if (active === lenis) active = null;
    };
  }, [enabled]);
}
