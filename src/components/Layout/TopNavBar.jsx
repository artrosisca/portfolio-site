import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TopNavBar = () => {
  const [showCV, setShowCV] = useState(false);
  const [lang, setLang] = useState('PT');

  const toggleLang = () => setLang(lang === 'PT' ? 'EN' : 'PT');

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-container-max z-50 flex justify-between items-center px-gutter py-3 bg-surface/60 backdrop-blur-xl border border-primary-fixed/10 border-t-0 shadow-2xl rounded-b-2xl transition-all duration-300">
      <div className="font-headline-lg text-headline-lg font-bold text-primary-fixed tracking-tighter uppercase">ARTHUR ROSISCA</div>
      
      <nav className="hidden md:flex items-center gap-8">
        <a className="text-on-surface-variant font-label-md text-label-md uppercase tracking-[0.2em] hover:text-primary-fixed transition-colors" href="#about">ABOUT</a>
        <a className="text-on-surface-variant font-label-md text-label-md uppercase tracking-[0.2em] hover:text-primary-fixed transition-colors" href="#tech">TECH STACK</a>
        <a className="text-on-surface-variant font-label-md text-label-md uppercase tracking-[0.2em] hover:text-primary-fixed transition-colors" href="#projects">PROJECTS</a>
        <a className="text-on-surface-variant font-label-md text-label-md uppercase tracking-[0.2em] hover:text-primary-fixed transition-colors" href="#contact">CONTACT</a>
      </nav>

      <div className="flex items-center gap-4">


        {/* Language Toggle */}
        <button 
          onClick={toggleLang}
          className="flex items-center justify-center gap-2 w-[100px] border border-[#333] hover:border-primary-fixed/50 transition-all active:scale-95 rounded-xl h-10 bg-[#1a1a1a]"
        >
          <span className="material-symbols-outlined text-primary-fixed text-lg">translate</span>
          <span className="font-bold text-[#d4d4d4] uppercase text-xs tracking-wide">{lang}</span>
        </button>

        {/* Download CV with Teaser */}
        <div 
          className="relative flex items-center"
          onMouseEnter={() => setShowCV(true)}
          onMouseLeave={() => setShowCV(false)}
        >
          <a 
            className="bg-primary-fixed text-on-primary-fixed font-bold px-6 py-2 active:scale-95 transition-all duration-300 text-sm rounded-xl h-10 flex items-center" 
            href="/arthur_resume_pt-br.pdf"
            download
          >
            {lang === 'PT' ? 'Baixar CV' : 'Download CV'}
          </a>
          
          <AnimatePresence>
            {showCV && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-14 right-0 w-64 bg-surface-container rounded-xl border border-primary-fixed/20 shadow-2xl overflow-hidden z-50 pointer-events-none"
              >
                <div className="bg-primary-fixed/10 px-3 py-2 border-b border-primary-fixed/10">
                  <span className="text-[10px] font-bold text-primary-fixed uppercase tracking-wider">Document Preview</span>
                </div>
                <div className="p-2">
                  <img src="/cv_preview_mockup.png" alt="CV Preview" className="w-full h-auto rounded-lg shadow-inner opacity-80" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;

