import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scrolling (Lenis) for the whole page. The page only moves as far as the visitor
 * scrolls; the intro takes over (and locks) only once the camera has reached the screen.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, touchMultiplier: 1 });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [enabled]);
}
