/** Small desk props: mug, a stack of books, a notebook. */
export function Props() {
  return (
    <group>
      {/* mug */}
      <group position={[-0.5, 0.76, 0.3]}>
        <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.036, 0.09, 24]} />
          <meshStandardMaterial color="#e9e4d8" roughness={0.5} />
        </mesh>
        <mesh position={[0.045, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.022, 0.006, 8, 20]} />
          <meshStandardMaterial color="#e9e4d8" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.088, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.034, 24]} />
          <meshStandardMaterial color="#2b1a10" roughness={0.3} />
        </mesh>
      </group>
      {/* books */}
      <group position={[-0.85, 0.76, 0.28]} rotation={[0, 0.3, 0]}>
        {[
          ['#2f3b63', 0.0],
          ['#7a3b2e', 0.028],
          ['#3d5a46', 0.054],
        ].map(([c, y], i) => (
          <mesh key={i} position={[i * 0.006, (y as number) + 0.013, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.026, 0.15]} />
            <meshStandardMaterial color={c as string} roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* notebook + pen */}
      <group position={[0.42, 0.76, 0.4]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.012, 0.21]} />
          <meshStandardMaterial color="#d9d1bf" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.016, 0.02]} rotation={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.14, 8]} />
          <meshStandardMaterial color="#1f1f24" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
