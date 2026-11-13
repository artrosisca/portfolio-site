import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SCREEN_W = 0.62;
export const SCREEN_H = 0.35;
export const SCREEN_POS = new THREE.Vector3(0, 1.16, -0.25);

const LINES = [
  '❯ whoami',
  'arthur rosisca · full-stack & dados',
  '❯ ./portfolio --start',
  'iniciando sessão…',
];

export function Monitor() {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 576;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);
  const start = useRef<number>(0);
  const lastDrawn = useRef(-1);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    if (!start.current) start.current = clock.elapsedTime;
    const t = clock.elapsedTime - start.current;
    // ~22 chars/second typing, lines appear sequentially
    const charsVisible = Math.floor(t * 22);
    const blink = Math.floor(t * 2) % 2 === 0;
    const key = charsVisible * 2 + (blink ? 1 : 0);
    if (key === lastDrawn.current) return;
    lastDrawn.current = key;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '500 34px "JetBrains Mono", ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'top';
    let budget = charsVisible;
    let y = 64;
    for (const line of LINES) {
      if (budget <= 0) break;
      const shown = line.slice(0, budget);
      ctx.fillStyle = line.startsWith('❯') ? '#f2a33a' : '#d9d4c7';
      ctx.fillText(shown, 64, y);
      if (shown.length < line.length) {
        if (blink) ctx.fillRect(64 + ctx.measureText(shown).width + 6, y + 4, 16, 36);
        budget = 0;
        break;
      }
      budget -= line.length + 8; // pause between lines
      y += 56;
    }
    if (budget > 0 && blink) ctx.fillRect(64, y + 4, 16, 36);
    texture.needsUpdate = true;
  });

  const [x, y, z] = SCREEN_POS.toArray();
  return (
    <group position={[x, y, z]}>
      {/* bezel */}
      <mesh position={[0, 0, -0.012]} castShadow>
        <boxGeometry args={[SCREEN_W + 0.04, SCREEN_H + 0.04, 0.025]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* screen */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* faint glow of the screen on the desk */}
      <pointLight position={[0, -0.05, 0.25]} color="#d9c9a8" intensity={0.35} distance={1.4} decay={2} />
      {/* stand */}
      <mesh position={[0, -SCREEN_H / 2 - 0.09, -0.04]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
        <meshStandardMaterial color="#1a1c21" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -SCREEN_H / 2 - 0.175, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.13, 0.015, 32]} />
        <meshStandardMaterial color="#1a1c21" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}
