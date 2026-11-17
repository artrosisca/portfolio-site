import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C } from '../constants';

function useLeafGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.14, 0.06, 0.16, 0.26, 0, 0.42);
    s.bezierCurveTo(-0.16, 0.26, -0.14, 0.06, 0, 0);
    const g = new THREE.ShapeGeometry(s, 10);
    // curl the leaf so it catches light like a real one
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      p.setZ(i, -x * x * 2.2 - y * y * 0.7);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

/** Floor plant with gently swaying leaves. */
export function Plant({ position = [-1.5, 0, -0.3] as [number, number, number], scale = 1 }) {
  const leafGeo = useLeafGeometry();
  const group = useRef<THREE.Group>(null);
  const leaves = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2 + (i % 2) * 0.3;
        return { a, tilt: 0.5 + (i % 3) * 0.28, h: 0.38 + (i % 4) * 0.12, s: 0.85 + ((i * 7) % 5) * 0.09, dark: i % 2 === 0 };
      }),
    [],
  );
  useFrame(({ clock }) => {
    group.current?.children.forEach((c, i) => {
      c.rotation.z = Math.sin(clock.elapsedTime * 0.7 + i) * 0.035;
    });
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.12, 0.34, 24]} />
        <meshStandardMaterial color={C.terracotta} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.335, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.155, 24]} />
        <meshStandardMaterial color="#231710" roughness={1} />
      </mesh>
      <group ref={group}>
        {leaves.map((l, i) => (
          <group key={i} rotation={[0, l.a, 0]}>
            <group position={[0, l.h, 0]} rotation={[l.tilt, 0, 0]} scale={l.s}>
              <mesh geometry={leafGeo} castShadow>
                <meshStandardMaterial color={l.dark ? C.leafDark : C.leaf} roughness={0.7} side={THREE.DoubleSide} />
              </mesh>
            </group>
            <mesh position={[0, 0.33 + (l.h - 0.33) / 2, 0]}>
              <cylinderGeometry args={[0.006, 0.008, l.h - 0.3, 6]} />
              <meshStandardMaterial color={C.leafDark} roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
