import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Lamp() {
  const light = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    // subtle warm flicker
    light.current.intensity = 19 + Math.sin(clock.elapsedTime * 7.3) * 0.35 + Math.sin(clock.elapsedTime * 1.7) * 0.25;
    if (target.current) light.current.target = target.current;
  });
  return (
    <group position={[-0.95, 0.76, -0.25]}>
      {/* base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.09, 0.02, 32]} />
        <meshStandardMaterial color="#1f1a14" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* arm */}
      <mesh position={[0.08, 0.26, 0]} rotation={[0, 0, -0.35]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.56, 8]} />
        <meshStandardMaterial color="#2a2219" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0.32, 0.5, 0]} rotation={[0, 0, 1.25]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.36, 8]} />
        <meshStandardMaterial color="#2a2219" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* shade */}
      <group position={[0.46, 0.42, 0]} rotation={[0, 0, 0.9]}>
        <mesh castShadow>
          <coneGeometry args={[0.11, 0.14, 32, 1, true]} />
          <meshStandardMaterial color="#1f1a14" side={THREE.DoubleSide} metalness={0.4} roughness={0.5} />
        </mesh>
        {/* bulb */}
        <mesh position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#ffd38a" toneMapped={false} />
        </mesh>
        <spotLight
          ref={light}
          position={[0, -0.04, 0]}
          color="#f2a33a"
          angle={0.9}
          penumbra={0.7}
          distance={6}
          decay={2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
      </group>
      <object3D ref={target} position={[0.9, -0.76, 0.3]} />
    </group>
  );
}
