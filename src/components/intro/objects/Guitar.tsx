import { useMemo } from 'react';
import * as THREE from 'three';
import { Rod } from './Rod';
import { C } from '../constants';

/** Acoustic guitar ("violão") on a floor stand, with its own soft accent light. */
export function Guitar() {
  const { body, top } = useMemo(() => {
    const outline = () => {
      const s = new THREE.Shape();
      s.moveTo(0, -0.25);
      s.bezierCurveTo(0.21, -0.25, 0.25, -0.08, 0.19, 0.01);
      s.bezierCurveTo(0.14, 0.07, 0.14, 0.11, 0.165, 0.15);
      s.bezierCurveTo(0.2, 0.23, 0.1, 0.27, 0, 0.27);
      s.bezierCurveTo(-0.1, 0.27, -0.2, 0.23, -0.165, 0.15);
      s.bezierCurveTo(-0.14, 0.11, -0.14, 0.07, -0.19, 0.01);
      s.bezierCurveTo(-0.25, -0.08, -0.21, -0.25, 0, -0.25);
      return s;
    };
    const body = new THREE.ExtrudeGeometry(outline(), { depth: 0.085, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 4, curveSegments: 28 });
    const topShape = outline();
    const hole = new THREE.Path();
    hole.absarc(0, 0.05, 0.05, 0, Math.PI * 2, true);
    topShape.holes.push(hole);
    const top = new THREE.ShapeGeometry(topShape, 28);
    return { body, top };
  }, []);

  const strings = [-0.02, -0.012, -0.004, 0.004, 0.012, 0.02];
  return (
    <group position={[1.28, 0, 0.42]} rotation={[0, -0.75, 0]}>
      {/* stand */}
      <Rod a={[0, 0.02, 0.02]} b={[0, 0.62, -0.1]} r={0.008}><meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} /></Rod>
      <Rod a={[-0.2, 0.01, 0.16]} b={[0, 0.2, -0.02]} r={0.008}><meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} /></Rod>
      <Rod a={[0.2, 0.01, 0.16]} b={[0, 0.2, -0.02]} r={0.008}><meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} /></Rod>
      <Rod a={[0, 0.01, -0.2]} b={[0, 0.2, -0.02]} r={0.008}><meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} /></Rod>

      <group position={[0, 0.36, 0.04]} rotation={[-0.16, 0, 0]}>
        <mesh geometry={body} position={[0, 0, -0.085]} castShadow receiveShadow>
          <meshStandardMaterial color="#7a4524" roughness={0.5} />
        </mesh>
        {/* soundboard, lighter wood */}
        <mesh geometry={top} position={[0, 0, 0.0105]}>
          <meshStandardMaterial color="#e0a55c" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.05, 0.005]}>
          <circleGeometry args={[0.05, 32]} />
          <meshStandardMaterial color="#1a0f08" roughness={1} />
        </mesh>
        {/* rosette */}
        <mesh position={[0, 0.05, 0.0115]}>
          <ringGeometry args={[0.053, 0.066, 40]} />
          <meshStandardMaterial color="#3b2112" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.11, 0.018]} castShadow>
          <boxGeometry args={[0.13, 0.022, 0.012]} />
          <meshStandardMaterial color="#2a180d" roughness={0.6} />
        </mesh>
        {/* neck + fretboard */}
        <mesh position={[0, 0.5, -0.004]} castShadow>
          <boxGeometry args={[0.05, 0.5, 0.026]} />
          <meshStandardMaterial color="#5a3219" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.44, 0.0115]}>
          <boxGeometry args={[0.052, 0.62, 0.006]} />
          <meshStandardMaterial color="#22130a" roughness={0.5} />
        </mesh>
        {Array.from({ length: 13 }, (_, i) => (
          <mesh key={i} position={[0, 0.74 - i * (0.045 - i * 0.0012), 0.0152]}>
            <boxGeometry args={[0.052, 0.0025, 0.002]} />
            <meshStandardMaterial color="#d8d2c2" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* headstock + pegs */}
        <mesh position={[0, 0.82, -0.012]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.066, 0.15, 0.02]} />
          <meshStandardMaterial color="#5a3219" roughness={0.6} />
        </mesh>
        {[-1, 1].map((side) =>
          [0, 1, 2].map((i) => (
            <mesh key={`${side}${i}`} position={[side * 0.044, 0.78 + i * 0.04, -0.015]}>
              <sphereGeometry args={[0.009, 10, 8]} />
              <meshStandardMaterial color="#efe7d6" roughness={0.4} />
            </mesh>
          )),
        )}
        {strings.map((x) => (
          <mesh key={x} position={[x, 0.33, 0.0185]}>
            <cylinderGeometry args={[0.0007, 0.0007, 0.88, 4]} />
            <meshStandardMaterial color="#f4eede" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
      </group>
      <pointLight position={[-0.1, 1.5, 0.9]} color="#ffc98a" intensity={1.1} distance={2.6} decay={2} />
    </group>
  );
}
