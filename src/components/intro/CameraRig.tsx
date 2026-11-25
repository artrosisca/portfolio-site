import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ARRIVE, SCREEN_POS, arrival } from './constants';

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Framing at progress 0, per orientation. Angles in radians around the screen centre. */
const START = {
  wide: { az: -0.8, el: 0.3, r: 3.4, roll: 0.06, look: new THREE.Vector3(-0.55, 1.18, -0.45) },
  tall: { az: -0.75, el: 0.5, r: 4.6, roll: 0.05, look: new THREE.Vector3(0.15, 1.15, -0.15) },
};

/**
 * The camera orbits the screen centre: it starts high and off to the side of the desk,
 * swings round and down while scrolling, and only dollies in once it is nearly facing
 * the screen, so the last part is a straight push into it.
 */
export function CameraRig({ progress }: { progress: RefObject<number> }) {
  const { camera, size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const v = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3(), fwd: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const aspect = size.width / size.height;
    const s = aspect < 1 ? START.tall : START.wide;
    const { dist } = arrival(aspect);
    const t = Math.min(1, (progress.current ?? 0) / ARRIVE);

    // swing first, descend a bit later, push in last
    const kAz = smooth(0, 0.78, t);
    const kEl = smooth(0.08, 0.85, t);
    const kR = smooth(0.25, 1, t);
    const az = s.az * (1 - kAz);
    const el = s.el * (1 - kEl);
    const r = s.r + (dist - s.r) * kR;
    v.p.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(r).add(SCREEN_POS);
    v.l.lerpVectors(s.look, SCREEN_POS, smooth(0, 0.82, t));

    // idle sway + pointer parallax, gone by the time we reach the screen
    const fade = Math.pow(1 - t, 2);
    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 3, dt);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 3, dt);
    const time = state.clock.elapsedTime;
    v.p.x += (pointer.current.x * 0.12 + Math.sin(time * 0.35) * 0.03) * fade;
    v.p.y += (pointer.current.y * 0.06 + Math.sin(time * 0.5) * 0.015) * fade;

    camera.position.copy(v.p);
    camera.lookAt(v.l);
    // slight dutch angle that levels out as we line up with the screen
    camera.rotateZ(s.roll * (1 - smooth(0, 0.7, t)));
  });
  return null;
}
