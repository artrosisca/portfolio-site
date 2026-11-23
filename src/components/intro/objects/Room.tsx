import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { C, DESK_Y } from '../constants';
import { feltTexture, woodTexture } from '../textures';
import { Rod } from './Rod';

export function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={C.floor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3, -0.8]} receiveShadow>
        <planeGeometry args={[40, 6]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      {/* skirting board */}
      <mesh position={[0, 0.05, -0.79]}>
        <boxGeometry args={[40, 0.1, 0.02]} />
        <meshStandardMaterial color="#12131c" roughness={0.8} />
      </mesh>
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.004, 0.75]} receiveShadow>
        <circleGeometry args={[1.5, 48]} />
        <meshStandardMaterial color="#2a2140" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.006, 0.75]} receiveShadow>
        <ringGeometry args={[1.25, 1.32, 48]} />
        <meshStandardMaterial color="#c98a3c" roughness={1} />
      </mesh>
    </group>
  );
}

export function Desk() {
  const { wood, felt } = useMemo(() => ({ wood: woodTexture(3), felt: feltTexture('#ff5c34') }), []);
  return (
    <group>
      <RoundedBox args={[2.2, 0.05, 1.05]} radius={0.018} smoothness={3} position={[0, DESK_Y - 0.025, -0.15]} castShadow receiveShadow>
        <meshStandardMaterial color={C.wood} roughness={0.6} />
      </RoundedBox>
      {/* grain on the top face (RoundedBox UVs are not 0..1, so a plane carries the texture) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DESK_Y + 0.0004, -0.15]} receiveShadow>
        <planeGeometry args={[2.17, 1.02]} />
        <meshStandardMaterial map={wood} color="#c8936a" roughness={0.5} />
      </mesh>
      {/* felt desk mat with a stitched edge */}
      <RoundedBox args={[0.95, 0.006, 0.42]} radius={0.003} smoothness={2} position={[0.08, DESK_Y + 0.003, 0.1]} receiveShadow>
        <meshStandardMaterial color="#1b1f29" roughness={0.95} />
      </RoundedBox>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, DESK_Y + 0.0062, 0.1]} receiveShadow>
        <planeGeometry args={[0.944, 0.414]} />
        <meshStandardMaterial map={felt} roughness={0.95} />
      </mesh>
      {/* hairpin legs, like the real desk */}
      {[[-1.0, -0.58], [1.0, -0.58], [-1.0, 0.28], [1.0, 0.28]].map(([x, z]) => (
        <group key={`${x}${z}`}>
          {[[-0.05, 0], [0.05, 0], [0, -0.06]].map(([dx, dz], i) => (
            <Rod key={i} a={[x + dx, DESK_Y - 0.05, z + dz]} b={[x, 0.01, z - 0.02]} r={0.0055}>
              <meshStandardMaterial color="#15161b" metalness={0.6} roughness={0.35} />
            </Rod>
          ))}
        </group>
      ))}
    </group>
  );
}

