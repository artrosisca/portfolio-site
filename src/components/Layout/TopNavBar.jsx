import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { useLanguage } from '../../contexts/LanguageContext';

const TopNavBar = () => {
  const [showCV, setShowCV] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = ['hero', 'about', 'tech', 'projects', 'contact'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const navItems = [
    { id: 'about', label: t('nav.about') },
    { id: 'tech', label: t('nav.tech') },
    { id: 'projects', label: t('nav.projects') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-container-max z-50 flex justify-between items-center px-gutter py-3 bg-surface/60 backdrop-blur-xl border border-primary-fixed/10 border-t-0 shadow-2xl rounded-b-2xl transition-all duration-300">
      <div className="font-headline-lg text-headline-lg font-bold text-primary-fixed tracking-tighter uppercase">ARTHUR ROSISCA</div>
      
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <ScrollLink
            key={item.id}
            to={item.id}
            smooth={false}
            duration={0}
            containerId="main-scroll-container"
            spy={true}
            className={`font-label-md text-label-md uppercase tracking-[0.2em] transition-colors relative cursor-pointer ${
              activeSection === item.id ? 'text-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'
            }`}
          >
            {item.label}
            {activeSection === item.id && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary-fixed"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </ScrollLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {/* Language Toggle */}
        <button 
          onClick={toggleLang}
          className="flex items-center justify-center gap-1.5 px-3 border border-white/10 hover:border-primary-fixed/50 transition-all active:scale-95 rounded-lg h-9 bg-black/20 backdrop-blur-md cursor-pointer"
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
            className="bg-primary-fixed text-on-primary-fixed font-bold py-2 active:scale-95 transition-all duration-300 text-sm rounded-xl h-10 flex items-center justify-center w-[150px] cursor-pointer" 
            href={lang === 'PT' ? '/arthur_resume_pt-br.pdf' : '/arthur_resume_en.pdf'}
            download
          >
            {t('nav.download_cv')}
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
                  <span className="text-[10px] font-bold text-primary-fixed uppercase tracking-wider">{t('nav.doc_preview')}</span>
                </div>
                <div className="p-2">
                  <img src="/resume_thumb.png" alt="CV Preview" className="w-full h-auto rounded-lg shadow-inner opacity-80" />
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
