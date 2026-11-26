/**
 * Arthur's desktop shown on the monitor: Fedora with COSMIC (panel, floating dock) and a
 * translucent kitty running fish with his capsule prompt and his real fastfetch. One function
 * draws it, both into the 3D screen texture and into a 2D canvas overlay after the camera
 * lands, so the handoff is pixel-identical.
 * Coordinates are CSS px of the browser viewport.
 */
export const MONO = '"Fira Code Variable", "JetBrains Mono Variable", ui-monospace, Menlo, monospace';
export const SANS = '"Inter Variable", Inter, system-ui, sans-serif';

export const K = {
  text: '#e6e1d6',
  dim: '#8b8f99',
  green: '#7cc77f',
  amber: '#f2a33a',
  key: '#4d9ff5', // fastfetch keys
  accent: '#ff5c34', // the site's accent, for its favicon in the browser tab
  term: 'rgba(10,9,14,0.86)', // kitty, translucent
  topbar: 'rgba(14,12,19,0.94)',
};

/** Arthur's prompt: Catppuccin capsules (fish + a powerline theme). */
const P = { lav: '#b4befe', peach: '#fab387', green: '#a6e3a1', yellow: '#f9e2af', sky: '#89dceb', pink: '#f5c2e7', mauve: '#cba6f7', ink: '#313244', rule: '#585b70' };

type Icon = 'fedora' | 'folder' | 'branch' | 'battery';
/** One terminal cell run. Shape segments (arrow, chevron, cap, icon) are one or two cells wide. */
type Seg = { t: string; c?: string; b?: boolean; bg?: string; arrow?: string; arrowL?: string; chev?: string; chevL?: string; capL?: string; capR?: string; icon?: Icon };
type Line = Seg[] & { right?: Seg[] };

const withRight = (left: Seg[], right: Seg[]): Line => Object.assign(left, { right });

/** Two-line prompt, like Arthur's kitty: capsules on top, `❯ command` below. */
function prompt(cwd: string, branch: string | null, cmd: string): Line[] {
  const top: Seg[] = [
    { t: '╭─', c: P.rule },
    { t: ' ', capL: P.lav },
    { t: '  ', icon: 'fedora', bg: P.lav, c: P.ink },
    { t: 'arosisca@fedora ', bg: P.lav, c: P.ink },
    { t: ' ', arrow: P.lav, bg: P.peach },
    { t: '  ', icon: 'folder', bg: P.peach, c: P.ink },
    { t: `${cwd} `, bg: P.peach, c: P.ink },
  ];
  let last = P.peach;
  if (branch) {
    top.push({ t: ' ', arrow: P.peach, bg: P.green }, { t: '  ', icon: 'branch', bg: P.green, c: P.ink }, { t: `${branch} `, bg: P.green, c: P.ink });
    last = P.green;
  }
  top.push({ t: ' ', arrow: last });
  (branch ? [P.yellow, P.sky] : [P.yellow, P.green, P.sky]).forEach((c) => top.push({ t: ' ', chev: c }));
  const right: Seg[] = [
    { t: ' ', chevL: P.pink },
    { t: ' ', chevL: P.mauve },
    { t: ' ', arrowL: P.lav },
    { t: '  ', icon: 'battery', bg: P.lav, c: P.ink },
    { t: '100%', bg: P.lav, c: P.ink },
    { t: ' ', capR: P.lav },
    { t: '─╮', c: P.rule },
  ];
  return [withRight(top, right), [{ t: '╰─', c: P.rule }, { t: '❯ ', c: P.green, b: true }, { t: cmd, c: K.text }]];
}

// fastfetch's Fedora logo: the "c" field in blue, the f glyph in white
const LOGO = [
  "             .',;::::;,'.",
  "         .';:cccccccccccc:;,.",
  "      .;cccccccccccccccccccccc;.",
  "    .:cccccccccccccccccccccccccc:.",
  "  .;ccccccccccccc;.:dddl:.;ccccccc;.",
  " .:ccccccccccccc;OWMKOOXMWd;ccccccc:.",
  ".:ccccccccccccc;KMMc;cc;xMMc;ccccccc:.",
  ",cccccccccccccc;MMM.;cc;;WW:;cccccccc,",
  ":cccccccccccccc;MMM.;cccccccccccccccc:",
  ":ccccccc;oxOOOo;MMM000k.;cccccccccccc:",
  "cccccc;0MMKxdd:;MMMkddc.;cccccccccccc;",
  "ccccc;XMO';cccc;MMM.;cccccccccccccccc'",
  "ccccc;MMo;ccccc;MMW.;ccccccccccccccc;",
  "ccccc;0MNc.ccc.xMMd;ccccccccccccccc;",
  "cccccc;dNMWXXXWM0:;cccccccccccccc:,",
  "cccccccc;.:odl:.;cccccccccccccc:,.",
  "ccccccccccccccccccccccccccccc:'.",
  ":ccccccccccccccccccccccc:;,..",
  " ':cccccccccccccccc::;,.",
];
const LOGO_W = 39;
const LOGO_BLUE = '#3c8ee8';

