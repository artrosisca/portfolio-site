import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Ribbed planter: a cylinder whose radius ripples around its circumference. */
function useRibbedPot(r: number, h: number) {
  return useMemo(() => {
    const g = new THREE.CylinderGeometry(r, r * 0.82, h, 96, 1, true); // open top: soil shows inside
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + Math.cos(a * 28) * 0.025;
      p.setX(i, x * k);
      p.setZ(i, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, [r, h]);
}

type Stem = { curve: THREE.QuadraticBezierCurve3; leaves: THREE.Matrix4[] };

/**
 * ZZ plant (zamioculca), like the one in Arthur's room: arching stems with glossy
 * leaflets in pairs, in a white ribbed pot. One draw call per stem for its leaflets.
 */
export function ZZPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const POT_H = 0.3;
  const pot = useRibbedPot(0.14, POT_H);
  const leaf = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.03, 0.02, 0.035, 0.07, 0, 0.11);
    s.bezierCurveTo(-0.035, 0.07, -0.03, 0.02, 0, 0);
    const g = new THREE.ShapeGeometry(s, 6);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, -Math.pow(p.getX(i), 2) * 9); // slight cup
    g.computeVertexNormals();
    return g;
  }, []);

  const stems = useMemo<Stem[]>(() => {
    const out: Stem[] = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (i % 2) * 0.35;
      const H = 0.5 + ((i * 37) % 7) * 0.06;
      const lean = 0.12 + ((i * 13) % 5) * 0.05;
      const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, POT_H - 0.02, 0),
        dir.clone().multiplyScalar(lean * 0.3).setY(POT_H + H * 0.6),
        dir.clone().multiplyScalar(lean).setY(POT_H + H),
      );
      const leaves: THREE.Matrix4[] = [];
      const pairs = 7;
      for (let j = 0; j < pairs; j++) {
        const t = 0.38 + (j / pairs) * 0.6;
        const pos = curve.getPoint(t);
        const tan = curve.getTangent(t);
        const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
        for (const sgn of [-1, 1]) {
          // leaflet points outwards and up, its face roughly to the sky
          const out = side.clone().multiplyScalar(sgn).add(tan.clone().multiplyScalar(0.6)).normalize();
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), out);
          const roll = new THREE.Quaternion().setFromAxisAngle(out, sgn * 1.1);
          const sc = 0.8 + (j / pairs) * 0.45 - (j === pairs - 1 ? 0.2 : 0);
          leaves.push(new THREE.Matrix4().compose(pos, roll.multiply(q), new THREE.Vector3(sc, sc, sc)));
        }
      }
      out.push({ curve, leaves });
    }
    return out;
  }, []);

  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    groups.current.forEach((g, i) => {
      if (g) g.rotation.z = Math.sin(clock.elapsedTime * 0.6 + i * 1.3) * 0.02;
    });
  });

  return (
    <group position={position} scale={scale}>
      <mesh geometry={pot} position={[0, POT_H / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e4ded2" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, POT_H - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.135, 32]} />
        <meshStandardMaterial color="#2a1c12" roughness={1} />
      </mesh>
      {stems.map((s, i) => (
        <group key={i} ref={(g) => void (groups.current[i] = g)}>
          <mesh castShadow>
            <tubeGeometry args={[s.curve, 16, 0.006, 6, false]} />
            <meshStandardMaterial color="#3e6b34" roughness={0.6} />
          </mesh>
          <Leaflets geometry={leaf} matrices={s.leaves} />
        </group>
      ))}
    </group>
  );
}

function Leaflets({ geometry, matrices }: { geometry: THREE.BufferGeometry; matrices: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    matrices.forEach((mx, i) => m.setMatrixAt(i, mx));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, matrices.length]} castShadow>
      {/* glossy, the ZZ plant's signature */}
      <meshStandardMaterial color="#2f6b2c" roughness={0.28} metalness={0.05} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
