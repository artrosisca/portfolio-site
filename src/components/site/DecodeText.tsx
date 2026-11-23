import { useEffect, useMemo, useState } from 'react';

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789<>/\\_{}[]#$%&*+=';
const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Text that "decodes" like a terminal: each letter cycles through random glyphs and locks in,
 * roughly left to right. Every character keeps the width of its final glyph, so lines never
 * re-wrap while it runs.
 */
export function DecodeText({ text, start, duration = 1.2, delay = 0 }: { text: string; start: boolean; duration?: number; delay?: number }) {
  const words = useMemo(() => text.split(' '), [text]);
  const total = text.replace(/ /g, '').length;
  // when each letter locks in, in seconds after start
  const lockAt = useMemo(() => Array.from({ length: total }, (_, i) => delay + (i / total) * duration * 0.7 + Math.random() * duration * 0.3), [total, duration, delay]);
  const [t, setT] = useState(-1); // -1 = not started (all scrambled), Infinity = done
  const [, tick] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(Infinity);
      return;
    }
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const s = (now - t0) / 1000;
      if (now - last > 45) {
        // ~22 fps is plenty for glyph cycling and keeps React work low
        last = now;
        setT(s);
        tick((n) => n + 1);
      }
      if (s < delay + duration + 0.1) raf = requestAnimationFrame(loop);
      else setT(Infinity);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [start, duration, delay]);

  let k = 0;
  return (
    <span>
      <span className="sr-only">{text}</span>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden>
          <span className="inline-block whitespace-nowrap">
            {[...w].map((c, ci) => {
              const locked = t >= lockAt[k++];
              return (
                <span key={ci} className="relative inline-block">
                  <span style={{ visibility: locked ? 'visible' : 'hidden' }}>{c}</span>
                  {!locked && <span className="absolute inset-0 text-center text-accent/70">{rnd()}</span>}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}
