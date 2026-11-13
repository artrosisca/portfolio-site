import { useEffect, useRef, useState } from 'react';
import { Scene } from './Scene';
import { useScrollProgress } from './useScrollProgress';
import { detectQuality, prefersReducedMotion, type Quality } from './quality';

export default function Intro() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [reduced, setReduced] = useState(false);
  const [ui, setUi] = useState({ p: 0 });

  useEffect(() => {
    setQuality(detectQuality());
    setReduced(prefersReducedMotion());
  }, []);

  // Low-frequency UI sync (opacity of overlays), independent from the 60fps camera.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setUi((u) => (Math.abs(u.p - progress.current) > 0.004 ? { p: progress.current } : u));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const skip = () => {
    const el = section.current;
    if (!el) return;
    window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight + 1, behavior: reduced ? 'auto' : 'smooth' });
  };

  const p = ui.p;
  const introOpacity = Math.max(0, 1 - p * 3);
  const blackout = Math.min(1, Math.max(0, (p - 0.86) / 0.14));
  const done = p >= 0.999;

  return (
    <section ref={section} className="relative h-[380vh]" aria-label="Introdução">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {quality && !done && <Scene progress={progress} quality={quality} reduced={reduced} />}

        {/* overlay copy */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10"
          style={{ opacity: introOpacity }}
        >
          <header className="flex items-center justify-between font-mono text-xs tracking-[0.2em] uppercase text-muted">
            <span>arthur rosisca</span>
            <span>curitiba · 2026</span>
          </header>
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-cream md:text-6xl">
              Construo sistemas e dou sentido a dados.
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted md:text-base">
              Full-Stack &amp; Engenharia de Dados. Role para entrar no meu estúdio.
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-3 font-mono text-xs text-muted">
              <span className="relative block h-8 w-5 rounded-full border border-muted/50">
                <span className="absolute left-1/2 top-1.5 h-1.5 w-1 -translate-x-1/2 animate-bounce rounded-full bg-amber" />
              </span>
              <span>role para entrar</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={skip}
          className="absolute bottom-6 right-6 rounded-full border border-cream/15 bg-ink/60 px-4 py-2 font-mono text-xs text-cream/80 backdrop-blur transition hover:border-amber hover:text-amber md:bottom-10 md:right-10"
          style={{ opacity: done ? 0 : 1, pointerEvents: done ? 'none' : 'auto' }}
        >
          pular intro →
        </button>

        {/* final blend into the page background (same black as the monitor) */}
        <div className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: blackout }} />
      </div>
    </section>
  );
}
