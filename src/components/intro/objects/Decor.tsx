import { RoundedBox } from '@react-three/drei';
import { C, DESK_Y } from '../constants';
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
  let bx = 0;
  return (
    <group>
      {/* shelf */}
      <group position={[0.95, 1.72, -0.68]}>
        <RoundedBox args={[1.1, 0.035, 0.22]} radius={0.008} smoothness={2} castShadow receiveShadow>
          <meshStandardMaterial color={C.wood} roughness={0.6} />
        </RoundedBox>
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

      {/* mug */}
      <group position={[-0.42, DESK_Y, 0.16]}>
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

      {/* notebook + pen */}
      <group position={[-0.62, DESK_Y, -0.02]} rotation={[0, 0.35, 0]}>
        <RoundedBox args={[0.17, 0.014, 0.23]} radius={0.004} smoothness={2} position={[0, 0.007, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#d9643a" roughness={0.8} />
        </RoundedBox>
        <mesh position={[0.02, 0.02, 0.01]} rotation={[Math.PI / 2, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.15, 8]} />
          <meshStandardMaterial color={C.cream} roughness={0.5} />
        </mesh>
      </group>

      {/* headphones resting on the drawer side of the desk */}
      <group position={[0.84, DESK_Y + 0.085, -0.38]} rotation={[0, -0.4, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.085, 0.009, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#14141a" roughness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.085, -0.035, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.035, 24]} />
            <meshStandardMaterial color={s === 1 ? C.amber : '#14141a'} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
