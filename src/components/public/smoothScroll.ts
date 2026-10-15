import { useEffect } from 'react';
import Lenis from 'lenis';

let active: Lenis | null = null;

/** Scrolls to an element, easing through Lenis when it is running and falling back to the browser otherwise. */
export function scrollToId(id: string, block: 'start' | 'center' = 'start') {
  const el = document.getElementById(id);
  if (!el) return;
  if (active) {
    const offset = block === 'center' ? -(window.innerHeight - el.getBoundingClientRect().height) / 2 : -80;
    active.scrollTo(el, { offset, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block });
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
