import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type Lenis from 'lenis';
import { Scene } from './Scene';
import { Desktop, SEQ } from './Desktop';
import { useScrollProgress } from './useScrollProgress';
import { useSmoothScroll } from './useSmoothScroll';
import { detectQuality, prefersReducedMotion, type Quality } from './quality';
import { TYPING, clock, layout } from './desktop';
import { sound } from '@/lib/sound';
import { Reveal } from '@/components/site/Reveal';

type Phase = 'scroll' | 'boot' | 'done';
const SEEN_KEY = 'intro-seen';
const getLenis = () => (window as Window & { __lenis?: Lenis }).__lenis;

/** Lamp power over time after the click: on, off, on, off, then it warms up. */
function lampFlicker(s: number) {
  if (s < 0) return 0;
  if (s < 0.06) return 1;
  if (s < 0.16) return 0.08;
  if (s < 0.24) return 0.75;
  if (s < 0.36) return 0.04;
  if (s < 0.9) return 0.4 + 0.6 * ((s - 0.36) / 0.54) ** 0.6;
  return 1;
}

/** Sound cues of the boot sequence that happen between two moments of its timeline. */
function bootSounds(a: number, b: number) {
  const crossed = (x: number) => a < x && b >= x;
  const typed = (t0: number, len: number, t: number) => Math.min(len, Math.max(0, Math.floor((t - t0) * TYPING.cps)));
  if (typed(SEQ.cd0, TYPING.cd, b) > typed(SEQ.cd0, TYPING.cd, a)) sound.play('key');
  if (typed(SEQ.dev0, TYPING.dev, b) > typed(SEQ.dev0, TYPING.dev, a)) sound.play('key');
  if (crossed(SEQ.cdEnter) || crossed(SEQ.devEnter)) sound.play('enter');
  if (crossed(SEQ.full)) sound.ambience(0, 1.5);
}

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
  const lamp = useRef(0); // desk lamp power, 0 until the visitor "turns it on"
  const lampAt = useRef<number | null>(null);
  const [lit, setLit] = useState(false);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [reduced, setReduced] = useState(false);
  const [phase, setPhase] = useState<Phase>('scroll');
  const [p, setP] = useState(0);
  const [seqT, setSeqT] = useState(0);
  const [desktopOn, setDesktopOn] = useState(false);
  const [hurried, setHurried] = useState(false);
  const phaseRef = useRef<Phase>('scroll');
  phaseRef.current = phase;
  const vp = useViewport();

  useEffect(() => {
    const r = prefersReducedMotion();
    setReduced(r);
    setQuality(detectQuality());
    if (r) {
      setPhase('done');
      return;
    }
    // already came in this session: the light is simply on
    if (sessionStorage.getItem(SEEN_KEY)) {
      lampAt.current = -1e6;
      setLit(true);
      sound.ambience(0.9);
      return;
    }
    // first visit: the room opens dark and the lamp switches itself on a moment later
    const id = window.setTimeout(() => {
      lampAt.current = performance.now();
      sound.play('switch');
      sound.ambience(0.9, 2);
      setLit(true);
    }, 1400);
    return () => window.clearTimeout(id);
  }, []);

  // While the intro runs, the site below it is out of the document: the page then ends
  // exactly where the camera reaches the screen, so the last wheel flick can't overshoot
  // into the site (and get yanked back when the boot locks the scroll).
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (phase === 'done') delete html.dataset.intro;
    else html.dataset.intro = 'on';
    return () => void delete html.dataset.intro;
  }, [phase]);

  // Lenis lives for the whole page; scrolling is never automatic until the camera arrives.
  useSmoothScroll(quality !== null && !reduced);

  // progress smoothing + arrival detection
  useEffect(() => {
    if (phase === 'done') return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      lamp.current = lampAt.current === null ? 0 : lampFlicker((t - lampAt.current) / 1000);
      smooth.current = THREE.MathUtils.damp(smooth.current, raw.current, 9, dt);
      if (Math.abs(raw.current - smooth.current) < 0.0005) smooth.current = raw.current;
      setP((old) => (Math.abs(old - smooth.current) > 0.002 ? smooth.current : old));
      if (phaseRef.current === 'scroll' && raw.current >= 0.999) setPhase('boot');
      if (phaseRef.current === 'boot' && smooth.current >= 0.997) setDesktopOn(true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [raw, phase]);

  // boot: scroll locked, sequence plays; any input speeds it up instead of being ignored
  useEffect(() => {
    if (phase !== 'boot') return;
    const el = section.current;
    const lenis = getLenis();
    const end = el ? el.offsetTop + el.offsetHeight - window.innerHeight : window.scrollY;
    lenis?.scrollTo(end, { immediate: true, force: true });
    lenis?.stop();
    const html = document.documentElement;
    html.style.overflow = 'hidden';

    let speed = sessionStorage.getItem(SEEN_KEY) ? 1.4 : 1;
    const hurry = () => {
      speed = Math.max(speed, 2.5);
      setHurried(true);
    };
    const block = (e: Event) => e.preventDefault(); // scroll is locked; momentum is ignored
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' ? setPhase('done') : hurry());
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', hurry);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const prev = t;
      if (smooth.current >= 0.997) t += dt * speed; // wait until the camera has landed
      bootSounds(prev, t);
      setSeqT(t);
      if (t >= SEQ.end) setPhase('done');
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', hurry);
      html.style.overflow = '';
      lenis?.start();
    };
  }, [phase]);

  // done: the intro leaves the document and the real site sits at the very top, where
  // the maximized window just was. One way only.
  useLayoutEffect(() => {
    if (phase !== 'done') return;
    sessionStorage.setItem(SEEN_KEY, '1');
    sound.ambience(0, 0.8);
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [phase]);

  if (phase === 'done') return null;

  const skip = () => setPhase('done');
  const copy = Math.max(0, 1 - p / 0.14);
  const L = layout(vp.w, vp.h);
  const sceneActive = !desktopOn || seqT < 0.45;

  return (
    <section ref={section} className="relative h-[420vh]" aria-label="Introdução">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-ink">
        {quality && (
          <div className="absolute inset-0" style={{ visibility: sceneActive ? 'visible' : 'hidden' }}>
            <Scene progress={smooth} lamp={lamp} quality={quality} active={sceneActive} />
          </div>
        )}

        {/* landing: scrim keeps the headline legible over the scene */}
        <div className="pointer-events-none absolute inset-0 transition-opacity duration-1000" style={{ opacity: lit ? 1 : 0, transitionDelay: lit ? '500ms' : '0ms' }}>
        <div className="absolute inset-0" style={{ opacity: copy }}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,7,0.95)_0%,rgba(5,5,7,0.8)_38%,transparent_58%)] md:bg-[linear-gradient(90deg,rgba(5,5,7,0.92)_0%,rgba(5,5,7,0.6)_38%,transparent_62%)]" />
          <div className="relative flex h-full flex-col p-6 md:justify-between md:p-12">
            <header className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-cream/60">
              <span>arthur rosisca</span>
              <span>portfólio · 2026</span>
            </header>
            <div className="mt-[7vh] max-w-xl md:mt-0 md:mb-[15vh]">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-soft">full-stack &amp; dados</p>
              <h1 className="mt-4 font-serif text-[clamp(2.6rem,6.4vw,5.4rem)] font-[420] leading-[1.02] tracking-[-0.02em] text-cream">
                <Reveal text="Construo sistemas e dou *sentido* a dados." start={lit} delay={0.45} />
              </h1>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-cream/70">Role para entrar no meu quarto, onde as coisas acontecem.</p>
            </div>
            {/* centered, so it doesn't collide with the sound toggle (left) or "pular intro" (right) */}
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 font-mono text-xs text-cream/60 md:bottom-12">
              <span className="relative block h-8 w-5 rounded-full border border-cream/30">
                <span className="absolute left-1/2 top-1.5 h-1.5 w-1 -translate-x-1/2 animate-bounce rounded-full bg-accent-soft" />
              </span>
              <span className="hidden sm:inline">role para entrar</span>
            </div>
          </div>
        </div>
        </div>


        {/* HTML desktop takes over from the monitor texture once the camera has landed */}
        {desktopOn && (
          <div className="absolute inset-0 animate-[fadein_250ms_ease-out]">
            <Desktop L={L} t={seqT} time={clock()} />
          </div>
        )}

        {desktopOn && (
          <p className="pointer-events-none absolute top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 font-mono text-[11px] text-white/70 backdrop-blur transition-opacity duration-500" style={{ opacity: hurried ? 0 : 1 }}>
            clique para acelerar · esc para pular
          </p>
        )}

        <button
          type="button"
          onClick={skip}
          className="absolute bottom-6 right-6 z-10 rounded-full border border-cream/20 bg-ink/70 px-4 py-2 font-mono text-xs text-cream/80 backdrop-blur transition hover:border-accent-soft hover:text-accent-soft md:bottom-12 md:right-12"
          style={{ opacity: phase === 'scroll' && lit ? 1 : 0, pointerEvents: phase === 'scroll' && lit ? 'auto' : 'none' }}
        >
          pular intro →
        </button>
      </div>
    </section>
  );
}

