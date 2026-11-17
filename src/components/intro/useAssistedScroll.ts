import { useEffect, type RefObject } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scrolling (Lenis) plus an "assisted" push inside the intro: when the user
 * lets go mid-intro, the page keeps travelling in the same direction proportional
 * to how hard they scrolled, decelerating until it stops. Not an auto-snap: a soft
 * flick moves a little, a strong one carries you most of the way.
 */
export function useAssistedScroll(section: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1 });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });

    let lastY = window.scrollY;
    let lastT = performance.now();
    let peak = 0; // signed px/ms with the largest magnitude in this gesture
    let pushing = false;
    let idle: number | undefined;

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const v = (y - lastY) / Math.max(1, now - lastT);
      lastY = y;
      lastT = now;
      if (pushing) return;
      if (Math.abs(v) > Math.abs(peak)) peak = v;
      clearTimeout(idle);
      idle = window.setTimeout(release, 140);
    };

    const release = () => {
      const el = section.current;
      const v = peak;
      peak = 0;
      if (!el || Math.abs(v) < 0.25) return;
      const start = el.offsetTop;
      const end = start + el.offsetHeight - window.innerHeight;
      const y = window.scrollY;
      if (y <= start + 2 || y >= end - 2) return;
      const push = Math.sign(v) * Math.min(Math.abs(v) * 380, window.innerHeight);
      const target = Math.min(end, Math.max(start, y + push));
      pushing = true;
      lenis.scrollTo(target, {
        duration: 0.9 + Math.min(1, Math.abs(push) / window.innerHeight) * 0.9,
        easing: (x) => 1 - Math.pow(1 - x, 3), // decelerates like friction
        onComplete: () => (pushing = false),
      });
      // any new input from the user takes over immediately
      const cancel = () => {
        pushing = false;
        window.removeEventListener('wheel', cancel);
        window.removeEventListener('touchstart', cancel);
      };
      window.addEventListener('wheel', cancel, { once: true, passive: true });
      window.addEventListener('touchstart', cancel, { once: true, passive: true });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      lenis.destroy();
    };
  }, [section, enabled]);
}
