import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ARRIVE, SCREEN_POS, arrival } from './constants';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * One parameter drives everything: position follows a quadratic Bézier whose last
 * segment is aligned with the screen normal, and the look target reaches the screen
 * centre before the camera does. The final approach is therefore a straight dolly.
 */
export function CameraRig({ progress }: { progress: RefObject<number> }) {
  const { camera, size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), p: new THREE.Vector3(), l: new THREE.Vector3(), l0: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const aspect = size.width / size.height;
    const portrait = aspect < 1;
    const { dist } = arrival(aspect);

    // start: desktop frames the desk to the right of the headline; portrait pulls back and lowers it
    if (portrait) {
      v.a.set(-0.05, 1.95, 4.4);
      v.l0.set(0.12, 1.62, -0.2);
    } else {
      v.a.set(-0.45, 1.5, 3.25);
      v.l0.set(-0.2, 1.02, -0.1);
    }
    const end = v.c.set(SCREEN_POS.x, SCREEN_POS.y, SCREEN_POS.z + dist);
    v.b.set(end.x, end.y + 0.04, end.z + 1.1);

    const t = easeInOut(Math.min(1, (progress.current ?? 0) / ARRIVE));
    const u = 1 - t;
    v.p.set(0, 0, 0).addScaledVector(v.a, u * u).addScaledVector(v.b, 2 * u * t).addScaledVector(end, t * t);
    const lt = Math.min(1, t / 0.75);
    v.l.lerpVectors(v.l0, SCREEN_POS, lt * lt * (3 - 2 * lt));

    // idle sway + pointer parallax, gone by the time we reach the screen
    const fade = Math.pow(1 - t, 2);
    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 3, dt);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 3, dt);
    const time = state.clock.elapsedTime;
    v.p.x += (pointer.current.x * 0.1 + Math.sin(time * 0.35) * 0.025) * fade;
    v.p.y += (pointer.current.y * 0.05 + Math.sin(time * 0.5) * 0.012) * fade;

    camera.position.copy(v.p);
    camera.lookAt(v.l);
  });
  return null;
}
