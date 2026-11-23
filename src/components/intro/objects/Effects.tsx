import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESK_Y } from '../constants';
import { softDot } from '../textures';
import { HEAD, TARGET } from './Lamp';

/** Dust motes drifting inside the lamp's beam; only visible while the lamp is on. */
export function Dust({ lamp, count }: { lamp: RefObject<number>; count: number }) {
  const mat = useRef<THREE.PointsMaterial>(null);
  const { geo, seeds, axis, head } = useMemo(() => {
    const head = new THREE.Vector3(...HEAD);
    const axis = new THREE.Vector3(...TARGET).sub(head);
    const seeds = Array.from({ length: count }, () => ({ t: 0.12 + Math.random() * 0.85, a: Math.random() * Math.PI * 2, r: Math.sqrt(Math.random()), sp: 0.01 + Math.random() * 0.03, ph: Math.random() * 10 }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { geo, seeds, axis, head };
  }, [count]);
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

/** A few soft puffs rising and fading above the mug. */
export function Steam({ position }: { position: [number, number, number] }) {
  const N = 6;
  const tex = useMemo(() => softDot(), []);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  useFrame(({ clock }) => {
    const e = clock.elapsedTime;
    sprites.current.forEach((sp, i) => {
      if (!sp) return;
      const k = ((e * 0.28 + i / N) % 1 + 1) % 1; // 0..1 life
      sp.position.set(Math.sin(e * 0.9 + i * 2.1) * 0.012 * k, k * 0.16, Math.cos(e * 0.7 + i) * 0.008 * k);
      const s = 0.035 + k * 0.08;
      sp.scale.set(s, s * 1.4, 1);
      (sp.material as THREE.SpriteMaterial).opacity = Math.sin(k * Math.PI) * 0.22;
    });
  });
  return (
    <group position={position}>
      {Array.from({ length: N }, (_, i) => (
        <sprite key={i} ref={(s) => void (sprites.current[i] = s)}>
          <spriteMaterial map={tex} color="#e9eef7" transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

const WARM = new THREE.Color(2.4, 1.7, 0.95);
const MOON = new THREE.Color(1.0, 1.75, 2.8); // the site's "lua" blue, a touch over 1 for bloom

/** Fairy lights draped across the wall, alternating warm and moon blue, softly twinkling. */
export function StringLights() {
  const N = 34;
  const inst = useRef<THREE.InstancedMesh>(null);
  const { points, wire } = useMemo(() => {
    // three sagging spans on the wall behind the monitor, under the prints and the shelf
    const hooks: [number, number][] = [[-1.45, 1.6], [-0.5, 1.52], [0.38, 1.6], [1.55, 1.5]];
    const pts: THREE.Vector3[] = [];
    for (let h = 0; h < hooks.length - 1; h++) {
      const [x0, y0] = hooks[h];
      const [x1, y1] = hooks[h + 1];
      for (let i = 0; i < 24; i++) {
        const t = i / 24;
        pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 0.11, -0.77));
      }
    }
    pts.push(new THREE.Vector3(...hooks[hooks.length - 1], -0.77));
    const curve = new THREE.CatmullRomCurve3(pts);
    const wire = new THREE.TubeGeometry(curve, 160, 0.0025, 4, false);
    const points = Array.from({ length: N }, (_, i) => curve.getPointAt((i + 0.5) / N));
    return { points, wire };
  }, []);

  const color = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    const mesh = inst.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    points.forEach((p, i) => mesh.setMatrixAt(i, m.makeTranslation(p.x, p.y - 0.012, p.z + 0.01)));
    mesh.instanceMatrix.needsUpdate = true;
  }, [points]);
  useFrame(({ clock }) => {
    const mesh = inst.current;
    if (!mesh) return;
    const e = clock.elapsedTime;
    points.forEach((_, i) => {
      const tw = 0.55 + 0.45 * Math.sin(e * (0.8 + (i % 5) * 0.23) + i * 1.7);
      color.copy(i % 3 === 1 ? MOON : WARM).multiplyScalar(0.35 + 0.65 * tw);
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={wire}>
        <meshStandardMaterial color="#1a1b22" roughness={0.6} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[0.011, 10, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export const MUG_TOP: [number, number, number] = [-0.42, DESK_Y + 0.095, 0.16];
