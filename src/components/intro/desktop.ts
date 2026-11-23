/**
 * "fedora" desktop shown on the monitor: GNOME top bar, wallpaper, dash and a Ptyxis
 * terminal running fish. One function draws it, both into the 3D screen texture and
 * into a 2D canvas overlay after the camera lands, so the handoff is pixel-identical.
 * Coordinates are CSS px of the browser viewport.
 */
export const MONO = '"JetBrains Mono Variable", ui-monospace, Menlo, monospace';
export const SANS = '"Inter Variable", Inter, system-ui, sans-serif';

export const K = {
  text: '#e6e1d6',
  dim: '#8b8f99',
  green: '#7cc77f',
  blue: '#5aa2ff',
  fedora: '#51a2da',
  amber: '#f2a33a',
  accent: '#ff5c34', // the site's accent, for its favicon in the browser tab
  term: '#1e1e22',
  headerbar: '#2e2e33',
  topbar: 'rgba(0,0,0,0.92)',
};

type Seg = { t: string; c?: string; b?: boolean; bg?: string };
type Line = Seg[];

const prompt = (cwd: string): Line => [
  { t: 'arthur', c: K.green, b: true },
  { t: '@fedora ', c: K.text },
  { t: cwd, c: K.green },
  { t: '> ', c: K.text },
];

const LOGO = [
  "        ,'''''.",
  "       |   ,.  |",
  "       |  |  '_'",
  "  ,....|  |..",
  ".'  ,_;|   ..'",
  "|  |   |  |",
  "|  ',_,'  |",
  " '.     ,'",
  "   '''''",
  '',
  '',
];
const INFO: [string, string][] = [
  ['', 'arthur@fedora'],
  ['', '-------------'],
  ['OS', 'Fedora Linux 43 Workstation'],
  ['Kernel', 'Linux 7.0.12'],
  ['Uptime', '3 hours, 12 mins'],
  ['Packages', '2214 (rpm), 41 (flatpak)'],
  ['Shell', 'fish 4.1.2'],
  ['DE', 'GNOME 49'],
  ['Terminal', 'Ptyxis'],
  ['Memory', '9.1 GiB / 31 GiB (29%)'],
  ['', '■'],
];
const PALETTE = ['#2e3436', '#cc0000', '#4e9a06', '#c4a000', '#3465a4', '#75507b', '#06989a', '#d3d7cf'];

function fetchBlock(side: boolean): Line[] {
  const info = INFO.map(([k, v], i) => {
    const line: Line = side ? [{ t: (LOGO[i] ?? '').padEnd(18), c: K.fedora, b: true }] : [];
    if (v === '■') PALETTE.forEach((c) => line.push({ t: '   ', bg: c }));
    else if (i === 0) line.push({ t: 'arthur', c: K.blue, b: true }, { t: '@', c: K.text }, { t: 'fedora', c: K.blue, b: true });
    else if (!k) line.push({ t: v, c: K.text });
    else line.push({ t: `${k}: `, c: K.blue, b: true }, { t: v, c: K.text });
    return line;
  });
  if (side) return info;
  return [...LOGO.slice(0, 9).map((l): Line => [{ t: l, c: K.fedora, b: true }]), [], ...info];
}

const CPS = 26; // human typing pace
const CMD_CD = 'cd ~/projetos/portfolio';
const CMD_DEV = 'npm run dev -- --open';
const OUT: Line[] = [
  [],
  [{ t: '> portfolio@2.0.0 dev', c: K.dim }],
  [{ t: '> astro dev --open', c: K.dim }],
  [],
  [{ t: ' astro ', c: '#0b0b0f', bg: K.green, b: true }, { t: ' v6.4.8 ', c: K.green, b: true }, { t: 'ready in ', c: K.dim }, { t: '412', c: K.text, b: true }, { t: ' ms', c: K.dim }],
  [],
  [{ t: '┃ Local    ', c: K.dim }, { t: 'http://localhost:4321/', c: K.amber, b: true }],
  [{ t: '┃ Network  ', c: K.dim }, { t: 'use --host to expose', c: K.dim }],
  [],
];

/** Pre-arrival: `fastfetch` typed shortly after load (seconds since the scene started). */
export const PRE = { type: 0.7, out: 1.2 };

