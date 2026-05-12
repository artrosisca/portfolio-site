import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, ScrollControls, useScroll, useProgress } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Loading Overlay (rendered OUTSIDE Canvas so it covers everything) ─── */
function LoaderOverlay({ forceLoaded, onFadeComplete }) {
  const { progress } = useProgress();
  const [phase, setPhase] = React.useState('loading'); // 'loading' | 'fading' | 'done'
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  // Ensure the loader shows for at least 2.5 s so the animation is visible
  React.useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const displayProgress = (!minTimeElapsed && progress === 100)
    ? 99
    : (minTimeElapsed && forceLoaded) ? 100 : progress;

  // When progress hits 100, begin fade-out
  React.useEffect(() => {
    if (displayProgress === 100 && phase === 'loading') {
      setPhase('fading');
      const timer = setTimeout(() => {
        setPhase('done');
        onFadeComplete();
      }, 1200); // matches the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [displayProgress, phase, onFadeComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background pointer-events-none select-none"
      style={{
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Elegant progress bar */}
      <div className="w-48 h-[3px] bg-white/[0.06] overflow-hidden rounded-full relative">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${displayProgress}%`,
            background: 'linear-gradient(90deg, var(--color-primary-fixed), #ffe566)',
            boxShadow: '0 0 12px rgba(255,222,0,0.4)',
          }}
        />
      </div>
    </div>
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

/* ─── Animated scroll-down chevrons ─── */
function ScrollIndicator() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
      <span className="font-code-sm text-primary-fixed/70 text-[10px] uppercase tracking-[0.3em] mb-3">
        Scroll
      </span>
      {/* Three stacked chevrons that pulse downward */}
      <div className="flex flex-col items-center gap-[2px]">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="14" height="8" viewBox="0 0 14 8"
            className="text-primary-fixed"
            style={{
              opacity: 0,
              animation: `chevronPulse 2s ease-in-out ${i * 0.25}s infinite`,
            }}
          >
            <polyline
              points="1,1 7,6 13,1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

export default function HeroScene({ onEnterMonitor }) {
  const [overlayDone, setOverlayDone] = React.useState(false);
  const [modelLoaded, setModelLoaded] = React.useState(false);
  const { lang, toggleLang } = useLanguage();

  const handleFadeComplete = React.useCallback(() => {
    setOverlayDone(true);
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
        <React.Suspense fallback={null}>
          <ScrollControls pages={2.0} damping={0.2}>
            <RoomModel onModelLoaded={handleModelLoaded} />
            <CameraRig onEnterMonitor={onEnterMonitor} />
          </ScrollControls>
        </React.Suspense>
      </Canvas>

      {/* Loader overlay sits ABOVE canvas + UI, fading away to reveal everything at once */}
      <LoaderOverlay forceLoaded={modelLoaded} onFadeComplete={handleFadeComplete} />

      {/* Scroll indicator + Language toggle — always present once mounted,
          revealed naturally as the overlay fades out on top of them */}
      <ScrollIndicator />

      {/* Language Toggle — compact pill */}
      <div className="absolute bottom-10 left-10 z-20">
        <button
          onClick={toggleLang}
          className="flex items-center justify-center gap-1.5 px-3 border border-white/10 hover:border-primary-fixed/50 transition-all active:scale-95 rounded-lg h-9 bg-black/20 backdrop-blur-md"
        >
          <span className="material-symbols-outlined text-primary-fixed text-base">translate</span>
          <span className="font-bold text-[#d4d4d4] uppercase text-[11px] tracking-wide">{lang}</span>
        </button>
      </div>
    </div>
  );
}
