import { Suspense, lazy, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { BloomEffect, VignetteEffect } from 'postprocessing';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { ARRIVE, C, DESK_Y, FOV } from './constants';
import { Room, Desk } from './objects/Room';
import { Monitor } from './objects/Monitor';
import { Keyboard } from './objects/Keyboard';
import { Lamp } from './objects/Lamp';
import { RubiksCube } from './objects/RubiksCube';
import { Guitar } from './objects/Guitar';
import { ZZPlant } from './objects/ZZPlant';
import { Decor } from './objects/Decor';
import { Dust, MUG_TOP, Steam } from './objects/Effects';
import type { Quality } from './quality';
// dev only: the dynamic import disappears from production builds with the DEV branch
const ExportScene = import.meta.env.DEV ? lazy(() => import('./exportScene').then((m) => ({ default: m.ExportScene }))) : () => null;
import { BakedRoom } from './BakedRoom';

export function Scene({ progress, lamp, quality, active, onReady, baked = false }: { progress: RefObject<number>; lamp: RefObject<number>; quality: Quality; active: boolean; onReady?: () => void; baked?: boolean }) {
  // a fixed resolution: switching it at runtime is what made the monitor go blurry/pixelated
  // for the first seconds (and every quality switch recompiled the shaders mid-animation)
  const dpr = quality === 'high' ? Math.min(1.5, window.devicePixelRatio || 1) : quality === 'mid' ? 1 : 0.8;

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      shadows={!baked && quality !== 'low'}
      dpr={dpr}
      camera={{ fov: FOV, near: 0.02, far: 30, position: [-0.7, 1.55, 3.05] }}
      gl={{ antialias: quality !== 'low', powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, outputColorSpace: THREE.SRGBColorSpace }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(C.ink, 1);
        // only hides the far edges of the room; the desk area stays clear
        scene.fog = new THREE.Fog(C.ink, 4.5, 11);
        // two frames later the scene is on screen: the loader can go
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >

      {baked ? (
        <Suspense fallback={null}>
          <BakedRoom lamp={lamp} />
          <Monitor progress={progress} screenOnly />
          <Steam position={MUG_TOP} />
          <Dust lamp={lamp} count={quality === 'low' ? 60 : 160} />
        </Suspense>
      ) : (
      <>
      {/* night: a dim cool fill plus a moonlight rim from the right */}
      <NightFill lamp={lamp} />
      <directionalLight position={[3, 3.5, 2]} color="#9fb0ff" intensity={0.55} />

      <Suspense fallback={null}>
        {/* userData.part names the groups for the Blender export (exportScene.tsx) */}
        <group userData={{ part: 'room' }}><Room /></group>
        <group userData={{ part: 'desk' }}><Desk /></group>
        <group userData={{ part: 'monitor' }}><Monitor progress={progress} /></group>
        <group userData={{ part: 'keyboard' }}><Keyboard /></group>
        <group userData={{ part: 'lamp' }}><Lamp shadowSize={quality === 'high' ? 2048 : 1024} power={lamp} /></group>
        <group userData={{ part: 'cube' }}><RubiksCube /></group>
        <group userData={{ part: 'guitar' }}><Guitar /></group>
        <group userData={{ part: 'plant' }}><ZZPlant position={[-1.45, 0, -0.38]} scale={1.3} /></group>
        <group userData={{ part: 'decor' }}><Decor /></group>
        <group userData={{ noExport: true }}>
          <Steam position={MUG_TOP} />
          <Dust lamp={lamp} count={quality === 'low' ? 60 : 160} />
        </group>
        {/* soft contact shadows ground the props on the desk; rendered for a few frames only */}
        <ContactShadows userData={{ noExport: true }} position={[0, DESK_Y + 0.0008, -0.15]} scale={[2.2, 1.05]} resolution={quality === 'high' ? 1024 : 512} far={0.25} blur={2.2} opacity={0.55} frames={40} color="#000000" />
      </Suspense>
      </>
      )}

      <CameraRig progress={progress} />
      {import.meta.env.DEV && <Suspense fallback={null}><ExportScene /></Suspense>}

      {quality !== 'low' && (
        <Post progress={progress} />
      )}
    </Canvas>
  );
}

/** Dim cool fill; slightly darker while the lamp is still off, so lighting it up reads. */
function NightFill({ lamp }: { lamp: RefObject<number> }) {
  const hemi = useRef<THREE.HemisphereLight>(null);
  useFrame(() => {
    if (hemi.current) hemi.current.intensity = 0.3 + 0.25 * (lamp.current ?? 1);
  });
  return <hemisphereLight ref={hemi} color="#8c97d9" groundColor="#1a1420" intensity={0.55} />;
}

function Post({ progress }: { progress: RefObject<number> }) {
  const bloom = useRef<BloomEffect>(null);
  const vignette = useRef<VignetteEffect>(null);
  useFrame(() => {
    const k = Math.max(0, 1 - (progress.current ?? 0) / (ARRIVE * 0.9));
    if (vignette.current) vignette.current.darkness = 0.7 * k;
    if (bloom.current) bloom.current.intensity = 0.8 * k;
  });
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.8} radius={0.7} />
      <Vignette ref={vignette} eskil={false} offset={0.25} darkness={0.7} />
    </EffectComposer>
  );
}
