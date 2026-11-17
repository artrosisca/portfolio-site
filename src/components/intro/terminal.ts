import { SCREEN_H, SCREEN_W, FOV } from './constants';

/** Lines already on the 3D monitor. The DOM terminal continues from here. */
export const BOOT_LINES = ['$ whoami', 'arthur rosisca — full-stack & dados', '$ ./portfolio --start'];
export const MONO = '"JetBrains Mono Variable", ui-monospace, Menlo, monospace';

/** Terminal text metrics in CSS px, shared by the canvas texture and the DOM overlay. */
export function termMetrics(vw: number, vh: number) {
  const font = Math.min(24, Math.max(13, vw * 0.009 + 10));
  return { font, lineH: font * 1.75, padX: Math.max(24, vw * 0.06), padY: Math.max(72, vh * 0.16) };
}

/** Distance at which the screen exactly covers the viewport, and the visible fraction of it. */
export function arrival(aspect: number) {
  const tan = Math.tan((FOV * Math.PI) / 360);
  const visH = Math.min(SCREEN_H, SCREEN_W / aspect) * 0.985;
  return { dist: visH / (2 * tan), fx: (visH * aspect) / SCREEN_W, fy: visH / SCREEN_H };
}
