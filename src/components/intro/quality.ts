export type Quality = 'low' | 'mid' | 'high';

/** Cheap device heuristic; refined at runtime by drei's PerformanceMonitor. */
export function detectQuality(): Quality {
  if (typeof window === 'undefined') return 'mid';
  const forced = new URLSearchParams(window.location.search).get('quality');
  if (forced === 'low' || forced === 'mid' || forced === 'high') return forced;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse && (cores <= 4 || mem <= 3)) return 'low';
  if (coarse || cores <= 4) return 'mid';
  return 'high';
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
