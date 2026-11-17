import { C } from './constants';
import { BOOT_LINES, DOCK, MONO, OPEN_CMD, OPEN_OUT, URL_LABEL, WIN, wallpaperCss, type Layout } from './desktop';
import SiteHero from '../site/SiteHero';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

/** Seconds, at normal speed. */
export const SEQ = (() => {
  const typeStart = 0.35;
  const typeEnd = typeStart + OPEN_CMD.length / 30;
  const out = typeEnd + 0.15;
  const open = out + 0.35;
  const openDur = 0.55;
  const max = open + openDur + 0.45;
  const maxDur = 0.85;
  return { typeStart, typeEnd, out, open, openDur, max, maxDur, end: max + maxDur + 0.05 };
})();

/** HTML twin of the desktop drawn on the monitor, plus the browser window that becomes the site. */
export function Desktop({ L, t, time }: { L: Layout; t: number; time: string }) {
  const typed = OPEN_CMD.slice(0, Math.max(0, Math.floor((t - SEQ.typeStart) * 30)));
  const showOut = t >= SEQ.out;
  const blink = Math.floor(t * 2) % 2 === 0;
  const kOpen = clamp01((t - SEQ.open) / SEQ.openDur);
  const kMax = easeInOut(clamp01((t - SEQ.max) / SEQ.maxDur));
  const term = L.term;
  const d = L.dock;

  // browser window: a full-viewport page scaled down; maximizing = scaling back to 1
  const b = L.browser;
  const g = 0.86 + 0.14 * easeOutBack(kOpen);
  const sW = b.s0 * g;
  const TB = b.tb / b.s0; // titlebar height in unscaled units, so it's tb px when windowed
  const winX = b.cx - (L.vw * sW) / 2;
  const winY = b.cy - ((L.vh + TB) * sW) / 2;
  const S = sW + (1 - sW) * kMax;
  const X = winX * (1 - kMax);
  const Y = winY + (-TB - winY) * kMax;

  const lineStyle = { height: L.lineH, lineHeight: `${L.lineH}px` };
  const cursor = <span className="inline-block align-middle" style={{ width: L.f * 0.55, height: L.f * 1.1, marginLeft: L.f * 0.2, background: C.amber }} />;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: wallpaperCss(L), fontFamily: MONO }}>
      <div style={{ opacity: 1 - kMax * 0.6 }}>
        {/* menu bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between" style={{ height: L.menuH, padding: `0 ${L.f}px`, background: 'rgba(8,7,14,0.55)', fontSize: L.f * 0.78, fontWeight: 500, color: '#e8e2d4' }}>
          <span><span style={{ color: C.amber, marginRight: L.f * 0.55 }}>●</span>arthur-os</span>
          <span>{time}</span>
        </div>

        {/* dock */}
        <div className="absolute flex items-center" style={{ left: d.x, top: d.y, width: d.w, height: d.h, gap: d.gap, padding: d.gap, borderRadius: L.r * 1.3, background: 'rgba(20,16,30,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {DOCK.map((it, i) => (
            <div key={i} className="relative grid shrink-0 place-items-center" style={{ width: d.icon, height: d.icon, borderRadius: d.icon * 0.24, background: it.bg, color: it.fg, fontSize: d.icon * 0.3, fontWeight: 600 }}>
              {it.g}
              {(i === 0 || (i === 1 && kOpen > 0)) && <span className="absolute rounded-full bg-[#e8e2d4]" style={{ width: L.f * 0.28, height: L.f * 0.28, bottom: -d.gap * 0.65 }} />}
            </div>
          ))}
        </div>

        {/* terminal window */}
        <div className="absolute overflow-hidden" style={{ left: term.x, top: term.y, width: term.w, height: term.h, borderRadius: L.r, background: WIN.body, boxShadow: `0 ${L.f * 0.8}px ${L.f * 2.5}px rgba(0,0,0,0.55)` }}>
          <div className="relative flex items-center" style={{ height: term.tb, background: WIN.bar, paddingLeft: L.f * 0.78, gap: L.f * 0.31 }}>
            {WIN.dots.map((c) => <span key={c} className="rounded-full" style={{ width: L.f * 0.64, height: L.f * 0.64, background: c }} />)}
            <span className="absolute inset-x-0 text-center" style={{ fontSize: L.f * 0.75, fontWeight: 500, color: WIN.title }}>zsh — arthur</span>
          </div>
          <div style={{ padding: term.pad, fontSize: L.f, color: WIN.text }}>
            {BOOT_LINES.map((l) => <div key={l} style={{ ...lineStyle, color: l.startsWith('$') ? C.amber : undefined }}>{l}</div>)}
            <div style={{ ...lineStyle, color: C.amber }}>{typed}{!showOut && blink && cursor}</div>
            {showOut && <div style={lineStyle}>{OPEN_OUT}{blink && cursor}</div>}
          </div>
        </div>
      </div>

      {/* browser window holding the real site */}
      {kOpen > 0 && (
        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{ width: L.vw, height: L.vh + TB, transform: `translate3d(${X}px, ${Y}px, 0) scale(${S})`, opacity: easeOut(Math.min(1, kOpen * 1.6)) }}
        >
          <div className="overflow-hidden" style={{ borderRadius: (L.r * (1 - kMax)) / S, boxShadow: `0 ${30 / S}px ${80 / S}px rgba(0,0,0,${0.6 * (1 - kMax)})` }}>
            <div className="relative flex items-center" style={{ height: TB, background: WIN.bar, paddingLeft: (L.f * 0.78) / b.s0, gap: (L.f * 0.31) / b.s0 }}>
              {WIN.dots.map((c) => <span key={c} className="rounded-full" style={{ width: (L.f * 0.64) / b.s0, height: (L.f * 0.64) / b.s0, background: c }} />)}
              <span className="absolute left-1/2 -translate-x-1/2 rounded-md text-center" style={{ fontSize: (L.f * 0.75) / b.s0, color: WIN.title, background: 'rgba(255,255,255,0.06)', padding: `${(L.f * 0.2) / b.s0}px ${(L.f * 2.5) / b.s0}px` }}>
                {URL_LABEL}
              </span>
            </div>
            <div className="font-sans" style={{ width: L.vw, height: L.vh }}>
              <SiteHero />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