function logoLine(s: string): Seg[] {
  const out: Seg[] = [];
  for (const ch of s.padEnd(LOGO_W + 2)) {
    const white = /[A-Za-z0-9]/.test(ch) && ch !== 'c';
    const c = white ? '#f4f4f4' : LOGO_BLUE;
    const prev = out[out.length - 1];
    if (prev && prev.c === c) prev.t += ch;
    else out.push({ t: ch, c, b: true });
  }
  return out;
}

const YEL = '#e5c07b';
const INFO: Seg[][] = [
  [{ t: 'arosisca@fedora', c: K.text, b: true }],
  [{ t: '───────────────', c: K.text }],
  ...([
    ['OS', 'Fedora Linux 43 (COSMIC) x86_64'],
    ['Host', 'Zenbook UN5401QA'],
    ['Kernel', 'Linux 7.0.12-101.fc43'],
    ['Uptime', '5 hours, 33 mins'],
    ['Packages', '6646 (rpm), 24 (flatpak)'],
    ['Shell', 'fish 4.2.0'],
    ['Display', '2880x1800 @ 90 Hz'],
    ['DE', 'COSMIC 1.0.0'],
    ['WM', 'cosmic-comp (Wayland)'],
    ['Terminal', 'kitty 0.43.1'],
    ['Font', 'FiraCode-Regular (11pt)'],
    ['CPU', 'AMD Ryzen 9 5900HX (16)'],
    ['GPU', 'AMD Radeon Vega (Integrated)'],
  ] as const).map(([k, v]): Seg[] => [{ t: `${k}: `, c: K.key, b: true }, { t: v, c: K.text }]),
  [{ t: 'Memory: ', c: K.key, b: true }, { t: '11.24 GiB / 15.01 GiB (', c: K.text }, { t: '75%', c: YEL }, { t: ')', c: K.text }],
  [{ t: 'Disk (/): ', c: K.key, b: true }, { t: '125.80 GiB / 184.26 GiB (', c: K.text }, { t: '68%', c: YEL }, { t: ')', c: K.text }],
  [{ t: 'Battery: ', c: K.key, b: true }, { t: '100%', c: '#2fd16a' }, { t: ' [AC Connected]', c: K.text }],
  [],
  ['#000000', '#cc0000', '#19cb00', '#cecb00', '#0d73cc', '#cb1ed1', '#0dcdcd', '#dddddd'].map((bg) => ({ t: '   ', bg })),
  ['#767676', '#f2201f', '#23fd00', '#fffd00', '#1a8fff', '#fd28ff', '#14ffff', '#ffffff'].map((bg) => ({ t: '   ', bg })),
];

function fetchBlock(logo: boolean): Line[] {
  if (!logo) return INFO.map((l) => [...l]);
  const n = Math.max(LOGO.length, INFO.length + 1);
  // info starts one row down, like fastfetch's own layout
  return Array.from({ length: n }, (_, i): Line => [...logoLine(LOGO[i] ?? ''), ...(INFO[i - 1] ?? [])]);
}

const CPS = 60; // a fast typist: the boot is a flourish, not a wait
const CMD_DEV = 'npm run dev -- --open';
const CWD = '~/GIT/portfolio-site';
const BRANCH = 'main';
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
export const TYPING = { cps: CPS, dev: CMD_DEV.length };

/** Boot sequence timeline, seconds at normal speed. */
export const SEQ = (() => {
  const dev0 = 0.25;
  const dev1 = dev0 + CMD_DEV.length / CPS;
  const devEnter = dev1 + 0.15;
  const outStep = 0.04;
  const outEnd = devEnter + OUT.length * outStep;
  const ff = outEnd + 0.2; // firefox window appears
  const loaded = ff + 0.5;
  const full = loaded + 0.25; // the window grows straight into fullscreen
  const fullDur = 0.6;
  return { dev0, dev1, devEnter, outStep, outEnd, ff, loaded, full, fullDur, end: full + fullDur + 0.15 };
})();

