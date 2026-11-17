import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';

type V3 = [number, number, number];
const UP = new THREE.Vector3(0, 1, 0);

/** Cylinder between two points. */
export function Rod({ a, b, r = 0.008, children }: { a: V3; b: V3; r?: number; children: ReactNode }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    return {
      pos: va.clone().add(vb).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      len: dir.length(),
    };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[r, r, len, 10]} />
      {children}
    </mesh>
  );
}
