import React, { useState } from 'react';
import { LayoutGroup, AnimatePresence } from 'framer-motion';
import HeroScene from './components/3D/HeroScene';
import MainLayout from './components/MainLayout';
import TerminalWindow from './components/Terminal/TerminalWindow';

function App() {
  // viewState can be '3d', 'terminal', or '2d'
  const [viewState, setViewState] = useState('3d');

  const handleEnterMonitor = () => {
    setViewState('terminal');
  };

  const handleTerminalComplete = () => {
    setViewState('2d');
    // Allow normal scrolling once inside the 2D view
    document.body.style.overflow = 'auto';
    // Reset scroll position so the user starts at the top of the 2D layout
    window.scrollTo(0, 0);
  };

  return (
    <LayoutGroup>
      {viewState === '3d' && (
        <div className="fixed inset-0 z-50">
          <HeroScene onEnterMonitor={handleEnterMonitor} />
          {/* A simple overlay that tells user to scroll down */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-primary-fixed font-code-sm text-xs uppercase tracking-[0.2em] pointer-events-none">
            <span className="mb-2">Scroll to enter terminal</span>
            <div className="w-px h-10 bg-gradient-to-b from-primary-fixed to-transparent"></div>
          </div>
        </div>
      )}
      
      {viewState === 'terminal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <TerminalWindow onComplete={handleTerminalComplete} />
        </div>
      )}

      <AnimatePresence>
        {viewState === '2d' && (
          <div className="relative z-10 w-full animate-in fade-in duration-1000">
            <MainLayout />
          </div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

export default App;
