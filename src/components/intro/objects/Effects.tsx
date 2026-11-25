import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESK_Y } from '../constants';
import { softDot } from '../textures';
import { HEAD, TARGET } from './Lamp';

type V3 = [number, number, number];

/** Where the baked room's clamp lamp shines from (lamp_spot in blender/room.blend, Y-up). */
export const BAKED_HEAD: V3 = [-0.711, 1.296, -0.596];
/** Where its pool of light lands (props.py TARGET: the shade's axis meets the desk there). */
export const BAKED_TARGET: V3 = [-0.18, DESK_Y, 0.1];

/** Dust motes drifting inside the lamp's beam; only visible while the lamp is on. */
export function Dust({ lamp, count, from = HEAD, to = TARGET }: { lamp: RefObject<number>; count: number; from?: V3; to?: V3 }) {
  const mat = useRef<THREE.PointsMaterial>(null);
  const { geo, seeds, axis, head } = useMemo(() => {
    const head = new THREE.Vector3(...from);
    const axis = new THREE.Vector3(...to).sub(head);
    const seeds = Array.from({ length: count }, () => ({ t: 0.12 + Math.random() * 0.85, a: Math.random() * Math.PI * 2, r: Math.sqrt(Math.random()), sp: 0.01 + Math.random() * 0.03, ph: Math.random() * 10 }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { geo, seeds, axis, head };
  }, [count, from, to]);
  const tex = useMemo(() => softDot(), []);
  const side = useMemo(() => {
    // two vectors perpendicular to the beam, to place motes around its axis
    const n = axis.clone().normalize();
    const u = new THREE.Vector3(0, 1, 0).cross(n).normalize();
    return { u, v: n.clone().cross(u).normalize() };
  }, [axis]);

  useFrame(({ clock }, dt) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const e = clock.elapsedTime;
    seeds.forEach((s, i) => {
      // slow fall along the beam, wrapping back to the top
      s.t += s.sp * Math.min(dt, 0.1) * 0.25;
      if (s.t > 0.97) s.t = 0.12;
      const r = s.r * s.t * 0.42; // the cone widens away from the bulb
      const a = s.a + Math.sin(e * 0.2 + s.ph) * 0.4;
      const p = head.clone().addScaledVector(axis, s.t);
      p.addScaledVector(side.u, Math.cos(a) * r).addScaledVector(side.v, Math.sin(a) * r);
      p.y += Math.sin(e * 0.7 + s.ph) * 0.01;
      pos.setXYZ(i, p.x, p.y, p.z);
    });
    pos.needsUpdate = true;
    if (mat.current) mat.current.opacity = 0.55 * (lamp.current ?? 1);
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial ref={mat} map={tex} color="#ffd9a0" size={0.007} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
    </points>
  );
}

const STEAM_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise1(float x) { float i = floor(x), f = fract(x); return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f)); }
  void main() {
    vUv = uv;
    vec3 p = position;
    // the column twists as it rises and drifts sideways, more the higher it gets
    float a = (noise1(uv.y * 2.0 - uTime * 0.25) - 0.5) * 6.0 * uv.y;
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
    p.x += (noise1(uv.y * 1.5 - uTime * 0.3 + 7.0) - 0.5) * 0.05 * uv.y * uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const STEAM_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    // stretched noise scrolling upwards, warped so it breaks into thin curling wisps
    vec2 q = vec2(vUv.x * 1.3, vUv.y * 1.6 - uTime * 0.22);
    q.x += (fbm(q * 1.5 + vec2(0.0, uTime * 0.08)) - 0.5) * 2.2 * (0.3 + vUv.y);
    float n = fbm(q * vec2(2.0, 1.4));
    // a faint haze just over the coffee that the wisps tear out of
    float wisps = max(smoothstep(0.42, 0.72, n), n * 0.5 * (1.0 - smoothstep(0.0, 0.3, vUv.y)));
    // narrow at the cup, wider and fainter higher up; soft at every edge
    float half_ = mix(0.3, 0.5, vUv.y);
    float across = 1.0 - smoothstep(half_ * 0.4, half_, abs(vUv.x - 0.5));
    float along = smoothstep(0.0, 0.04, vUv.y) * (1.0 - smoothstep(0.35, 1.0, vUv.y));
    gl_FragColor = vec4(uColor, wisps * across * along * uOpacity);
  }
`;

/** Thin wisps of steam curling up from the cup: a camera-facing strip with scrolling noise. */
export function Steam({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(0.08, 0.24, 12, 48).translate(0, 0.12, 0), []);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color('#f1ebe2') }, uOpacity: { value: 0.5 } }),
    [],
  );
  useFrame(({ clock, camera }) => {
    uniforms.uTime.value = clock.elapsedTime;
    const m = mesh.current;
    if (m) m.rotation.y = Math.atan2(camera.position.x - position[0], camera.position.z - position[2]); // turn round y towards the camera
  });
  return (
    <mesh ref={mesh} position={position} geometry={geo} renderOrder={2}>
      <shaderMaterial
        vertexShader={STEAM_VERT}
        fragmentShader={STEAM_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const MUG_TOP: [number, number, number] = [0.72, DESK_Y + 0.099, 0.12];
/** The baked room has a cappuccino cup on a saucer there instead (blender/models/desk_items.py). */
export const CUP_TOP: [number, number, number] = [0.72, DESK_Y + 0.067, 0.12];
