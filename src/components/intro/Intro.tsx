import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Scene } from './Scene';
import { useScrollProgress } from './useScrollProgress';
import { useAssistedScroll } from './useAssistedScroll';
import { detectQuality, prefersReducedMotion, type Quality } from './quality';
import { ARRIVE } from './constants';
import { BOOT_LINES, termMetrics } from './terminal';

/** Lines typed in HTML after the camera lands inside the monitor. */
const NEXT_LINES = [
  { text: 'carregando projetos ........ ok', prompt: false },
  { text: 'carregando experiência ..... ok', prompt: false },
  { text: '$ cd ~/portfolio', prompt: true },
];

function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

export default function Intro() {
  const section = useRef<HTMLElement>(null);
  const raw = useScrollProgress(section);
  const smooth = useRef(0); // the single progress value the camera AND the overlays read
  const [quality, setQuality] = useState<Quality | null>(null);
  const [reduced, setReduced] = useState(false);
  const [p, setP] = useState(0);
  const [arrivedAt, setArrivedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const vp = useViewport();

  useEffect(() => {
    setQuality(detectQuality());
    setReduced(prefersReducedMotion());
  }, []);

  useAssistedScroll(section, quality !== null && !reduced);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      smooth.current = reduced ? raw.current : THREE.MathUtils.damp(smooth.current, raw.current, 9, dt);
      if (Math.abs(raw.current - smooth.current) < 0.0005) smooth.current = raw.current;
      setP((old) => (Math.abs(old - smooth.current) > 0.002 ? smooth.current : old));
      setNow(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [raw, reduced]);

  const arrived = p >= ARRIVE - 0.002;
  useEffect(() => {
    if (arrived && arrivedAt === null) setArrivedAt(performance.now());
  }, [arrived, arrivedAt]);

  const skip = () => {
    const el = section.current;
    if (!el) return;
    const y = el.offsetTop + el.offsetHeight - window.innerHeight;
    const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis && !reduced) lenis.scrollTo(y, { duration: 2.4 });
    else window.scrollTo({ top: y });
  };

  // landing copy fades out as soon as the camera starts moving
  const copy = Math.max(0, 1 - p / 0.14);
  const m = termMetrics(vp.w, vp.h);
  const sinceArrive = arrivedAt === null ? 0 : (now - arrivedAt) / 1000;
  const typed = Math.floor(sinceArrive * 26);
  const blink = Math.floor(now / 500) % 2 === 0;

  let budget = typed;
  const extra = NEXT_LINES.map((l) => {
    const shown = l.text.slice(0, Math.max(0, budget));
    budget -= l.text.length + 8;
    return { ...l, shown, done: shown.length === l.text.length };
  });
  const cursorRow = BOOT_LINES.length + Math.max(0, extra.findIndex((l) => !l.done) === -1 ? extra.length : extra.findIndex((l) => !l.done));

  return (
    <section ref={section} className="relative h-[400vh]" aria-label="Introdução">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-ink">
        {quality && (
          <div className="absolute inset-0" style={{ visibility: arrived ? 'hidden' : 'visible' }}>
            <Scene progress={smooth} quality={quality} active={!arrived} />
          </div>
        )}

        {/* landing: scrim keeps the headline legible over the scene */}
        <div className="pointer-events-none absolute inset-0" style={{ opacity: copy }}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,7,0.95)_0%,rgba(5,5,7,0.8)_38%,transparent_58%)] md:bg-[linear-gradient(90deg,rgba(5,5,7,0.92)_0%,rgba(5,5,7,0.6)_38%,transparent_62%)]" />
          <div className="relative flex h-full flex-col p-6 md:justify-between md:p-12">
            <header className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-cream/60">
              <span>arthur rosisca</span>
              <span>portfólio · 2026</span>
            </header>
            <div className="mt-[7vh] max-w-xl md:mt-0 md:mb-[8vh]">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber">full-stack &amp; dados</p>
              <h1 className="mt-4 text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-cream">
                Construo sistemas e dou sentido a dados.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-cream/70">
                Role para entrar no meu quarto, onde as coisas acontecem.
              </p>
            </div>
            <div className="mt-auto flex items-center gap-3 font-mono text-xs text-cream/60 md:mt-0">
              <span className="relative block h-8 w-5 rounded-full border border-cream/30">
                <span className="absolute left-1/2 top-1.5 h-1.5 w-1 -translate-x-1/2 animate-bounce rounded-full bg-amber" />
              </span>
              role para entrar
            </div>
          </div>
        </div>

        {/* HTML terminal: same metrics as the monitor texture, so the swap is invisible */}
        {arrived && (
          <div className="absolute inset-0 font-mono text-[#d9d4c7]" style={{ fontSize: m.font, lineHeight: `${m.lineH}px`, padding: `${m.padY}px ${m.padX}px`, fontWeight: 500 }}>
            {BOOT_LINES.map((l) => (
              <div key={l} className={l.startsWith('$') ? 'text-amber' : ''}>{l}</div>
            ))}
            {extra.map((l, i) =>
              l.shown ? (
                <div key={i} className={l.prompt ? 'text-amber' : ''}>
                  {l.shown}
                  {!l.done && BOOT_LINES.length + i === cursorRow && blink && <Cursor size={m.font} />}
                </div>
              ) : null,
            )}
            {extra.every((l) => l.done) && blink && <Cursor size={m.font} />}
          </div>
        )}

        <button
          type="button"
          onClick={skip}
          className="absolute bottom-6 right-6 rounded-full border border-cream/20 bg-ink/70 px-4 py-2 font-mono text-xs text-cream/80 backdrop-blur transition hover:border-amber hover:text-amber md:bottom-12 md:right-12"
          style={{ opacity: arrived ? 0 : 1, pointerEvents: arrived ? 'none' : 'auto' }}
        >
          pular intro →
        </button>
      </div>
    </section>
  );
}

function Cursor({ size }: { size: number }) {
  return <span className="ml-1 inline-block bg-amber align-middle" style={{ width: size * 0.55, height: size * 1.1 }} />;
}
