'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Site-wide smooth (inertial) scrolling via Lenis — the single biggest "feels
 * expensive" upgrade (reference: ikore, which only used it on one page; we run
 * it across the whole funnel). Disabled entirely for reduced-motion users, who
 * keep native scrolling. Renders nothing.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      // expo-out: fast start, long gentle settle (matches the site's ease-out feel)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let raf = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
