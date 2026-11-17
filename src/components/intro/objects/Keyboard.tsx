import { useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { C, DESK_Y } from '../constants';

const COLS = 14;
const ROWS = 5;
const PITCH = 0.0205;

export function Keyboard() {
  const inst = useRef<THREE.InstancedMesh>(null);
  const keys = useMemo(() => {
    const out: { x: number; z: number; w: number; accent: boolean }[] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (r === ROWS - 1 && c >= 4 && c <= 8) {
          if (c === 6) out.push({ x: c, z: r, w: 5, accent: false }); // space bar
          continue;
        }
        out.push({ x: c, z: r, w: 1, accent: (r === 0 && c === 0) || (r === 2 && c === COLS - 1) });
      }
    return out;
  }, []);

  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    keys.forEach((k, i) => {
      d.position.set((k.x - (COLS - 1) / 2) * PITCH, 0.014, (k.z - (ROWS - 1) / 2) * PITCH);
      d.scale.set(k.w === 1 ? 1 : k.w + 0.12, 1, 1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, col.set(k.accent ? C.amber : '#b9b2a2'));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [keys]);

  return (
    <group position={[0, DESK_Y + 0.006, 0.12]}>
      <RoundedBox args={[COLS * PITCH + 0.016, 0.018, ROWS * PITCH + 0.016]} radius={0.006} smoothness={2} position={[0, 0.009, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3a3d4d" roughness={0.6} />
      </RoundedBox>
      <instancedMesh ref={inst} args={[undefined, undefined, keys.length]} castShadow>
        <boxGeometry args={[0.017, 0.01, 0.017]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      {/* mouse */}
      <mesh position={[0.3, 0.014, 0.02]} scale={[1, 0.55, 1.6]} castShadow>
        <sphereGeometry args={[0.026, 20, 14]} />
        <meshStandardMaterial color="#e9e2d0" roughness={0.6} />
      </mesh>
    </group>
  );
}
