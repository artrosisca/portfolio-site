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
  const fullText = t('boot.message') || '> Iniciando sessão...';

  useEffect(() => {
    let i = 0;
    let isErasing = false;
    let timeoutId;
    
    const type = () => {
      if (!isErasing) {
        if (i <= fullText.length) {
          setText(fullText.slice(0, i));
          i++;
          timeoutId = setTimeout(type, 20); // very fast typing
        } else {
          isErasing = true;
          timeoutId = setTimeout(type, 600); // hold for a moment
        }
      } else {
        if (i >= 0) {
          setText(fullText.slice(0, i));
          i--;
          timeoutId = setTimeout(type, 10); // fast erase
        } else {
          onComplete();
        }
      }
    };
    
    type();
    return () => clearTimeout(timeoutId);
  }, [fullText, onComplete]);

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
        {text}
        <span className="inline-block w-[3px] h-7 bg-black ml-1 align-middle cursor-blink" />
      </span>
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
              className="relative z-10 w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
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
