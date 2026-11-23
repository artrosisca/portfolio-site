import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { C, DESK_Y, SCREEN_H, SCREEN_POS, SCREEN_W } from '../constants';
import { noteTexture, woodTexture } from '../textures';
import { Plant } from './Plant';

const BOOKS: [string, number, number][] = [
  ['#d9643a', 0.2, 0.03],
  ['#3a78e0', 0.24, 0.035],
  ['#efe7d6', 0.19, 0.025],
  ['#39a85a', 0.22, 0.04],
  ['#f2a33a', 0.2, 0.028],
  ['#7a5cc7', 0.25, 0.034],
];

/** Wall shelf with an LED strip, framed prints, and the small things on the desk. */
export function Decor() {
  const tex = useMemo(
    () => ({
      wood: woodTexture(7),
      note1: noteTexture('#ffe27a', ['deploy na', 'sexta? não.']),
      note2: noteTexture('#9fd3ff', ['beber', 'água :)']),
    }),
    [],
  );
  let bx = 0;
  return (
    <group>
      {/* shelf */}
      <group position={[0.95, 1.72, -0.68]}>
        <RoundedBox args={[1.1, 0.035, 0.22]} radius={0.008} smoothness={2} castShadow receiveShadow>
          <meshStandardMaterial color={C.wood} roughness={0.6} />
        </RoundedBox>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0178, 0]}>
          <planeGeometry args={[1.08, 0.2]} />
          <meshStandardMaterial map={tex.wood} color="#a9764f" roughness={0.55} />
        </mesh>
        {BOOKS.map(([color, h, w], i) => {
          const x = -0.48 + bx + w / 2;
          bx += w + 0.004;
          return (
            <mesh key={i} position={[x, 0.0175 + h / 2, 0]} rotation={[0, 0, i === BOOKS.length - 1 ? -0.18 : 0]} castShadow>
              <boxGeometry args={[w, h, 0.15]} />
              <meshStandardMaterial color={color} roughness={0.75} />
            </mesh>
          );
        })}
        <Plant position={[0.36, 0.0175, 0]} scale={0.3} />
        {/* LED strip under the shelf */}
        <mesh position={[0, -0.022, 0.06]}>
          <boxGeometry args={[1.0, 0.006, 0.012]} />
          <meshBasicMaterial color={[3.2, 1.9, 0.8]} toneMapped={false} />
        </mesh>
        <pointLight position={[0, -0.12, 0.1]} color="#ffa95a" intensity={0.8} distance={2.2} decay={2} />
      </group>

      {/* framed prints */}
      {[
        { p: [-0.72, 1.78, -0.785], s: [0.34, 0.46], c: '#3a78e0', d: '#f2a33a' },
        { p: [-0.3, 1.86, -0.785], s: [0.26, 0.26], c: '#d9643a', d: '#efe7d6' },
      ].map((f, i) => (
        <group key={i} position={f.p as [number, number, number]}>
          <RoundedBox args={[f.s[0] + 0.03, f.s[1] + 0.03, 0.02]} radius={0.006} smoothness={2} castShadow>
            <meshStandardMaterial color="#12131c" roughness={0.6} />
          </RoundedBox>
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={[f.s[0], f.s[1]]} />
            <meshStandardMaterial color={f.c} roughness={0.9} />
          </mesh>
          <mesh position={[0.02, -0.02, 0.012]}>
            <circleGeometry args={[Math.min(f.s[0], f.s[1]) * 0.28, 32]} />
            <meshStandardMaterial color={f.d} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* cork coaster + mug, to the right of the mat */}
      <mesh position={[0.72, DESK_Y + 0.002, 0.12]} receiveShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.004, 32]} />
        <meshStandardMaterial color="#b98a5a" roughness={0.95} />
      </mesh>
      <group position={[0.72, DESK_Y + 0.004, 0.12]} rotation={[0, -0.6, 0]}>
        <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.09, 24]} />
          <meshStandardMaterial color="#3a78e0" roughness={0.5} />
        </mesh>
        <mesh position={[0.046, 0.047, 0]}>
          <torusGeometry args={[0.022, 0.007, 8, 20]} />
          <meshStandardMaterial color="#3a78e0" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.086, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.034, 24]} />
          <meshStandardMaterial color="#3b2416" roughness={0.3} />
        </mesh>
      </group>

      {/* monitor light bar */}
      <group position={[SCREEN_POS.x, SCREEN_POS.y + SCREEN_H / 2 + 0.028, SCREEN_POS.z + 0.004]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.42, 16]} />
          <meshStandardMaterial color="#20222b" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.0092, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.38, 0.006]} />
          <meshBasicMaterial color={[2.4, 2.4, 2.6]} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.012, -0.012]}>
          <boxGeometry args={[0.04, 0.012, 0.03]} />
          <meshStandardMaterial color="#20222b" roughness={0.5} />
        </mesh>
      </group>

      {/* sticky notes hanging under the bezel: they never cover the screen */}
      {[
        { x: -SCREEN_W / 2 + 0.05, r: 0.06, t: tex.note1 },
        { x: -SCREEN_W / 2 + 0.115, r: -0.08, t: tex.note2 },
      ].map((n, i) => (
        <mesh key={i} position={[SCREEN_POS.x + n.x, SCREEN_POS.y - SCREEN_H / 2 - 0.04, SCREEN_POS.z + 0.0005]} rotation={[0, 0, n.r]}>
          <planeGeometry args={[0.055, 0.055]} />
          <meshStandardMaterial map={n.t} roughness={0.9} side={2} />
        </mesh>
      ))}

      {/* pen cup next to the lamp */}
      <group position={[-0.64, DESK_Y, -0.5]}>
        <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.032, 0.03, 0.09, 24, 1, true]} />
          <meshStandardMaterial color="#2b2e3a" roughness={0.5} side={2} />
        </mesh>
        <mesh position={[0, 0.002, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.004, 24]} />
          <meshStandardMaterial color="#2b2e3a" roughness={0.5} />
        </mesh>
        {[
          ['#8ecbff', 0.25, 0.1],
          ['#efe7d6', -0.2, -0.3],
          ['#d9643a', 0.05, 0.25],
        ].map(([c, a, b], i) => (
          <mesh key={i} position={[(a as number) * 0.05, 0.1, (b as number) * 0.05]} rotation={[b as number, 0, a as number]} castShadow>
            <cylinderGeometry args={[0.0045, 0.0045, 0.15, 8]} />
            <meshStandardMaterial color={c as string} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* closed laptop standing in a vertical stand, right of the monitor */}
      <group position={[0.6, DESK_Y, -0.52]} rotation={[0, -0.12, 0]}>
        <RoundedBox args={[0.12, 0.012, 0.05]} radius={0.004} smoothness={2} position={[0, 0.006, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#2a2c33" metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <RoundedBox args={[0.31, 0.215, 0.018]} radius={0.006} smoothness={2} position={[0, 0.118, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#1e2026" metalness={0.5} roughness={0.4} />
        </RoundedBox>
      </group>

    </group>
  );
}
