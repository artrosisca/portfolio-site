import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { C, DESK_Y, SCREEN_H, SCREEN_POS, SCREEN_W, arrival } from '../constants';
import { MONO, PRE, SANS, clock, drawDesktop, layout } from '../desktop';
import { Rod } from './Rod';

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
    Promise.all([document.fonts?.load(`400 16px ${MONO}`), document.fonts?.load(`700 16px ${MONO}`), document.fonts?.load(`600 16px ${SANS}`)]).then(() => (last.current = ''));
    return () => texture.dispose();
  }, [texture]);

  useFrame(({ clock: c }) => {
    const t = c.elapsedTime;
    // `fastfetch` runs shortly after load; forced complete once the camera is on its way in
    const pre = (progress.current ?? 0) > 0.2 ? 99 : Math.min(t, PRE.out + 0.01);
    // no blinking here: every change re-uploads the whole 2048x1152 texture to the GPU
    const blink = true;
    const time = clock();
    const key = `${pre.toFixed(2)}|${time}|${size.width}x${size.height}`;
    if (key === last.current) return;
    last.current = key;

    // The viewport maps onto the part of the screen visible at arrival, at 1:1 with CSS px.
    const { fx } = arrival(size.width / size.height);
    const safeW = TW * fx;
    const s = safeW / size.width;
    const ox = (TW - safeW) / 2;
    const oy = (TH - size.height * s) / 2;
    const ctx = canvas.getContext('2d')!;
    drawDesktop(ctx, layout(size.width, size.height), { ox, oy, s, TW, TH }, { pre, seq: 0, blink, time, ffRunning: false, topOff: 0 });
    texture.needsUpdate = true;
  });

  const baseY = DESK_Y - SCREEN_POS.y; // desk surface, relative to the screen centre
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
      <MonitorArm baseY={baseY} />
      {/* the screen's blue wallpaper tints the desk in front of it */}
      <pointLight position={[0, -0.05, 0.3]} color="#9db4ff" intensity={0.6} distance={1.6} decay={2} />
    </group>
  );
}

type V3 = [number, number, number];

/** Gas-spring monitor arm: clamp on the desk's back edge, pole, two segments, VESA plate. */
function MonitorArm({ baseY }: { baseY: number }) {
  const mat = <meshStandardMaterial color="#1b1d24" metalness={0.6} roughness={0.35} />;
  // clamped on the left, like on the real desk
  const clamp: V3 = [-0.42, baseY, -0.33];
  const poleTop: V3 = [-0.42, baseY + 0.32, -0.33];
  const elbow: V3 = [-0.22, baseY + 0.38, -0.16];
  const head: V3 = [0, -0.02, -0.07];
  return (
    <group>
      {/* clamp over the back edge */}
      <RoundedBox args={[0.07, 0.03, 0.07]} radius={0.006} smoothness={2} position={[clamp[0], baseY + 0.015, clamp[2]]} castShadow>
        {mat}
      </RoundedBox>
      <Rod a={[clamp[0], baseY + 0.02, clamp[2]]} b={poleTop} r={0.013}>{mat}</Rod>
      <Rod a={[poleTop[0], poleTop[1] - 0.01, poleTop[2]]} b={elbow} r={0.012}>{mat}</Rod>
      <Rod a={elbow} b={head} r={0.011}>{mat}</Rod>
      {[poleTop, elbow, head].map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.019, 0.019, 0.03, 16]} />
          {mat}
        </mesh>
      ))}
      {/* tilt joint + VESA plate on the back of the screen */}
      <Rod a={head} b={[0, 0, -0.04]} r={0.01}>{mat}</Rod>
      <RoundedBox args={[0.1, 0.1, 0.008]} radius={0.003} smoothness={2} position={[0, 0, -0.034]}>
        {mat}
      </RoundedBox>
    </group>
  );
}
