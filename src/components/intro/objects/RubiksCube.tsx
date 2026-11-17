import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { DESK_Y } from '../constants';

// +x, -x, +y, -y, +z, -z
const FACE_COLORS = ['#e5483b', '#f59331', '#f6f2e7', '#f7d53a', '#39a85a', '#3a78e0'];
const NORMALS: [number, number, number][] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const SIZE = 0.036;
const STEP = SIZE + 0.002;

function Cubie({ ix, iy, iz }: { ix: number; iy: number; iz: number }) {
  const idx = [ix, iy, iz];
  return (
    <group position={[ix * STEP, iy * STEP, iz * STEP]}>
      <RoundedBox args={[SIZE, SIZE, SIZE]} radius={0.005} smoothness={2} castShadow>
        <meshStandardMaterial color="#14141a" roughness={0.6} />
      </RoundedBox>
      {NORMALS.map((n, f) => {
        const axis = n.findIndex((v) => v !== 0);
        if (idx[axis] !== n[axis]) return null;
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...n));
        return (
          <mesh key={f} position={[n[0] * (SIZE / 2 + 0.0004), n[1] * (SIZE / 2 + 0.0004), n[2] * (SIZE / 2 + 0.0004)]} quaternion={q}>
            <planeGeometry args={[SIZE * 0.8, SIZE * 0.8]} />
            <meshStandardMaterial color={FACE_COLORS[f]} roughness={0.4} emissive={FACE_COLORS[f]} emissiveIntensity={0.12} />
          </mesh>
        );
      })}
    </group>
  );
}

export function RubiksCube() {
  const top = useRef<THREE.Group>(null);
  const coords = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) out.push([x, y, z]);
    return out;
  }, []);

  // The top layer keeps the same nine cubies, so it can keep turning forever.
  useFrame(({ clock }) => {
    if (!top.current) return;
    const period = 3.6;
    const step = Math.floor(clock.elapsedTime / period);
    const k = Math.min(1, Math.max(0, ((clock.elapsedTime % period) - 1) / 0.6));
    const e = k < 0.5 ? 4 * k ** 3 : 1 - Math.pow(-2 * k + 2, 3) / 2;
    top.current.rotation.y = (step + e) * (Math.PI / 2);
  });

  return (
    <group position={[0.52, DESK_Y + STEP * 1.5 + 0.002, 0.2]} rotation={[0, 0.6, 0]}>
      {coords.filter((c) => c[1] !== 1).map(([x, y, z]) => <Cubie key={`${x}${y}${z}`} ix={x} iy={y} iz={z} />)}
      <group ref={top}>
        {coords.filter((c) => c[1] === 1).map(([x, y, z]) => <Cubie key={`${x}${y}${z}`} ix={x} iy={y} iz={z} />)}
      </group>
    </group>
  );
}
