import { useMemo } from 'react';
import * as THREE from 'three';

/** Acoustic guitar ("violão") leaning against the desk. Fully procedural. */
export function Guitar({ position = [1.42, 0, 0.35] as [number, number, number] }) {
  const bodyGeo = useMemo(() => {
    const s = new THREE.Shape();
    // classical body outline (x: width, y: height), centered-ish
    s.moveTo(0, -0.26);
    s.bezierCurveTo(0.2, -0.26, 0.24, -0.1, 0.19, 0.0);
    s.bezierCurveTo(0.15, 0.06, 0.15, 0.1, 0.17, 0.14);
    s.bezierCurveTo(0.2, 0.22, 0.1, 0.28, 0, 0.28);
    s.bezierCurveTo(-0.1, 0.28, -0.2, 0.22, -0.17, 0.14);
    s.bezierCurveTo(-0.15, 0.1, -0.15, 0.06, -0.19, 0.0);
    s.bezierCurveTo(-0.24, -0.1, -0.2, -0.26, 0, -0.26);
    const hole = new THREE.Path();
    hole.absarc(0, 0.02, 0.055, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.09, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 3, curveSegments: 24 });
    g.center();
    return g;
  }, []);

  const strings = useMemo(() => Array.from({ length: 6 }, (_, i) => -0.02 + i * 0.008), []);

  return (
    // lean back against the desk edge and tilt a little sideways
    <group position={position} rotation={[-0.22, -0.35, 0.08]}>
      <group position={[0, 0.3, 0]}>
        <mesh geometry={bodyGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#b9793b" roughness={0.45} metalness={0.05} />
        </mesh>
        {/* dark soundhole backing */}
        <mesh position={[0, 0.02, 0.0]}>
          <circleGeometry args={[0.054, 32]} />
          <meshStandardMaterial color="#120b06" roughness={1} />
        </mesh>
        {/* bridge */}
        <mesh position={[0, -0.12, 0.05]} castShadow>
          <boxGeometry args={[0.12, 0.018, 0.012]} />
          <meshStandardMaterial color="#1a110a" roughness={0.6} />
        </mesh>
        {/* neck */}
        <mesh position={[0, 0.5, 0.025]} castShadow>
          <boxGeometry args={[0.052, 0.5, 0.03]} />
          <meshStandardMaterial color="#3a2415" roughness={0.6} />
        </mesh>
        {/* fretboard */}
        <mesh position={[0, 0.5, 0.042]}>
          <boxGeometry args={[0.052, 0.5, 0.005]} />
          <meshStandardMaterial color="#1a110a" roughness={0.5} />
        </mesh>
        {/* frets */}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[0, 0.29 + i * 0.036, 0.046]}>
            <boxGeometry args={[0.052, 0.002, 0.002]} />
            <meshStandardMaterial color="#c9c3b5" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* headstock */}
        <mesh position={[0, 0.8, 0.02]} rotation={[0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.065, 0.14, 0.02]} />
          <meshStandardMaterial color="#3a2415" roughness={0.6} />
        </mesh>
        {/* tuning pegs */}
        {[-1, 1].map((side) =>
          [0, 1, 2].map((i) => (
            <mesh key={`${side}-${i}`} position={[side * 0.042, 0.76 + i * 0.035, 0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.004, 0.004, 0.02, 8]} />
              <meshStandardMaterial color="#d5d0c4" metalness={0.9} roughness={0.25} />
            </mesh>
          )),
        )}
        {/* strings */}
        {strings.map((x, i) => (
          <mesh key={i} position={[x, 0.33, 0.056]}>
            <cylinderGeometry args={[0.0008, 0.0008, 0.9, 4]} />
            <meshStandardMaterial color="#e8e2d2" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
