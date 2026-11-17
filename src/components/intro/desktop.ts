import { C } from './constants';

/**
 * The little "arthur-os" desktop shown on the monitor. Layout is expressed in CSS px of
 * the browser viewport, so the same numbers drive the canvas texture on the 3D screen
 * and the HTML overlay that replaces it when the camera arrives.
 */
export const MONO = '"JetBrains Mono Variable", ui-monospace, Menlo, monospace';
export const BOOT_LINES = ['$ whoami', 'arthur rosisca — full-stack & dados', '$ ./portfolio --start', 'servidor pronto em arthur.dev'];
export const OPEN_CMD = '$ open https://arthur.dev';
export const OPEN_OUT = 'abrindo no navegador…';
export const URL_LABEL = 'arthur.dev';

export const WP = { top: '#2b1e47', bottom: '#0b0a12', glow: 'rgba(242,163,58,0.34)' };
export const WIN = { body: 'rgba(10,10,15,0.94)', bar: '#1a1a24', title: '#8b8f99', text: '#d9d4c7', dots: ['#ff5f57', '#febc2e', '#28c840'] };

export const DOCK = [
  { g: '>_', bg: '#16171f', fg: C.amber },
  { g: 'www', bg: '#3a78e0', fg: '#ffffff' },
  { g: '{ }', bg: '#7a5cc7', fg: '#ffffff' },
  { g: '♪', bg: '#d9643a', fg: '#ffffff' },
  { g: '3×3', bg: '#39a85a', fg: '#ffffff' },
  { g: '~/', bg: C.amber, fg: C.ink },
];

export type Layout = ReturnType<typeof layout>;

export function layout(vw: number, vh: number) {
  const f = Math.min(19, Math.max(12, vw * 0.0085 + 8));
  const lineH = f * 1.7;
  const menuH = Math.round(f * 2);
  const icon = f * 2.7;
  const gap = f * 0.55;
  const dockW = DOCK.length * icon + (DOCK.length + 1) * gap;
  const dockH = icon + gap * 2;
  const dock = { x: (vw - dockW) / 2, y: vh - dockH - f, w: dockW, h: dockH, icon, gap };
  const tb = f * 2.1;
  const pad = f * 1.2;
  const tw = Math.min(vw - f * 2, f * 38);
  const th = tb + pad * 2 + lineH * 6;
  const term = { x: (vw - tw) / 2, y: Math.max(menuH + f * 1.5, (vh - th) / 2 - f * 2.5), w: tw, h: th, tb, pad };
  const s0 = vw < 700 ? 0.86 : 0.72;
  const browser = { s0, tb, cx: vw / 2, cy: Math.min(vh / 2, menuH + (vh * s0 + tb) / 2 + f * 1.2) };
  return { vw, vh, f, lineH, menuH, dock, term, browser, r: f * 0.75, glow: { x: vw * 0.8, y: vh * 0.95, r: Math.max(vw, vh) * 0.65 } };
}

export function clock() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** CSS equivalent of the canvas wallpaper (same stops, same geometry). */
export function wallpaperCss(L: Layout) {
  return `radial-gradient(circle ${L.glow.r}px at ${L.glow.x}px ${L.glow.y}px, ${WP.glow}, transparent), linear-gradient(180deg, ${WP.top} 0px, ${WP.bottom} ${L.vh}px)`;
}

type Ctx = CanvasRenderingContext2D;

/**
 * Draws the desktop. `ox, oy, s` map viewport px into texture px; the wallpaper is
 * extended over the whole texture so parts of the screen outside the viewport aren't empty.
 */