export function termLines(logo: boolean, pre: number, seq: number): { lines: Line[]; cursor: boolean } {
  const lines: Line[] = [];
  const typed = (s: string, t0: number, t: number) => s.slice(0, Math.max(0, Math.floor((t - t0) * CPS)));
  // kitty opens straight in the project, so the boot is a single command
  lines.push(...prompt(CWD, BRANCH, typed('fastfetch', PRE.type, pre)));
  if (pre < PRE.out) return { lines, cursor: true };
  lines.push(...fetchBlock(logo), []);
  lines.push(...prompt(CWD, BRANCH, seq > 0 ? typed(CMD_DEV, SEQ.dev0, seq) : ''));
  if (seq < SEQ.devEnter) return { lines, cursor: true };
  const n = Math.min(OUT.length, Math.floor((seq - SEQ.devEnter) / SEQ.outStep) + 1);
  lines.push(...OUT.slice(0, n));
  return { lines, cursor: true };
}

const DOCK = ['firefox', 'kitty', 'cursor', 'claude', 'docker'] as const;
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

  // kitty: no title bar, centred, with its own (smaller) font so ~100 columns fit and the
  // fastfetch logo sits beside the info with room to breathe, like on Arthur's screen
  const tb = 0;
  const tw = narrow ? vw - f * 1.4 : Math.min(vw * 0.86, 1240);
  const tx = (vw - tw) / 2;
  const tpad = narrow ? 12 : 18;
  const tf = Math.min(15, Math.max(narrow ? 9 : 10, (tw - tpad * 2) / (100 * 0.6)));
  const tLineH = tf * 1.42;
  const tcw = tf * 0.6;
  const ty = topH + (narrow ? f * 1.2 : vh * 0.045);
  const th = narrow ? vh * 0.56 : dock.y - f * 1.2 - ty;
  const term = { x: tx, y: ty, w: tw, h: th, tb, pad: tpad, f: tf, lineH: tLineH, cw: tcw, rows: Math.floor((th - tb - tpad * 2) / tLineH), cols: Math.floor((tw - tpad * 2) / tcw) };
  const logo = term.cols >= LOGO_W + 2 + 40; // logo beside the info; info alone when narrower

  const ff = narrow
    ? { x: f * 0.7, y: topH + vh * 0.1, w: vw - f * 1.4, h: vh * 0.7 }
    : { x: vw * 0.33, y: topH + vh * 0.05, w: vw * 0.63, h: Math.min(vh * 0.76, dock.y - f - topH - vh * 0.05) };
  const chrome = { tab: Math.round(f * 2.4), nav: Math.round(f * 2.5) };

  return { vw, vh, f, lineH, cw, topH, narrow, dock, term, logo, ff, chrome, r: f * 0.8 };
}

