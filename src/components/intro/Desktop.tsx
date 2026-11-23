import { useEffect, useRef } from 'react';
import { K, MONO, SANS, SEQ, drawDesktop, type Layout } from './desktop';
import SiteHero from '../site/SiteHero';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const phase = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

type Rect = { x: number; y: number; w: number; h: number };
const lerpRect = (a: Rect, b: Rect, k: number): Rect => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

/** The desktop after the camera lands: canvas twin of the monitor + Firefox, pointer and F11. */
export function Desktop({ L, t, time }: { L: Layout; t: number; time: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const kFull = easeInOut(phase(t, SEQ.full, SEQ.fullDur));

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const TW = Math.round(L.vw * dpr);
    const TH = Math.round(L.vh * dpr);
    if (c.width !== TW || c.height !== TH) {
      c.width = TW;
      c.height = TH;
    }
    drawDesktop(c.getContext('2d')!, L, { ox: 0, oy: 0, s: dpr, TW, TH }, { pre: 99, seq: t, blink: Math.floor(t * 2) % 2 === 0, time, ffRunning: t >= SEQ.ff, topOff: kFull });
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      {t >= SEQ.ff && <Firefox L={L} t={t} kFull={kFull} />}
    </div>
  );
}

function Firefox({ L, t, kFull }: { L: Layout; t: number; kFull: number }) {
  const ch = L.chrome.tab + L.chrome.nav;
  const win: Rect = L.ff;
  const full: Rect = { x: 0, y: -ch, w: L.vw, h: L.vh + ch };
  let R = lerpRect(win, full, kFull);

  // GNOME open animation: quick scale-up from 92% with a fade
  const kOpen = easeOut(phase(t, SEQ.ff, 0.32));
  const g = 0.92 + 0.08 * kOpen;
  R = { x: R.x + (R.w * (1 - g)) / 2, y: R.y + (R.h * (1 - g)) / 2, w: R.w * g, h: R.h * g };

  const s = R.w / L.vw; // page scale inside the window
  const radius = L.r * (1 - kFull);
  const loading = t < SEQ.loaded;
  const progress = easeOut(phase(t, SEQ.ff + 0.05, SEQ.loaded - SEQ.ff - 0.05));
  const contentIn = phase(t, SEQ.loaded - 0.05, 0.35);
  const f = L.f;

  return (
    <div
      className="absolute overflow-hidden"
      style={{ left: R.x, top: R.y, width: R.w, height: R.h, borderRadius: radius, opacity: kOpen, boxShadow: `0 ${f}px ${f * 3}px rgba(0,0,0,${0.55 * (1 - kFull)})`, fontFamily: SANS }}
    >
      {/* tab strip, with GNOME window controls on the right */}
      <div className="flex items-end" style={{ height: L.chrome.tab, background: '#1c1b22', paddingLeft: f * 0.5, paddingRight: f * 0.5 }}>
        <div className="flex items-center" style={{ height: L.chrome.tab - f * 0.45, width: Math.min(R.w * 0.45, f * 15), gap: f * 0.5, padding: `0 ${f * 0.6}px`, background: '#42414d', borderRadius: `${f * 0.4}px ${f * 0.4}px 0 0`, color: '#fbfbfe', fontSize: f * 0.72 }}>
          {loading ? (
            <span className="shrink-0 rounded-full" style={{ width: f * 0.8, height: f * 0.8, border: `${f * 0.12}px solid rgba(255,255,255,0.25)`, borderTopColor: '#fbfbfe', transform: `rotate(${t * 540}deg)` }} />
          ) : (
            <span className="grid shrink-0 place-items-center rounded-[3px] font-bold" style={{ width: f * 0.85, height: f * 0.85, background: K.accent, color: '#0f0d16', fontSize: f * 0.55 }}>A</span>
          )}
          <span className="truncate">{loading ? 'localhost:4321' : 'Arthur Rosisca — Full-Stack & Dados'}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center self-center" style={{ gap: f * 0.55 }}>
          {['–', '□', '×'].map((g2) => (
            <span key={g2} className="grid place-items-center rounded-full" style={{ width: f * 1.2, height: f * 1.2, background: 'rgba(255,255,255,0.1)', color: '#fbfbfe', fontSize: f * 0.75, lineHeight: 1 }}>{g2}</span>
          ))}
        </div>
      </div>
      {/* navigation bar */}
      <div className="flex items-center" style={{ height: L.chrome.nav, background: '#2b2a33', gap: f * 0.8, padding: `0 ${f * 0.7}px`, color: '#fbfbfe', fontSize: f * 0.85 }}>
        <span className="opacity-50">←</span>
        <span className="opacity-30">→</span>
        <span className="opacity-80">{loading ? '×' : '↻'}</span>
        <div className="flex flex-1 items-center rounded-md" style={{ height: L.chrome.nav - f * 0.7, background: '#1c1b22', padding: `0 ${f * 0.7}px`, fontSize: f * 0.75, fontFamily: MONO }}>
          <span className="text-[#fbfbfe]/50">localhost:</span>
          <span>4321</span>
        </div>
      </div>
      {/* page */}
      <div className="relative overflow-hidden bg-deep" style={{ width: R.w, height: R.h - ch }}>
        {progress < 1 && <div className="absolute left-0 top-0 z-10" style={{ height: 2, width: `${progress * 100}%`, background: 'linear-gradient(90deg,#0060df,#00ddff)' }} />}
        <div className="absolute left-0 top-0 origin-top-left font-sans" style={{ width: L.vw, height: L.vh, transform: `scale(${s})` }}>
          {contentIn < 1 && <Skeleton L={L} t={t} />}
          <div style={{ opacity: contentIn }}>
            <SiteHero />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Grey placeholder blocks shaped like the hero, shown while the "page" loads. */
function Skeleton({ L, t }: { L: Layout; t: number }) {
  if (t < SEQ.ff + 0.25) return null;
  const px = L.narrow ? 24 : 48;
  const pulse = 0.55 + 0.25 * Math.sin(t * 9);
  const block = (x: number, y: number, w: number, h: number, r = 8) => (
    <div className="absolute" style={{ left: x, top: y, width: w, height: h, borderRadius: r, background: '#221e2d', opacity: pulse }} />
  );
  const h1 = Math.min(Math.max(48, L.vw * 0.09), 120);
  const y0 = L.vh * 0.33;
  return (
    <div className="absolute inset-0">
      {block(px, 28, 150, 14)}
      {block(L.vw - px - 110, 22, 110, 30, 99)}
      {block(px, y0, 130, 14)}
      {block(px, y0 + 36, Math.min(L.vw - px * 2, L.vw * 0.62), h1)}
      {block(px, y0 + 60 + h1, Math.min(L.vw - px * 2, 560), 16)}
      {block(px, y0 + 88 + h1, Math.min(L.vw - px * 2, 420), 16)}
      {block(px, y0 + 140 + h1, 140, 46, 99)}
      {block(px + 152, y0 + 140 + h1, 150, 46, 99)}
    </div>
  );
}

export { SEQ };
