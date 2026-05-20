import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LayoutGroup, AnimatePresence, motion } from 'framer-motion';
import { Events, scroller } from 'react-scroll';
import HeroScene from './components/3D/HeroScene';
import MainLayout from './components/MainLayout';

import { LanguageProvider } from './contexts/LanguageContext';

import { useLanguage } from './contexts/LanguageContext';

/* ─── Yellow typing transition screen ─── */
function BootScreen({ onComplete }) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState('idle'); // idle, typing1, blink, erasing, typing2

  useEffect(() => {
    // Preload hero image for seamless transition
    const img = new Image();
    img.src = '/profile-hero.png';

    const msg1 = t('boot.msg1');
    const msg2 = t('boot.msg2');
    let timeoutId;
    let blinkCount = 0;

    // Phase 0: Show just ❯ with fast blinking cursor
    const idleBlink = () => {
      if (blinkCount < 5) {
        setShowCursor((prev) => !prev);
        blinkCount++;
        timeoutId = setTimeout(idleBlink, 100);
      } else {
        setShowCursor(true);
        blinkCount = 0;
        timeoutId = setTimeout(() => typeMsg1(0), 30);
      }
    };

    // Phase 1: Type "iniciando sessão" — fast
    const typeMsg1 = (i) => {
      setPhase('typing1');
      if (i <= msg1.length) {
        setText(msg1.slice(0, i));
        timeoutId = setTimeout(() => typeMsg1(i + 1), 25); // Slower typing
      } else {
        // Brief blink after typing
        timeoutId = setTimeout(() => blinkPause(), 200);
      }
    };

    // Phase 2: Quick blink pause
    const blinkPause = () => {
      setPhase('blink');
      if (blinkCount < 4) {
        setShowCursor((prev) => !prev);
        blinkCount++;
        timeoutId = setTimeout(blinkPause, 150); // Slower blink
      } else {
        setShowCursor(true);
        blinkCount = 0;
        timeoutId = setTimeout(() => eraseMsg1(msg1.length), 100);
      }
    };

    // Phase 3: Erase — very fast
    const eraseMsg1 = (i) => {
      setPhase('erasing');
      if (i >= 0) {
        setText(msg1.slice(0, i));
        timeoutId = setTimeout(() => eraseMsg1(i - 1), 15); // Slower erasing
      } else {
        timeoutId = setTimeout(() => typeMsg2(0), 150);
      }
    };

    // Phase 4: Type "seja bem vindo.."
    const typeMsg2 = (i) => {
      setPhase('typing2');
      if (i <= msg2.length) {
        setText(msg2.slice(0, i));
        timeoutId = setTimeout(() => typeMsg2(i + 1), 35); // Slower typing
      } else {
        timeoutId = setTimeout(() => onComplete(), 500);
      }
    };

    // Start with idle blink
    setPhase('idle');
    timeoutId = setTimeout(idleBlink, 100);
    return () => clearTimeout(timeoutId);
  }, [onComplete]);

  return (
    <motion.div
      key="boot-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#fff274' }}
    >
      <span className="font-code-sm text-2xl md:text-3xl text-black tracking-wide">
        <span className="text-black/60 mr-2">❯</span>
        {text}
        <span 
          className="inline-block w-[3px] h-7 bg-black ml-1 align-middle"
          style={{ opacity: showCursor ? 1 : 0 }}
        />
      </span>

      {/* Skip Button */}
      <div className="absolute bottom-10 left-10 pointer-events-auto">
        <button
          onClick={onComplete}
          className="flex items-center justify-center w-[72px] border border-black/15 hover:border-black/40 transition-all active:scale-95 rounded-lg h-9 bg-black/5 cursor-pointer group focus:outline-none"
          title="Skip"
        >
          <span className="group-hover:translate-x-0.5 transition-transform inline-block font-extrabold text-[#7a6f05] text-sm tracking-normal">❯❯❯</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Scroll-snap using react-scroll ─── */
const SECTIONS = ['hero', 'about', 'tech', 'projects', 'contact', 'footer-section'];

function App() {
  // viewState can be '3d', 'boot', or '2d'
  const [viewState, setViewState] = useState('3d');

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
              className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden md:snap-y md:snap-proximity scroll-smooth"
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
