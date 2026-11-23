import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rod } from './Rod';
import { C, DESK_Y } from '../constants';

type V3 = [number, number, number];
const BASE: V3 = [-0.86, DESK_Y, -0.42];
const ELBOW: V3 = [-0.98, DESK_Y + 0.42, -0.42];
const HEAD: V3 = [-0.52, DESK_Y + 0.62, -0.3];
const TARGET: V3 = [-0.05, DESK_Y, 0.08];

const BULB = new THREE.Color(5, 3.4, 1.6);
const BULB_OFF = new THREE.Color(0.12, 0.09, 0.06);

/** `power` (0..1) is driven by the intro: off until the visitor clicks, then it flickers on. */
export function Lamp({ shadowSize, power }: { shadowSize: number; power: RefObject<number> }) {
  const light = useRef<THREE.SpotLight>(null);
  const bounce = useRef<THREE.PointLight>(null);
  const bulb = useRef<THREE.MeshBasicMaterial>(null);
  const shade = useRef<THREE.MeshStandardMaterial>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...TARGET);
    return o;
  }, []);
  // The shade opens along the same axis the beam travels, so light and object agree.
  const headQuat = useMemo(() => {
    const dir = new THREE.Vector3(...TARGET).sub(new THREE.Vector3(...HEAD)).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  }, []);
  const metal = <meshStandardMaterial color={C.amber} roughness={0.5} metalness={0.2} />;

  useFrame(({ clock }) => {
    const p = power.current ?? 1;
    // intensity only: toggling `visible` would change the light count and recompile shaders
    if (light.current) light.current.intensity = (6 + Math.sin(clock.elapsedTime * 1.3) * 0.25) * p;
    if (bounce.current) bounce.current.intensity = 0.9 * p;
    if (bulb.current) bulb.current.color.lerpColors(BULB_OFF, BULB, p);
    if (shade.current) shade.current.emissiveIntensity = 0.08 * p;
  });

  return (
    <group>
      <mesh position={[BASE[0], BASE[1] + 0.012, BASE[2]]} castShadow receiveShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.024, 32]} />
        {metal}
      </mesh>
      <Rod a={[BASE[0], BASE[1] + 0.02, BASE[2]]} b={ELBOW} r={0.009}>{metal}</Rod>
      <Rod a={ELBOW} b={HEAD} r={0.009}>{metal}</Rod>
      <mesh position={ELBOW}>
        <sphereGeometry args={[0.018, 16, 12]} />
        {metal}
      </mesh>
      <group position={HEAD} quaternion={headQuat}>
        <mesh position={[0, 0.03, 0]}>
          <sphereGeometry args={[0.024, 16, 12]} />
          {metal}
        </mesh>
        {/* shade: open cone, apex at the joint. Not a shadow caster, so it can't clip its own beam. */}
        <mesh position={[0, -0.045, 0]}>
          <coneGeometry args={[0.1, 0.15, 32, 1, true]} />
          <meshStandardMaterial ref={shade} color={C.amber} roughness={0.5} metalness={0.2} side={THREE.DoubleSide} emissive="#ff9a3c" emissiveIntensity={0.08} />
        </mesh>
        {/* glowing bulb: values above 1 feed the bloom pass */}
        <mesh position={[0, -0.075, 0]}>
          <sphereGeometry args={[0.03, 16, 12]} />
          <meshBasicMaterial ref={bulb} color={[5, 3.4, 1.6]} toneMapped={false} />
        </mesh>
      </group>
      <primitive object={target} />
      <spotLight
        ref={light}
        position={HEAD}
        target={target}
        color="#ffb765"
        angle={0.95}
        penumbra={1}
        distance={5}
        decay={1.8}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0006}
        shadow-radius={6}
        shadow-camera-near={0.15}
      />
      {/* warm bounce so the wall behind the desk is not pitch black */}
      <pointLight ref={bounce} position={[-0.3, DESK_Y + 0.35, 0]} color="#ff9a4a" intensity={0.9} distance={3} decay={2} />
    </group>
  );
}
