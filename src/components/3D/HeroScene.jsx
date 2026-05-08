import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, ScrollControls, useScroll, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
function LoaderOverlay({ onLoaded, forceLoaded }) {
  const { progress } = useProgress();
  const [opacity, setOpacity] = React.useState(1);
  const [visible, setVisible] = React.useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  let displayProgress = progress;
  if (!minTimeElapsed && progress === 100) {
    displayProgress = 99;
  }
  if (minTimeElapsed && forceLoaded) {
    displayProgress = 100;
  }

  React.useEffect(() => {
    if (displayProgress === 100) {
      setOpacity(0);
      onLoaded();
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, onLoaded]);

  if (!visible) return null;

  return (
    <Html center zIndexRange={[100, 0]}>
      <div
        className="flex flex-col items-center justify-center w-screen h-screen bg-background transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{ opacity }}
      >
        <div className="relative w-64 h-[2px] bg-white/5 overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-primary-fixed transition-all duration-500 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
          <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-primary-fixed/30 to-transparent animate-[scan_2s_linear_infinite]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-code-sm text-primary-fixed text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Initializing Surveillance System
          </span>
          <span className="font-code-sm text-primary-fixed/50 text-[9px] uppercase tracking-[0.2em]">
            Syncing Neural Link: {Math.round(displayProgress)}%
          </span>
        </div>
      </div>
    </Html>
  );
}


function RoomModel({ onModelLoaded }) {
  const { scene } = useGLTF('/surveillance_room.glb');

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.x -= center.x;
    scene.position.y -= center.y;
    scene.position.z -= center.z;

    if (onModelLoaded) onModelLoaded();
  }, [scene, onModelLoaded]);

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

import { useLanguage } from '../../contexts/LanguageContext';

export default function HeroScene({ onEnterMonitor }) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [modelLoaded, setModelLoaded] = React.useState(false);
  const { lang, toggleLang } = useLanguage();

  // useCallback to prevent infinite loops in LoaderOverlay's useEffect
  const handleOverlayFinished = React.useCallback(() => {
    // Delay setting isLoaded by 1s to match the overlay fade out duration
    setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
  }, []);

  const handleModelLoaded = React.useCallback(() => {
    setModelLoaded(true);
  }, []);

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
        <LoaderOverlay onLoaded={handleOverlayFinished} forceLoaded={modelLoaded} />
        <React.Suspense fallback={null}>
          <ScrollControls pages={2.0} damping={0.2}>
            <RoomModel onModelLoaded={handleModelLoaded} />
            <CameraRig onEnterMonitor={onEnterMonitor} />
          </ScrollControls>
        </React.Suspense>
      </Canvas>

      {/* Scroll instruction appears only after loading is complete */}
      {isLoaded && (
        <>
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-primary-fixed font-code-sm text-xs uppercase tracking-[0.2em] pointer-events-none z-10 transition-opacity duration-1000"
            style={{ animationDuration: '2s' }}
          >
            <span className="mb-2">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-primary-fixed to-transparent"></div>
          </div>

          {/* Language Toggle in Bottom Left */}
          <div className="absolute bottom-10 left-10 z-20 animate-in fade-in duration-1000">
            <button
              onClick={toggleLang}
              className="flex items-center justify-center gap-2 w-[100px] border border-white/10 hover:border-primary-fixed/50 transition-all active:scale-95 rounded-xl h-10 bg-black/20 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-primary-fixed text-lg">translate</span>
              <span className="font-bold text-[#d4d4d4] uppercase text-xs tracking-wide">{lang}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
