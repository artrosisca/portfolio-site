import { Suspense, useState, type RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor, SoftShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { Desk } from './objects/Desk';
import { Monitor } from './objects/Monitor';
import { Keyboard } from './objects/Keyboard';
import { Lamp } from './objects/Lamp';
import { RubiksCube } from './objects/RubiksCube';
import { Guitar } from './objects/Guitar';
import { Props } from './objects/Props';
import type { Quality } from './quality';

export function Scene({
  progress,
  quality: initial,
  reduced,
}: {
  progress: RefObject<number>;
  quality: Quality;
  reduced: boolean;
}) {
  const [quality, setQuality] = useState<Quality>(initial);
  const dpr: [number, number] = quality === 'high' ? [1, 2] : quality === 'mid' ? [1, 1.5] : [0.75, 1];

  return (
    <Canvas
      shadows={quality !== 'low'}
      dpr={dpr}
      camera={{ fov: 35, near: 0.05, far: 40, position: [-1.5, 1.55, 3.3] }}
      gl={{
        antialias: quality !== 'low',
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#050507', 1);
        scene.fog = new THREE.FogExp2('#050507', 0.22);
      }}
    >
      <PerformanceMonitor
        onDecline={() => setQuality((q) => (q === 'high' ? 'mid' : 'low'))}
        onIncline={() => setQuality((q) => (q === 'low' ? 'mid' : q))}
      />
      <AdaptiveDpr pixelated={false} />
      {quality === 'high' && <SoftShadows size={12} samples={10} focus={0.6} />}

      {/* cool, very dim fill so blacks keep a hint of blue */}
      <ambientLight color="#7b8cff" intensity={0.08} />
      <hemisphereLight color="#3b4466" groundColor="#05060a" intensity={0.12} />
      {/* cool "window" light from the right: rims the guitar and the cube */}
      <pointLight position={[2.4, 2.3, 1.4]} color="#7f9bff" intensity={3.2} distance={8} decay={2} />
      <pointLight position={[1.9, 1.2, -0.6]} color="#5d74d6" intensity={1.2} distance={4} decay={2} />

      <Suspense fallback={null}>
        <Desk />
        <Monitor />
        <Keyboard />
        <Lamp />
        <RubiksCube />
        <Guitar />
        <Props />
      </Suspense>

      <CameraRig progress={progress} reduced={reduced} />

      {quality !== 'low' && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} radius={0.6} />
          <Vignette eskil={false} offset={0.2} darkness={0.85} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
