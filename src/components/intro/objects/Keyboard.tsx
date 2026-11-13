import { useMemo } from 'react';

export function Keyboard() {
  const keys = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) out.push([c, r]);
    return out;
  }, []);
  return (
    <group position={[0.02, 0.775, 0.22]} rotation={[0, 0.02, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.02, 0.15]} />
        <meshStandardMaterial color="#15171c" roughness={0.5} metalness={0.3} />
      </mesh>
      {keys.map(([c, r]) => (
        <mesh key={`${c}-${r}`} position={[-0.19 + c * 0.0315, 0.014, -0.05 + r * 0.033]} castShadow>
          <boxGeometry args={[0.026, 0.008, 0.026]} />
          <meshStandardMaterial color="#23262d" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