/** Typing pace and command lengths, so sound can follow each keystroke. */
export const TYPING = { cps: CPS, cd: CMD_CD.length, dev: CMD_DEV.length };

/** Boot sequence timeline, seconds at normal speed. */
export const SEQ = (() => {
  const cd0 = 0.5;
  const cd1 = cd0 + CMD_CD.length / CPS;
  const cdEnter = cd1 + 0.3;
  const dev0 = cdEnter + 0.4;
  const dev1 = dev0 + CMD_DEV.length / CPS;
  const devEnter = dev1 + 0.3;
  const outStep = 0.09;
  const outEnd = devEnter + OUT.length * outStep;
  const ff = outEnd + 0.45; // firefox window appears
  const loaded = ff + 1.2;
  const full = loaded + 0.6; // the window grows straight into fullscreen
  const fullDur = 0.85;
  return { cd0, cd1, cdEnter, dev0, dev1, devEnter, outStep, outEnd, ff, loaded, full, fullDur, end: full + fullDur + 0.3 };
})();

export function termLines(logo: boolean, pre: number, seq: number): { lines: Line[]; cursor: boolean } {
  const lines: Line[] = [];
  const typed = (s: string, t0: number, t: number) => s.slice(0, Math.max(0, Math.floor((t - t0) * CPS)));
  lines.push([...prompt('~'), { t: typed('fastfetch', PRE.type, pre), c: K.text }]);
  if (pre < PRE.out) return { lines, cursor: true };
  lines.push(...fetchBlock(logo), [], prompt('~'));
  if (seq <= 0) return { lines, cursor: true };

  lines[lines.length - 1] = [...prompt('~'), { t: typed(CMD_CD, SEQ.cd0, seq), c: K.text }];
  if (seq < SEQ.cdEnter) return { lines, cursor: true };
  lines.push([...prompt('~/p/portfolio'), { t: typed(CMD_DEV, SEQ.dev0, seq), c: K.text }]);
  if (seq < SEQ.devEnter) return { lines, cursor: true };
  const n = Math.min(OUT.length, Math.floor((seq - SEQ.devEnter) / SEQ.outStep) + 1);
  lines.push(...OUT.slice(0, n));
  return { lines, cursor: true };
}

const DOCK = ['firefox', 'terminal', 'cursor', 'claude', 'obsidian', 'spotify', 'docker'] as const;
type App = (typeof DOCK)[number] | 'grid';

export type Layout = ReturnType<typeof layout>;

export function layout(vw: number, vh: number) {
  const f = Math.min(17, Math.max(11.5, vw * 0.0075 + 7.5));
  const lineH = f * 1.45;
  const cw = f * 0.6; // monospace advance
  const topH = Math.round(f * 1.8);
  const narrow = vw < 700;

  const icon = f * (narrow ? 2.3 : 2.9);
  const gap = f * (narrow ? 0.4 : 0.6);
  const n = DOCK.length + 1;
  const dockW = n * icon + (n + 1) * gap + gap; // + separator
  const dockH = icon + gap * 2;
  const dock = { x: (vw - dockW) / 2, y: vh - dockH - f * 0.8, w: dockW, h: dockH, icon, gap };

  const tb = f * 2.6;
  const pad = f * 0.9;
  const tx = narrow ? f * 0.7 : vw * 0.05;
  const tw = narrow ? vw - f * 1.4 : Math.min(vw * 0.56, cw * 62 + pad * 2);
  const ty = topH + (narrow ? f * 1.2 : vh * 0.06);
  const th = narrow ? vh * 0.56 : Math.min(dock.y - f * 1.5 - ty, tb + pad * 2 + lineH * 25);
  const term = { x: tx, y: ty, w: tw, h: th, tb, pad, rows: Math.floor((th - tb - pad * 2) / lineH) };
  const logo = (tw - pad * 2) / cw >= 52; // logo beside the info; stacked above it when narrower

  const ff = narrow
    ? { x: f * 0.7, y: topH + vh * 0.1, w: vw - f * 1.4, h: vh * 0.7 }
    : { x: vw * 0.33, y: topH + vh * 0.05, w: vw * 0.63, h: Math.min(vh * 0.76, dock.y - f - topH - vh * 0.05) };
  const chrome = { tab: Math.round(f * 2.4), nav: Math.round(f * 2.5) };

  return { vw, vh, f, lineH, cw, topH, narrow, dock, term, logo, ff, chrome, r: f * 0.8 };
}

