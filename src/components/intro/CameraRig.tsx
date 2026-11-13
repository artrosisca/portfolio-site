import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SCREEN_POS } from './objects/Monitor';

const POS = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.5, 1.55, 3.3),
  new THREE.Vector3(-1.1, 1.45, 2.2),
  new THREE.Vector3(-0.35, 1.28, 1.1),
  SCREEN_POS.clone().add(new THREE.Vector3(0, 0, 0.3)),
]);
const LOOK = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.3, 0.8, -0.1),
  new THREE.Vector3(0.05, 1.0, -0.15),
  new THREE.Vector3(0, 1.12, -0.25),
  SCREEN_POS.clone(),
]);

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

export function CameraRig({ progress, reduced }: { progress: RefObject<number>; reduced: boolean }) {
  const { camera } = useThree();
  const smooth = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const target = progress.current ?? 0;
    smooth.current = reduced ? target : THREE.MathUtils.damp(smooth.current, target, 6, dt);
    const p = ease(smooth.current);
    POS.getPointAt(p, tmp.p);
    LOOK.getPointAt(p, tmp.l);

    // parallax + idle breathing, fading out as we approach the screen
    const fade = 1 - p;
    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 4, dt);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 4, dt);
    const t = state.clock.elapsedTime;
    tmp.p.x += (pointer.current.x * 0.12 + Math.sin(t * 0.4) * 0.03) * fade;
    tmp.p.y += (pointer.current.y * 0.06 + Math.sin(t * 0.6) * 0.015) * fade;

    // portrait screens: pull the camera back so the whole desk fits at the start
    if (state.viewport.aspect < 1) {
      const dir = tmp.p.clone().sub(tmp.l).normalize();
      tmp.p.addScaledVector(dir, 1.3 * fade);
    }
    camera.position.copy(tmp.p);
    camera.lookAt(tmp.l);
  });
  return null;
}
