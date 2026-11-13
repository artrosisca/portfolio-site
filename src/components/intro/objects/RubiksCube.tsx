import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// +x right, -x left, +y up, -y down, +z front, -z back
const FACE_COLORS = ['#e23a2e', '#f08a1c', '#f5f5f0', '#f5d518', '#1f9c3a', '#1f63d6'];
const BLACK = '#0a0a0c';

function cubieMaterials(ix: number, iy: number, iz: number) {
  const mats: THREE.MeshStandardMaterial[] = [];
  const outer = [ix === 1, ix === -1, iy === 1, iy === -1, iz === 1, iz === -1];
  for (let f = 0; f < 6; f++) {
    mats.push(
      new THREE.MeshStandardMaterial({
        color: outer[f] ? FACE_COLORS[f] : BLACK,
        roughness: outer[f] ? 0.35 : 0.8,
        metalness: 0,
      }),
    );
  }
  return mats;
}

const SIZE = 0.042; // cubie size
const GAP = 0.004;

export function RubiksCube({ position = [0.7, 0.76, 0.15] as [number, number, number] }) {
  const topLayer = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(SIZE, SIZE, SIZE), []);
  const cubies = useMemo(() => {
    const list: { pos: [number, number, number]; mats: THREE.MeshStandardMaterial[]; top: boolean }[] = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          const s = SIZE + GAP;
          list.push({ pos: [x * s, y * s, z * s], mats: cubieMaterials(x, y, z), top: y === 1 });
        }
    return list;
  }, []);

  // Twist the top layer a quarter turn every few seconds.
  useFrame(({ clock }) => {
    if (!topLayer.current) return;
    const period = 4.5;
    const t = clock.elapsedTime % period;
    const step = Math.floor(clock.elapsedTime / period);
    const twistDur = 0.7;
    const local = Math.min(1, Math.max(0, (t - 1.2) / twistDur));
    const eased = local < 0.5 ? 4 * local ** 3 : 1 - Math.pow(-2 * local + 2, 3) / 2;
    topLayer.current.rotation.y = (step + eased) * (Math.PI / 2);
  });

  const half = (SIZE + GAP) * 1.5;
  return (
    <group position={position} rotation={[0, -0.55, 0]}>
      <group position={[0, half, 0]}>
        {cubies.filter((c) => !c.top).map((c, i) => (
          <mesh key={i} geometry={geometry} material={c.mats} position={c.pos} castShadow receiveShadow />
        ))}
        <group ref={topLayer}>
          {cubies.filter((c) => c.top).map((c, i) => (
            <mesh key={i} geometry={geometry} material={c.mats} position={c.pos} castShadow receiveShadow />
          ))}
        </group>
      </group>
    </group>
  );
}