export function clock() {
  const d = new Date();
  const wd = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()];
  const mo = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][d.getMonth()];
  const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd} ${d.getDate()} de ${mo}  ${hm}`;
}

type Ctx = CanvasRenderingContext2D;
export type DesktopState = { pre: number; seq: number; blink: boolean; time: string; ffRunning: boolean; topOff: number };

export function drawDesktop(ctx: Ctx, L: Layout, map: { ox: number; oy: number; s: number; TW: number; TH: number }, st: DesktopState) {
  const { ox, oy, s } = map;
  ctx.save();
  ctx.setTransform(s, 0, 0, s, ox, oy);
  const x0 = -ox / s;
  const y0 = -oy / s;
  const W = map.TW / s;
  const H = map.TH / s;

  // wallpaper: deep Fedora blue with soft light blobs (one warm, echoing the lamp)
  const lin = ctx.createLinearGradient(0, 0, 0, L.vh);
  lin.addColorStop(0, '#10224a');
  lin.addColorStop(1, '#060a18');
  ctx.fillStyle = lin;
  ctx.fillRect(x0, y0, W, H);
  const M = Math.max(L.vw, L.vh);
  for (const [bx, by, br, col] of [
    [0.18, 0.2, 0.55, 'rgba(70,120,230,0.32)'],
    [0.88, 0.15, 0.45, 'rgba(130,90,210,0.24)'],
    [0.75, 1.0, 0.55, 'rgba(242,163,58,0.2)'],
  ] as [number, number, number, string][]) {
    const g = ctx.createRadialGradient(bx * L.vw, by * L.vh, 0, bx * L.vw, by * L.vh, br * M);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, W, H);
  }

  drawDock(ctx, L, st.ffRunning);
  drawTerminal(ctx, L, s, st);

  // GNOME top bar (slides up when the browser goes fullscreen)
  ctx.save();
  ctx.translate(0, -L.topH * st.topOff);
  ctx.fillStyle = K.topbar;
  ctx.fillRect(x0, y0 - L.topH, W, L.topH * 2 + oy / s);
  const cy = L.topH / 2;
  // workspace indicator: one pill + dots
  ctx.fillStyle = '#ffffff';
  pill(ctx, L.f * 0.9, cy - L.f * 0.22, L.f * 1.5, L.f * 0.44);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(L.f * 2.95 + i * L.f * 0.75, cy, L.f * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${L.f * 0.74}px ${SANS}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(st.time, L.vw / 2, cy + 0.5);
  ctx.textAlign = 'left';
  drawStatus(ctx, L, L.vw - L.f * 0.9, cy);
  ctx.restore();

  ctx.restore();
}

function pill(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
}

function drawStatus(ctx: Ctx, L: Layout, right: number, cy: number) {
  const u = L.f * 0.5;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = u * 0.22;
  ctx.lineCap = 'round';
  // battery
  const bx = right - u * 1.9;
  ctx.strokeRect(bx, cy - u * 0.5, u * 1.6, u);
  ctx.fillRect(bx + u * 0.18, cy - u * 0.32, u * 1.0, u * 0.64);
  ctx.fillRect(bx + u * 1.6, cy - u * 0.22, u * 0.18, u * 0.44);
  // volume
  const vx = bx - u * 2.2;
  ctx.beginPath();
  ctx.moveTo(vx, cy - u * 0.25);
  ctx.lineTo(vx + u * 0.35, cy - u * 0.25);
  ctx.lineTo(vx + u * 0.8, cy - u * 0.6);
  ctx.lineTo(vx + u * 0.8, cy + u * 0.6);
  ctx.lineTo(vx + u * 0.35, cy + u * 0.25);
  ctx.lineTo(vx, cy + u * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(vx + u * 0.85, cy, u * 0.55, -0.8, 0.8);
  ctx.stroke();
  // wifi
  const wx = vx - u * 1.5;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(wx, cy + u * 0.55, u * 0.33 * i, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
}

function drawDock(ctx: Ctx, L: Layout, ffRunning: boolean) {
  const d = L.dock;
  ctx.fillStyle = 'rgba(28,28,32,0.82)';
  ctx.beginPath();
  ctx.roundRect(d.x, d.y, d.w, d.h, L.r * 1.6);
  ctx.fill();
  const apps: App[] = [...DOCK, 'grid'];
  let x = d.x + d.gap;
  apps.forEach((a) => {
    if (a === 'grid') {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x, d.y + d.h * 0.25, 1, d.h * 0.5);
      x += d.gap;
    }
    drawIcon(ctx, a, x, d.y + d.gap, d.icon);
    if (a === 'terminal' || (a === 'firefox' && ffRunning)) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + d.icon / 2, d.y + d.h - d.gap * 0.45, L.f * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
    x += d.icon + d.gap;
  });
}

function drawIcon(ctx: Ctx, a: App, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const rr = (fill: string | CanvasGradient, r = 0.22) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x + s * 0.06, y + s * 0.06, s * 0.88, s * 0.88, s * r);
    ctx.fill();
  };
  ctx.save();
  switch (a) {
    case 'firefox': {
      const g = ctx.createRadialGradient(cx + s * 0.15, cy - s * 0.2, s * 0.05, cx, cy, s * 0.46);
      g.addColorStop(0, '#ffe24d');
      g.addColorStop(0.45, '#ff7139');
      g.addColorStop(1, '#e31587');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5b2bb5';
      ctx.beginPath();
      ctx.arc(cx - s * 0.04, cy + s * 0.05, s * 0.24, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'terminal':
      rr('#2b2b30');
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${s * 0.32}px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('>_', cx, cy);
      break;
    case 'cursor':
      rr('#0e0e10');
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = s * 0.05;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const an = -Math.PI / 2 + (i * Math.PI) / 3;
        const px = cx + Math.cos(an) * s * 0.26;
        const py = cy + Math.sin(an) * s * 0.26;
        if (i) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - s * 0.26);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + s * 0.225, cy + s * 0.13);
      ctx.stroke();
      break;
    case 'claude':
      rr('#d97757');
      ctx.strokeStyle = '#fbf1e6';
      ctx.lineWidth = s * 0.07;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const an = (i * Math.PI) / 4 + 0.2;
        const len = i % 2 ? 0.2 : 0.28;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(an) * s * 0.05, cy + Math.sin(an) * s * 0.05);
        ctx.lineTo(cx + Math.cos(an) * s * len, cy + Math.sin(an) * s * len);
        ctx.stroke();
      }
      break;
    case 'obsidian': {
      rr('#2a2140');
      const g = ctx.createLinearGradient(cx, y + s * 0.18, cx, y + s * 0.82);
      g.addColorStop(0, '#b794ff');
      g.addColorStop(1, '#6c3be0');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.02, y + s * 0.17);
      ctx.lineTo(cx + s * 0.22, cy - s * 0.02);
      ctx.lineTo(cx + s * 0.1, y + s * 0.83);
      ctx.lineTo(cx - s * 0.16, cy + s * 0.18);
      ctx.lineTo(cx - s * 0.12, cy - s * 0.12);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'spotify':
      ctx.fillStyle = '#1ed760';
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0b0b0b';
      ctx.lineCap = 'round';
      [0.26, 0.2, 0.14].forEach((w, i) => {
        ctx.lineWidth = s * (0.07 - i * 0.012);
        ctx.beginPath();
        ctx.arc(cx, cy + s * (0.32 + i * 0.06), s * (0.46 - i * 0.1), -Math.PI * 0.5 - w * 3, -Math.PI * 0.5 + w * 3);
        ctx.stroke();
      });
      break;
    case 'docker': {
      rr('#1d63ed');
      ctx.fillStyle = '#ffffff';
      // whale body: flat back, rounded belly, nose to the right, tail flick to the left
      ctx.beginPath();
      ctx.moveTo(x + s * 0.17, cy + s * 0.02);
      ctx.lineTo(x + s * 0.8, cy + s * 0.02);
      ctx.quadraticCurveTo(x + s * 0.86, cy - s * 0.08, x + s * 0.83, cy - s * 0.02);
      ctx.quadraticCurveTo(x + s * 0.76, cy + s * 0.3, x + s * 0.42, cy + s * 0.3);
      ctx.quadraticCurveTo(x + s * 0.2, cy + s * 0.3, x + s * 0.17, cy + s * 0.02);
      ctx.fill();
      // containers stacked on its back
      const c = s * 0.095;
      const gap = s * 0.018;
      const row = (n: number, x0: number, yy: number) => {
        for (let i = 0; i < n; i++) ctx.fillRect(x0 + i * (c + gap), yy, c, c);
      };
      row(5, x + s * 0.2, cy - c - gap * 0.5);
      row(3, x + s * 0.2 + (c + gap), cy - c * 2 - gap * 1.5);
      row(1, x + s * 0.2 + (c + gap) * 3, cy - c * 3 - gap * 2.5);
      break;
    }
    case 'grid':
      ctx.fillStyle = '#e8e8e8';
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(cx + ((i % 3) - 1) * s * 0.2, cy + (Math.floor(i / 3) - 1) * s * 0.2, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
  }
  ctx.restore();
}

function drawTerminal(ctx: Ctx, L: Layout, s: number, st: DesktopState) {
  const t = L.term;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = L.f * 2.2 * s; // shadowBlur ignores the transform
  ctx.shadowOffsetY = L.f * 0.6 * s;
  ctx.fillStyle = K.term;
  ctx.beginPath();
  ctx.roundRect(t.x, t.y, t.w, t.h, L.r);
  ctx.fill();
  ctx.restore();
  // libadwaita header bar: centred title, single close button on the right
  ctx.fillStyle = K.headerbar;
  ctx.beginPath();
  ctx.roundRect(t.x, t.y, t.w, t.tb, [L.r, L.r, 0, 0]);
  ctx.fill();
  ctx.fillStyle = K.text;
  ctx.font = `700 ${L.f * 0.76}px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cwd = st.seq >= SEQ.cdEnter ? '~/projetos/portfolio' : '~';
  ctx.fillText(`arthur@fedora: ${cwd}`, t.x + t.w / 2, t.y + t.tb / 2);
  const bx = t.x + t.w - t.tb / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.arc(bx, t.y + t.tb / 2, L.f * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = K.text;
  ctx.lineWidth = L.f * 0.09;
  const k = L.f * 0.22;
  ctx.beginPath();
  ctx.moveTo(bx - k, t.y + t.tb / 2 - k);
  ctx.lineTo(bx + k, t.y + t.tb / 2 + k);
  ctx.moveTo(bx + k, t.y + t.tb / 2 - k);
  ctx.lineTo(bx - k, t.y + t.tb / 2 + k);
  ctx.stroke();
  ctx.textAlign = 'left';

  // body: last `rows` lines, like a real scrolling terminal
  const { lines, cursor } = termLines(L.logo, st.pre, st.seq);
  const vis = lines.slice(-t.rows);
  ctx.save();
  ctx.beginPath();
  ctx.rect(t.x, t.y + t.tb, t.w, t.h - t.tb);
  ctx.clip();
  const left = t.x + t.pad;
  const top = t.y + t.tb + t.pad;
  let endX = left;
  vis.forEach((line, row) => {
    const y = top + L.lineH * (row + 0.5);
    let x = left;
    for (const seg of line) {
      const w = seg.t.length * L.cw;
      if (seg.bg) {
        ctx.fillStyle = seg.bg;
        ctx.fillRect(x, y - L.lineH / 2 + 1, w, L.lineH - 2);
      }
      ctx.fillStyle = seg.c ?? K.text;
      ctx.font = `${seg.b ? 700 : 400} ${L.f}px ${MONO}`;
      ctx.fillText(seg.t, x, y);
      x += w;
    }
    endX = x;
  });
  if (cursor && st.blink) {
    const y = top + L.lineH * (vis.length - 0.5);
    ctx.fillStyle = K.text;
    ctx.fillRect(endX, y - L.lineH * 0.42, L.cw, L.lineH * 0.84);
  }
  ctx.restore();
}
