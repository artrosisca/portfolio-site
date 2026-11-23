import { useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { C, DESK_Y } from '../constants';

const P = 0.0195; // key pitch (1u)
const CAP = 0.0165;
/** Sofle column stagger in key units, outer pinky → inner index (positive = further away). */
const STAGGER = [0, 0, 0.25, 0.375, 0.25, 0.125];

type Key = { x: number; z: number; rot: number; tone: 'alpha' | 'mod' | 'accent' };

/** One half of a Sofle: 6×4 columnar-staggered keys, 5-key thumb row, OLED and encoder. */
function halfKeys(): Key[] {
  const keys: Key[] = [];
  for (let c = 0; c < 6; c++)
    for (let r = 0; r < 4; r++)
      keys.push({ x: c * P, z: (r - STAGGER[c]) * P, rot: 0, tone: c === 0 ? 'mod' : 'alpha' });
  // thumb row: under columns 1-4, the innermost key fanned out
  for (let c = 1; c <= 4; c++) keys.push({ x: c * P, z: (4 - STAGGER[c] * 0.5) * P, rot: 0, tone: 'mod' });
  keys.push({ x: 5.25 * P, z: 4.35 * P, rot: -0.35, tone: 'accent' });
  return keys;
}

function Half({ side }: { side: -1 | 1 }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const keys = useMemo(halfKeys, []);
  // local frame: x grows toward the middle of the desk; mirrored for the right half
  const ox = 3 * P;
  const oz = 2 * P;

  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    keys.forEach((k, i) => {
      d.position.set(-side * (k.x - ox), 0.016, k.z - oz);
      d.rotation.set(0, side * k.rot, 0);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, col.set(k.tone === 'accent' ? C.amber : k.tone === 'mod' ? '#4a4e5e' : '#c9c1ae'));
    });
    // left half escape key in amber too
    if (side === -1) m.setColorAt(0, col.set(C.amber));
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [keys, side, ox, oz]);

  const inner = -side * (6.15 * P - ox); // x of the OLED/encoder column
  return (
    <group>
      {/* case: main block + thumb wing */}
      <RoundedBox args={[6 * P + 0.012, 0.012, 4.4 * P + 0.012]} radius={0.004} smoothness={2} position={[-side * (2.5 * P - ox), 0.006, (1.35 * P) - oz]} castShadow receiveShadow>
        <meshStandardMaterial color="#26283a" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[5.3 * P, 0.012, 1.6 * P]} radius={0.004} smoothness={2} position={[-side * (3.4 * P - ox), 0.006, 4.1 * P - oz]} rotation={[0, side * -0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#26283a" roughness={0.55} />
      </RoundedBox>
      {/* OLED + encoder column */}
      <RoundedBox args={[1.1 * P, 0.012, 3.4 * P]} radius={0.004} smoothness={2} position={[inner, 0.006, 1.2 * P - oz]} castShadow receiveShadow>
        <meshStandardMaterial color="#26283a" roughness={0.55} />
      </RoundedBox>
      <mesh position={[inner, 0.0135, 0.55 * P - oz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.75 * P, 1.6 * P]} />
        <meshBasicMaterial color={[0.35, 0.75, 1.4]} toneMapped={false} />
      </mesh>
      <mesh position={[inner, 0.02, 2.35 * P - oz]} castShadow>
        <cylinderGeometry args={[0.0075, 0.0075, 0.014, 20]} />
        <meshStandardMaterial color="#9a9aa6" metalness={0.8} roughness={0.3} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, keys.length]} castShadow>
        <boxGeometry args={[CAP, 0.009, CAP]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </group>
  );
}

/** Sofle split keyboard (halves angled for the forearms), TRRS cable, and a mouse. */
export function Keyboard() {
  const cable = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.065, 0.008, -0.05),
      new THREE.Vector3(-0.03, 0.003, -0.085),
      new THREE.Vector3(0.03, 0.003, -0.085),
      new THREE.Vector3(0.065, 0.008, -0.05),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.0018, 6, false);
  }, []);
  return (
    // stylized scale, like the other props, so the split shape reads from across the room
    <group position={[0, DESK_Y + 0.006, 0.13]} scale={1.35}>
      <group position={[-0.105, 0, 0]} rotation={[0, -0.2, 0]}>
        <Half side={-1} />
      </group>
      <group position={[0.105, 0, 0]} rotation={[0, 0.2, 0]}>
        <Half side={1} />
      </group>
      <mesh geometry={cable}>
        <meshStandardMaterial color={C.amber} roughness={0.5} />
      </mesh>
      {/* VXE Dragonfly R1 Pro Max: small, symmetrical, low hump, matte black */}
      <group position={[0.29, 0, 0.03]} rotation={[0, -0.08, 0]}>
        <mesh position={[0, 0.011, 0]} scale={[0.78, 0.42, 1.22]} castShadow>
          <sphereGeometry args={[0.026, 24, 16]} />
          <meshStandardMaterial color="#111216" roughness={0.55} />
        </mesh>
        {/* button split + scroll wheel */}
        <mesh position={[0, 0.0205, -0.017]}>
          <boxGeometry args={[0.0008, 0.002, 0.026]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0.0215, -0.014]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0035, 0.0035, 0.003, 12]} />
          <meshStandardMaterial color="#2b2d35" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