export function clock() {
  const d = new Date();
  const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const hm = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day}  ${hm}`;
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

  // wallpaper: the room's purple-black with the lamp's persimmon glow, so when the browser
  // grows to fullscreen the desktop is already the colour of the site
  const lin = ctx.createLinearGradient(0, 0, 0, L.vh);
  lin.addColorStop(0, '#15121d');
  lin.addColorStop(1, '#0b0a10');
  ctx.fillStyle = lin;
  ctx.fillRect(x0, y0, W, H);
  const M = Math.max(L.vw, L.vh);
  for (const [bx, by, br, col] of [
    [0.12, 0.1, 0.5, 'rgba(140,100,220,0.14)'],
    [0.85, 0.95, 0.6, 'rgba(255,92,52,0.2)'],
  ] as [number, number, number, string][]) {
    const g = ctx.createRadialGradient(bx * L.vw, by * L.vh, 0, bx * L.vw, by * L.vh, br * M);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, W, H);
  }

  drawDock(ctx, L, st.ffRunning);
  drawTerminal(ctx, L, s, st);

  // COSMIC panel (slides up when the browser goes fullscreen)
  ctx.save();
  ctx.translate(0, -L.topH * st.topOff);
  ctx.fillStyle = K.topbar;
  ctx.fillRect(x0, y0 - L.topH, W, L.topH * 2 + oy / s);
  const cy = L.topH / 2;
  ctx.font = `600 ${L.f * 0.74}px ${SANS}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let lx = L.f * 0.9;
  for (const label of ['Workspaces', 'Applications']) {
    const w = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    pill(ctx, lx - L.f * 0.55, cy - L.f * 0.62, w + L.f * 1.1, L.f * 1.24);
    ctx.fillStyle = '#ececec';
    ctx.fillText(label, lx, cy + 0.5);
    lx += w + L.f * 1.6;
  }
  ctx.fillStyle = '#ffffff';
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
  ctx.fillStyle = 'rgba(22,20,28,0.88)';
  ctx.beginPath();
  ctx.roundRect(d.x, d.y, d.w, d.h, L.r * 2);
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
    if (a === 'kitty' || (a === 'firefox' && ffRunning)) {
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
    case 'kitty': {
      rr('#2a2633');
      // a cat's head: two ears and a round face, like kitty's own icon
      ctx.fillStyle = '#f2e9de';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.27, cy - s * 0.02);
      ctx.lineTo(cx - s * 0.22, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.06, cy - s * 0.16);
      ctx.lineTo(cx + s * 0.06, cy - s * 0.16);
      ctx.lineTo(cx + s * 0.22, cy - s * 0.3);
      ctx.lineTo(cx + s * 0.27, cy - s * 0.02);
      ctx.quadraticCurveTo(cx + s * 0.28, cy + s * 0.24, cx, cy + s * 0.25);
      ctx.quadraticCurveTo(cx - s * 0.28, cy + s * 0.24, cx - s * 0.27, cy - s * 0.02);
      ctx.fill();
      ctx.fillStyle = '#2a2633';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + sx * s * 0.1, cy + s * 0.02, s * 0.03, s * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
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
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(t.x + 0.5, t.y + 0.5, t.w - 1, t.h - 1, L.r);
  ctx.stroke();

  // body: last `rows` lines, like a real scrolling terminal
  const { lines, cursor } = termLines(L.logo, st.pre, st.seq);
  const vis = lines.slice(-t.rows);
  ctx.save();
  ctx.beginPath();
  ctx.rect(t.x, t.y + t.tb, t.w, t.h - t.tb);
  ctx.clip();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const left = t.x + t.pad;
  const top = t.y + t.tb + t.pad;
  let endX = left;
  vis.forEach((line, row) => {
    const y = top + t.lineH * (row + 0.5);
    endX = drawSegs(ctx, t, line, left, y);
    if (line.right) {
      const w = line.right.reduce((a, g) => a + g.t.length * t.cw, 0);
      drawSegs(ctx, t, line.right, t.x + t.w - t.pad - w, y);
    }
  });
  if (cursor && st.blink) {
    const y = top + t.lineH * (vis.length - 0.5);
    ctx.fillStyle = K.text;
    ctx.fillRect(endX + 1, y - t.lineH * 0.42, Math.max(1.5, t.f * 0.1), t.lineH * 0.84); // kitty's beam cursor
  }
  ctx.restore();
}

