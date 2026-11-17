import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { C, DESK_Y, SCREEN_H, SCREEN_POS, SCREEN_W, arrival } from '../constants';
import { BOOT_TOTAL, MONO, clock, drawDesktop, layout } from '../desktop';

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
    document.fonts?.load(`400 16px ${MONO}`).then(() => (last.current = ''));
    return () => texture.dispose();
  }, [texture]);

  useFrame(({ clock: c }) => {
    const t = c.elapsedTime;
    // typed over time; forced complete once the camera is on its way in
    const chars = (progress.current ?? 0) > 0.35 ? BOOT_TOTAL : Math.min(BOOT_TOTAL, Math.floor(Math.max(0, t - 0.8) * 22));
    const blink = Math.floor(t * 2) % 2 === 0;
    const time = clock();
    const key = `${chars}|${blink}|${time}|${size.width}x${size.height}`;
    if (key === last.current) return;
    last.current = key;

    // The viewport maps onto the part of the screen visible at arrival, at 1:1 with CSS px.
    const { fx } = arrival(size.width / size.height);
    const safeW = TW * fx;
    const s = safeW / size.width;
    const ox = (TW - safeW) / 2;
    const oy = (TH - size.height * s) / 2;
    const ctx = canvas.getContext('2d')!;
    drawDesktop(ctx, layout(size.width, size.height), { ox, oy, s, TW, TH }, { chars, blink, time });
    texture.needsUpdate = true;
  });

  const baseY = DESK_Y - SCREEN_POS.y;
  return (
    <group position={SCREEN_POS}>
      <RoundedBox args={[SCREEN_W + 0.03, SCREEN_H + 0.03, 0.028]} radius={0.012} smoothness={3} position={[0, 0, -0.016]} castShadow>
        <meshStandardMaterial color={C.plastic} roughness={0.45} />
      </RoundedBox>
      <mesh>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[SCREEN_W / 2 - 0.02, -SCREEN_H / 2 - 0.007, 0]}>
        <circleGeometry args={[0.0025, 12]} />
        <meshBasicMaterial color={[3, 1.8, 0.5]} toneMapped={false} />
      </mesh>
      <RoundedBox args={[0.06, 0.26, 0.02]} radius={0.008} smoothness={2} position={[0, -0.2, -0.05]} castShadow>
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.26, 0.014, 0.17]} radius={0.006} smoothness={2} position={[0, baseY + 0.007, -0.03]} castShadow receiveShadow>
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </RoundedBox>
      {/* the screen glows purple-amber now, so tint its light on the desk to match */}
      <pointLight position={[0, -0.05, 0.3]} color="#c9a8ff" intensity={0.6} distance={1.6} decay={2} />
    </group>
  );
}
