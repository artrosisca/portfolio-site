import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Dev only (`?export`): sends the procedural room as a .glb to blender/receive.mjs, the
 * starting point for the baked-lighting version built in Blender (see blender/README.md).
 */
export function ExportScene() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('export')) return;
    const id = setTimeout(async () => {
      scene.updateMatrixWorld(true);
      const out = new THREE.Scene();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || !m.visible || o.userData.noExport) return;
        let hidden = false;
        o.traverseAncestors((a) => void (hidden ||= !a.visible || a.userData.noExport));
        if (hidden) return;
        const top = topGroup(o);
        let geo: THREE.BufferGeometry;
        if ((m as THREE.InstancedMesh).isInstancedMesh) {
          const im = m as THREE.InstancedMesh;
          const parts: THREE.BufferGeometry[] = [];
          const mx = new THREE.Matrix4();
          for (let i = 0; i < im.count; i++) {
            im.getMatrixAt(i, mx);
            parts.push(im.geometry.clone().applyMatrix4(mx));
          }
          geo = mergeGeometries(parts)!;
        } else geo = m.geometry.clone();
        geo.applyMatrix4(m.matrixWorld);
        const mesh = new THREE.Mesh(geo, toStandard(m.material as THREE.Material));
        mesh.name = `${top}__${o.name || m.material && (m.material as THREE.Material).type}`;
        if (o.name === 'screen') mesh.name = 'screen';
        out.add(mesh);
      });
      const glb = (await new GLTFExporter().parseAsync(out, { binary: true })) as ArrayBuffer;
      await fetch('http://localhost:4399/scene.glb', { method: 'POST', body: glb });
      console.log('exported', out.children.length, 'meshes,', glb.byteLength, 'bytes');
      (window as Window & { __exported?: number }).__exported = out.children.length;
    }, 2500);
    return () => clearTimeout(id);
  }, [scene]);
  return null;
}

function topGroup(o: THREE.Object3D) {
  let name = 'misc';
  o.traverseAncestors((a) => {
    if (a.userData.part) name = a.userData.part;
  });
  return name;
}

/** Unlit HDR colours (bulbs, LEDs, the screen) become emissive, so Blender lights the room with them. */
function toStandard(mat: THREE.Material): THREE.Material {
  const b = mat as THREE.MeshBasicMaterial;
  if (!b.isMeshBasicMaterial) return mat;
  const s = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1 });
  const c = b.color.clone();
  const k = Math.max(1, c.r, c.g, c.b);
  if (b.map) {
    s.emissiveMap = b.map;
    s.emissive.set(0xffffff);
    s.emissiveIntensity = 1;
  } else if (k > 1) {
    s.emissive.copy(c.multiplyScalar(1 / k));
    s.emissiveIntensity = k;
  } else s.color.copy(b.color);
  return s;
}
