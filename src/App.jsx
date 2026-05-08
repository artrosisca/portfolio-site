import React, { useState, useCallback } from 'react';
import { LayoutGroup, AnimatePresence, motion } from 'framer-motion';
import HeroScene from './components/3D/HeroScene';
import MainLayout from './components/MainLayout';
import TerminalWindow from './components/Terminal/TerminalWindow';

import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  // viewState can be '3d', 'terminal', or '2d'
  const [viewState, setViewState] = useState('3d');

  const handleEnterMonitor = useCallback(() => {
    setViewState('terminal');
  }, []);

  const handleTerminalComplete = useCallback(() => {
    setViewState('2d');
    // Allow normal scrolling once inside the 2D view by clearing inline styles
    document.body.style.overflow = '';
    // Reset scroll position so the user starts at the top of the 2D layout
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
          {viewState === 'terminal' && (
            <motion.div 
              key="terminal-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            >
              <TerminalWindow onComplete={handleTerminalComplete} />
            </motion.div>
          )}

          {viewState === '2d' && (
            <motion.div 
              key="main-content"
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
