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
        {/* Social Links */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300" href="#" aria-label="LinkedIn">
             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300" href="#" aria-label="GitHub">
             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.805 1.102.805 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
        </div>

        {/* Language Toggle */}
        <button 
          onClick={toggleLang}
          className="flex items-center gap-2 px-4 py-2 border border-[#333] hover:border-primary-fixed/50 transition-all active:scale-95 rounded-xl h-10 bg-[#1a1a1a]"
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
            className="bg-primary-fixed text-on-primary-fixed font-bold px-6 py-2 yellow-glow active:scale-95 transition-all duration-300 text-sm rounded-xl h-10 flex items-center" 
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

