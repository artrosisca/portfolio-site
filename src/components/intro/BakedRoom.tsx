import { useEffect, useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export const ROOM_URL = '/room/room.glb';

// the lamp's light is baked in; while it is off the room is this cool, dim version of itself
const NIGHT = new THREE.Color(0.16, 0.18, 0.3);

/**
 * The room with its lighting baked in Blender (blender/bake.py): every part is one mesh with
 * one texture, drawn unlit. No lights, shadows or tone mapping are computed in the browser.
 */
export function BakedRoom({ lamp, onLoaded }: { lamp: RefObject<number>; onLoaded?: () => void }) {
  const { scene } = useGLTF(ROOM_URL, '/draco/');
  const materials = useMemo(() => {
    const out: THREE.MeshBasicMaterial[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const src = m.material as THREE.MeshStandardMaterial;
      if (src.map) {
        src.map.colorSpace = THREE.SRGBColorSpace;
        src.map.anisotropy = 8;
      }
      // both sides: leaves, vines and blades are single sheets
      const mat = new THREE.MeshBasicMaterial({ map: src.map, toneMapped: false, fog: false, side: THREE.DoubleSide });
      m.material = mat;
      out.push(mat);
    });
    return out;
  }, [scene]);

  // mounted means the file is in: two frames later the room is on screen
  useEffect(() => {
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => onLoaded?.())));
    return () => cancelAnimationFrame(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    const k = lamp.current ?? 1;
    for (const m of materials) m.color.copy(NIGHT).lerp(WHITE, k);
  });

  return <primitive object={scene} />;
}
const WHITE = new THREE.Color(1, 1, 1);

// start the download with the page instead of when the canvas mounts
useGLTF.preload(ROOM_URL, '/draco/');