export function drawDesktop(ctx: Ctx, L: Layout, map: { ox: number; oy: number; s: number; TW: number; TH: number }, st: { chars: number; blink: boolean; time: string }) {
  const { ox, oy, s } = map;
  ctx.save();
  ctx.setTransform(s, 0, 0, s, ox, oy);
  const x0 = -ox / s;
  const y0 = -oy / s;
  const x1 = (map.TW - ox) / s;
  const y1 = (map.TH - oy) / s;

  const lin = ctx.createLinearGradient(0, 0, 0, L.vh);
  lin.addColorStop(0, WP.top);
  lin.addColorStop(1, WP.bottom);
  ctx.fillStyle = lin;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  const rad = ctx.createRadialGradient(L.glow.x, L.glow.y, 0, L.glow.x, L.glow.y, L.glow.r);
  rad.addColorStop(0, WP.glow);
  rad.addColorStop(1, 'rgba(242,163,58,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);

  // menu bar
  ctx.fillStyle = 'rgba(8,7,14,0.55)';
  ctx.fillRect(x0, 0, x1 - x0, L.menuH);
  ctx.font = `500 ${L.f * 0.78}px ${MONO}`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.amber;
  ctx.fillText('●', L.f, L.menuH / 2);
  ctx.fillStyle = '#e8e2d4';
  ctx.fillText('arthur-os', L.f * 2.2, L.menuH / 2);
  ctx.textAlign = 'right';
  ctx.fillText(st.time, L.vw - L.f, L.menuH / 2);
  ctx.textAlign = 'left';

  // dock
  const d = L.dock;
  ctx.fillStyle = 'rgba(20,16,30,0.6)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(d.x, d.y, d.w, d.h, L.r * 1.3);
  ctx.fill();
  ctx.stroke();
  DOCK.forEach((it, i) => {
    const ix = d.x + d.gap + i * (d.icon + d.gap);
    const iy = d.y + d.gap;
    ctx.fillStyle = it.bg;
    ctx.beginPath();
    ctx.roundRect(ix, iy, d.icon, d.icon, d.icon * 0.24);
    ctx.fill();
    ctx.fillStyle = it.fg;
    ctx.font = `600 ${d.icon * 0.3}px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText(it.g, ix + d.icon / 2, iy + d.icon / 2);
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = '#e8e2d4';
  ctx.beginPath();
  ctx.arc(d.x + d.gap + d.icon / 2, d.y + d.h - d.gap * 0.45, L.f * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // terminal window
  const t = L.term;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = L.f * 2.5 * s; // shadowBlur ignores the transform
  ctx.shadowOffsetY = L.f * 0.8 * s;
  ctx.fillStyle = WIN.body;
  ctx.beginPath();
  ctx.roundRect(t.x, t.y, t.w, t.h, L.r);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = WIN.bar;
  ctx.beginPath();
  ctx.roundRect(t.x, t.y, t.w, t.tb, [L.r, L.r, 0, 0]);
  ctx.fill();
  WIN.dots.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(t.x + L.f * (1.1 + i * 0.95), t.y + t.tb / 2, L.f * 0.32, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = WIN.title;
  ctx.font = `500 ${L.f * 0.75}px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('zsh — arthur', t.x + t.w / 2, t.y + t.tb / 2);
  ctx.textAlign = 'left';

  ctx.font = `400 ${L.f}px ${MONO}`;
  let budget = st.chars;
  let row = 0;
  const left = t.x + t.pad;
  const top = t.y + t.tb + t.pad;
  let cx = left;
  for (const line of BOOT_LINES) {
    if (budget <= 0) break;
    const shown = line.slice(0, budget);
    ctx.fillStyle = line.startsWith('$') ? C.amber : WIN.text;
    ctx.fillText(shown, left, top + L.lineH * (row + 0.5));
    cx = left + ctx.measureText(shown).width;
    budget -= line.length + 10;
    if (budget > 0) {
      row++;
      cx = left;
    }
  }
  if (st.blink) {
    ctx.fillStyle = C.amber;
    const cy = top + L.lineH * (row + 0.5);
    ctx.fillRect(cx + L.f * 0.2, cy - L.f * 0.55, L.f * 0.55, L.f * 1.1);
  }
  ctx.restore();
}

export const BOOT_TOTAL = BOOT_LINES.reduce((n, l) => n + l.length + 10, 0);
