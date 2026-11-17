import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { C, DESK_Y, SCREEN_H, SCREEN_POS, SCREEN_W } from '../constants';
import { BOOT_LINES, MONO, arrival, termMetrics } from '../terminal';

const TW = 2048;
const TH = 1152;

export function Monitor({ progress }: { progress: RefObject<number> }) {
  const size = useThree((s) => s.size);
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = TW;
    c.height = TH;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const last = useRef('');

  useEffect(() => {
    // redraw once the webfont is ready so canvas and DOM text match
    document.fonts?.load(`500 20px ${MONO}`).then(() => (last.current = ''));
    return () => texture.dispose();
  }, [texture]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const total = BOOT_LINES.reduce((n, l) => n + l.length + 10, 0);
    // typed over time; forced complete once the camera is on its way in
    const chars = (progress.current ?? 0) > 0.35 ? total : Math.floor(Math.max(0, t - 0.8) * 20);
    const blink = Math.floor(t * 2) % 2 === 0;
    const key = `${Math.min(chars, total)}|${blink}|${size.width}x${size.height}`;
    if (key === last.current) return;
    last.current = key;

    // Lay text out inside the part of the screen visible at arrival, at the
    // exact scale the DOM terminal uses, so the handoff is pixel-aligned.
    const { fx, fy } = arrival(size.width / size.height);
    const safeW = TW * fx;
    const safeH = TH * fy;
    const ox = (TW - safeW) / 2;
    const oy = (TH - safeH) / 2;
    const s = safeW / size.width;
    const m = termMetrics(size.width, size.height);

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, TW, TH);
    ctx.font = `400 ${m.font * s}px ${MONO}`;
    ctx.textBaseline = 'middle';
    let budget = chars;
    let row = 0;
    let cx = ox + m.padX * s;
    for (const line of BOOT_LINES) {
      const y = oy + (m.padY + m.lineH * (row + 0.5)) * s;
      if (budget <= 0) break;
      const shown = line.slice(0, budget);
      ctx.fillStyle = line.startsWith('$') ? C.amber : '#d9d4c7';
      ctx.fillText(shown, ox + m.padX * s, y);
      cx = ox + m.padX * s + ctx.measureText(shown).width;
      budget -= line.length + 10;
      if (budget > 0) {
        row++;
        cx = ox + m.padX * s;
      }
    }
    if (blink) {
      ctx.fillStyle = C.amber;
      const y = oy + (m.padY + m.lineH * (row + 0.5)) * s;
      ctx.fillRect(cx + 4 * s, y - m.font * 0.55 * s, m.font * 0.55 * s, m.font * 1.1 * s);
    }
    texture.needsUpdate = true;
  });

  const baseY = DESK_Y - SCREEN_POS.y;
  return (
    <group position={SCREEN_POS}>
      <RoundedBox args={[SCREEN_W + 0.03, SCREEN_H + 0.03, 0.028]} radius={0.012} smoothness={3} position={[0, 0, -0.016]} castShadow>
        <meshStandardMaterial color={C.plastic} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* power led */}
      <mesh position={[SCREEN_W / 2 - 0.02, -SCREEN_H / 2 - 0.007, 0]}>
        <circleGeometry args={[0.0025, 12]} />
        <meshBasicMaterial color={[3, 1.8, 0.5]} toneMapped={false} />
      </mesh>
      {/* stand */}
      <RoundedBox args={[0.06, 0.26, 0.02]} radius={0.008} smoothness={2} position={[0, -0.2, -0.05]} castShadow>
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.26, 0.014, 0.17]} radius={0.006} smoothness={2} position={[0, baseY + 0.007, -0.03]} castShadow receiveShadow>
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </RoundedBox>
      {/* the screen lights the desk in front of it */}
      <pointLight position={[0, -0.05, 0.3]} color="#c8d0ff" intensity={0.5} distance={1.6} decay={2} />
    </group>
  );
}
