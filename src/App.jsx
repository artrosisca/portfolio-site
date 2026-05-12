import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LayoutGroup, AnimatePresence, motion } from 'framer-motion';
import { Events, scroller } from 'react-scroll';
import HeroScene from './components/3D/HeroScene';
import MainLayout from './components/MainLayout';

import { LanguageProvider } from './contexts/LanguageContext';

/* ─── Yellow typing transition screen ─── */
function BootScreen({ onComplete }) {
  const [text, setText] = useState('');
  const fullText = '> Iniciando sessão...';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 600);
      }
    }, 70);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      key="boot-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#FFF48D' }}
    >
      <span className="font-code-sm text-2xl md:text-3xl text-black tracking-wide">
        {text}
        <span className="inline-block w-[3px] h-7 bg-black ml-1 align-middle cursor-blink" />
      </span>
    </motion.div>
  );
}

/* ─── Scroll-snap using react-scroll ─── */
const SECTIONS = ['hero', 'about', 'tech', 'projects', 'contact', 'footer-section'];

function useReactScrollSnap(containerId, enabled) {
  const timerRef = useRef(null);
  const isSnapping = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const snapToNearest = () => {
      if (isSnapping.current) return;

      const containerRect = container.getBoundingClientRect();
      const viewportCenter = containerRect.height / 2;
      let closest = null;
      let closestDist = Infinity;

      SECTIONS.forEach((sectionId) => {
        const el = document.getElementById(sectionId);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Distance from section center to viewport center
        const sectionCenter = rect.top - containerRect.top + rect.height / 2;
        const dist = Math.abs(sectionCenter - viewportCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = sectionId;
        }
      });

      if (closest) {
        isSnapping.current = true;
        scroller.scrollTo(closest, {
          duration: 500,
          smooth: 'easeInOutQuart',
          containerId: containerId,
          offset: 0,
        });
        // Reset snapping flag after animation completes
        setTimeout(() => {
          isSnapping.current = false;
        }, 600);
      }
    };

    const onScroll = () => {
      if (isSnapping.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(snapToNearest, 200);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [containerId, enabled]);
}

function App() {
  // viewState can be '3d', 'boot', or '2d'
  const [viewState, setViewState] = useState('3d');

  useReactScrollSnap('main-scroll-container', viewState === '2d');

  const handleEnterMonitor = useCallback(() => {
    setViewState('boot');
  }, []);

  const handleBootComplete = useCallback(() => {
    setViewState('2d');
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
  }, []);

  return (
    <LanguageProvider>
      <LayoutGroup>
        {viewState === '3d' && (
          <div className="fixed inset-0 z-50">
            <HeroScene onEnterMonitor={handleEnterMonitor} />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {viewState === 'boot' && (
            <BootScreen onComplete={handleBootComplete} />
          )}

          {viewState === '2d' && (
            <motion.div 
              key="main-content"
              id="main-scroll-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative z-10 w-full h-screen overflow-y-auto scroll-smooth"
            >
              <MainLayout />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </LanguageProvider>
  );
}

export default App;
