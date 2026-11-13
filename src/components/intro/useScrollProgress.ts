import { useEffect, useRef, type RefObject } from 'react';

/** Raw 0..1 progress of how far the user has scrolled through `ref`'s element. */
export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const progress = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? -rect.top / total : 1;
      progress.current = Math.min(1, Math.max(0, p));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);
  return progress;
}
