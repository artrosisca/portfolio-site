import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, ScrollControls, useScroll, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-background">
        <div className="relative w-64 h-[2px] bg-white/5 overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-primary-fixed transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Scanning effect on the progress bar */}
          <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-primary-fixed/30 to-transparent animate-[scan_2s_linear_infinite]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-code-sm text-primary-fixed text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Initializing Surveillance System
          </span>
          <span className="font-code-sm text-primary-fixed/50 text-[9px] uppercase tracking-[0.2em]">
            Syncing Neural Link: {Math.round(progress)}%
          </span>
        </div>
      </div>
    </Html>
  );
}


function RoomModel() {
  const { scene } = useGLTF('/surveillance_room.glb');

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.x -= center.x;
    scene.position.y -= center.y;
    scene.position.z -= center.z;
  }, [scene]);

  return <primitive object={scene} />;
}

function CameraRig({ onEnterMonitor }) {
  const scroll = useScroll();
  const { camera } = useThree();

  const initialPos = new THREE.Vector3(15, 8, 15);
  const monitorCameraPos = new THREE.Vector3(0, -1.5, 0.2);
  const insideMonitorPos = new THREE.Vector3(0, -1.5, -1.6);

  const initialTarget = new THREE.Vector3(0, 0, 0);
  const monitorTarget = new THREE.Vector3(0, -1.5, -0.5);

  const currentTarget = new THREE.Vector3();
  const hasEntered = useRef(false);

  useFrame(() => {
    // offset goes from 0 (top) to 1 (bottom)
    const offset = scroll.offset;

    // Easing function for smoother transitions
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    if (offset < 0.6) {
      // Phase 1: Descend to monitor level
      const progress = ease(offset / 0.6);
      camera.position.lerpVectors(initialPos, monitorCameraPos, progress);
      currentTarget.lerpVectors(initialTarget, monitorTarget, progress);
    } else {
      // Phase 2: Push directly into monitor screen
      const progress = ease((offset - 0.6) / 0.4);
      camera.position.lerpVectors(monitorCameraPos, insideMonitorPos, progress);
      currentTarget.lerpVectors(monitorTarget, new THREE.Vector3(0, -1.5, insideMonitorPos.z - 2.0), progress);
    }

    camera.lookAt(currentTarget);

    if (offset > 0.98 && !hasEntered.current) {
      hasEntered.current = true;
      if (onEnterMonitor) onEnterMonitor();
    } else if (offset < 0.98 && hasEntered.current) {
      hasEntered.current = false;
    }
  });

  return null;
}

export default function HeroScene({ onEnterMonitor }) {
  return (
    <div className="fixed inset-0 z-0 bg-background overflow-hidden">
      <Canvas
        camera={{ position: [15, 8, 15], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.LinearSRGBColorSpace
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000)}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />

        <React.Suspense fallback={<Loader />}>
          <ScrollControls pages={2.0} damping={0.2}>
            <RoomModel />
            <CameraRig onEnterMonitor={onEnterMonitor} />
          </ScrollControls>
        </React.Suspense>
      </Canvas>
    </div>
  );
}
