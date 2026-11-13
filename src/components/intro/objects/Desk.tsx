export function Desk() {
  return (
    <group>
      {/* top */}
      <mesh position={[0, 0.73, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.6, 0.06, 1.2]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.65} metalness={0.05} />
      </mesh>
      {/* legs */}
      {[[-1.2, -0.5], [1.2, -0.5], [-1.2, 0.5], [1.2, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#1b1d22" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.95} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 2, -0.9]} receiveShadow>
        <planeGeometry args={[30, 8]} />
        <meshStandardMaterial color="#0e1015" roughness={1} />
      </mesh>
    </group>
  );
}