/** Draws one run of cells (text, capsule backgrounds, powerline shapes, icons); returns the end x. */
function drawSegs(ctx: Ctx, m: Layout['term'], segs: Seg[], x: number, y: number) {
  const h = m.lineH * 0.9;
  const top = y - h / 2;
  for (const seg of segs) {
    const w = seg.t.length * m.cw;
    if (seg.bg) {
      ctx.fillStyle = seg.bg;
      ctx.fillRect(x - 0.5, top, w + 1, h);
    }
    if (seg.arrow) tri(ctx, seg.arrow, x, top, w, h, 1);
    if (seg.arrowL) tri(ctx, seg.arrowL, x, top, w, h, -1);
    if (seg.chev) chevron(ctx, seg.chev, x, top, w, h, 1);
    if (seg.chevL) chevron(ctx, seg.chevL, x, top, w, h, -1);
    if (seg.capL || seg.capR) {
      ctx.fillStyle = (seg.capL ?? seg.capR)!;
      ctx.beginPath();
      if (seg.capL) ctx.arc(x + w, y, h / 2, Math.PI / 2, -Math.PI / 2);
      else ctx.arc(x, y, h / 2, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
    }
    if (seg.icon) drawGlyph(ctx, seg.icon, x + w * 0.45, y, h * 0.62, seg.c ?? K.text, seg.bg ?? '#000');
    else if (seg.t.trim()) {
      ctx.fillStyle = seg.c ?? K.text;
      ctx.font = `${seg.b ? 700 : 400} ${m.f}px ${MONO}`;
      ctx.fillText(seg.t, x, y);
    }
    x += w;
  }
  return x;
}

/** Powerline separator: a solid triangle pointing right (dir 1) or left (-1). */
function tri(ctx: Ctx, c: string, x: number, top: number, w: number, h: number, dir: 1 | -1) {
  ctx.fillStyle = c;
  ctx.beginPath();
  if (dir === 1) {
    ctx.moveTo(x - 0.5, top);
    ctx.lineTo(x + w, top + h / 2);
    ctx.lineTo(x - 0.5, top + h);
  } else {
    ctx.moveTo(x + w + 0.5, top);
    ctx.lineTo(x, top + h / 2);
    ctx.lineTo(x + w + 0.5, top + h);
  }
  ctx.fill();
}

/** Thick chevron, the decorative tail of the prompt. */
function chevron(ctx: Ctx, c: string, x: number, top: number, w: number, h: number, dir: 1 | -1) {
  const k = w * 0.55;
  ctx.fillStyle = c;
  ctx.beginPath();
  if (dir === 1) {
    ctx.moveTo(x - w * 0.2, top);
    ctx.lineTo(x - w * 0.2 + k, top);
    ctx.lineTo(x + w, top + h / 2);
    ctx.lineTo(x - w * 0.2 + k, top + h);
    ctx.lineTo(x - w * 0.2, top + h);
    ctx.lineTo(x + w - k, top + h / 2);
  } else {
    ctx.moveTo(x + w * 1.2, top);
    ctx.lineTo(x + w * 1.2 - k, top);
    ctx.lineTo(x, top + h / 2);
    ctx.lineTo(x + w * 1.2 - k, top + h);
    ctx.lineTo(x + w * 1.2, top + h);
    ctx.lineTo(x + k, top + h / 2);
  }
  ctx.closePath();
  ctx.fill();
}

/** The prompt's small icons (Nerd Font glyphs in the real terminal). */
function drawGlyph(ctx: Ctx, icon: Icon, cx: number, cy: number, s: number, c: string, bg: string) {
  ctx.save();
  ctx.fillStyle = c;
  ctx.strokeStyle = c;
  ctx.lineWidth = s * 0.14;
  ctx.lineCap = 'round';
  switch (icon) {
    case 'fedora':
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = s * 0.13;
      ctx.beginPath();
      ctx.arc(cx + s * 0.06, cy - s * 0.1, s * 0.16, Math.PI, Math.PI * 1.9, false);
      ctx.moveTo(cx - s * 0.1, cy - s * 0.12);
      ctx.lineTo(cx - s * 0.1, cy + s * 0.3);
      ctx.moveTo(cx - s * 0.26, cy + s * 0.04);
      ctx.lineTo(cx + s * 0.08, cy + s * 0.04);
      ctx.stroke();
      break;
    case 'folder':
      ctx.beginPath();
      ctx.roundRect(cx - s * 0.5, cy - s * 0.3, s * 0.42, s * 0.2, s * 0.05);
      ctx.roundRect(cx - s * 0.5, cy - s * 0.2, s, s * 0.6, s * 0.08);
      ctx.fill();
      break;
    case 'branch':
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, cy - s * 0.32);
      ctx.lineTo(cx - s * 0.22, cy + s * 0.32);
      ctx.moveTo(cx + s * 0.24, cy - s * 0.18);
      ctx.quadraticCurveTo(cx + s * 0.24, cy + s * 0.08, cx - s * 0.2, cy + s * 0.14);
      ctx.stroke();
      for (const [px, py] of [[-0.22, -0.36], [-0.22, 0.36], [0.24, -0.24]]) {
        ctx.beginPath();
        ctx.arc(cx + px * s, cy + py * s, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'battery':
      ctx.lineWidth = s * 0.1;
      ctx.strokeRect(cx - s * 0.2, cy - s * 0.38, s * 0.4, s * 0.8);
      ctx.fillRect(cx - s * 0.08, cy - s * 0.5, s * 0.16, s * 0.1);
      ctx.fillRect(cx - s * 0.12, cy - s * 0.28, s * 0.24, s * 0.62);
      break;
  }
  ctx.restore();
}
