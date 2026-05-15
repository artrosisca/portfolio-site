import { Link as ScrollLink } from 'react-scroll';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const photoRef = useRef(null);

  // Automatic ripple effect from the photo
  useEffect(() => {
    const triggerRipple = () => {
      if (photoRef.current) {
        const rect = photoRef.current.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const event = new CustomEvent('portfolio-ripple', {
          detail: {
            x,
            y,
            intensity: 3.5,
            duration: 7000, // Slow wave for the photo
            radius: 600,    // Wide reach
            width: 80       // Thickness of the wave ring
          }
        });
        window.dispatchEvent(event);
      }
    };

    // Initial ripple after a short delay
    const initialTimeout = setTimeout(triggerRipple, 1500);
    const interval = setInterval(triggerRipple, 3500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <section ref={sectionRef} className="min-h-[716px] flex flex-col justify-center items-start relative mb-stack-lg pt-24 md:pt-32">
      <div className="z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center w-full relative">
        <div className="order-2 lg:order-1 relative z-20">
          {/* Content remains unchanged */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-12 h-[2px] bg-primary-fixed"></span>
            <span className="font-label-md text-label-md text-primary-fixed uppercase tracking-[0.2em]">{t('hero.subheadline')}</span>
          </div>
          <h1 className="font-headline-xl text-[48px] md:text-[64px] lg:text-[100px] leading-[0.9] mb-6 font-bold tracking-tighter text-text-primary uppercase">
            ARTHUR <br /> <span className="text-primary-fixed">ROSISCA</span>
          </h1>

          <p className="font-headline-md text-headline-md text-on-surface-variant mb-10 max-w-xl">
            {t('hero.description')}
          </p>
          <div className="flex flex-wrap gap-4">
            <ScrollLink to="contact" smooth={false} duration={0} containerId="main-scroll-container" className="bg-primary-fixed text-on-primary-fixed font-bold px-6 py-3 text-sm active:scale-95 transition-all uppercase tracking-widest rounded-[12px] cursor-pointer">
              {t('hero.cta_contact')}
            </ScrollLink>
            <ScrollLink to="projects" smooth={false} duration={0} containerId="main-scroll-container" className="glass-panel border border-primary-fixed/30 text-on-surface font-bold px-6 py-3 text-sm hover:bg-primary-fixed/10 active:scale-95 transition-all uppercase tracking-widest rounded-[12px] cursor-pointer">
              {t('hero.cta_projects')}
            </ScrollLink>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300 transform hover:scale-110 cursor-pointer" href="https://www.linkedin.com/in/artrosisca/" target="_blank" rel="noopener noreferrer">
              <svg className="w-6 h-6 fill-current" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>LinkedIn</title>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
              </svg>
            </a>
            <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300 transform hover:scale-110 cursor-pointer" href="https://github.com/artrosisca" target="_blank" rel="noopener noreferrer">
              <svg className="w-6 h-6 fill-current" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>GitHub</title>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.805 1.102.805 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Profile Image Area — Holographic Style with Squircle HUD */}
        <div
          ref={photoRef}
          className="relative flex justify-center items-center order-1 lg:order-2"
        >
          {/* Squircle HUD Animes — Contained and Fully Rounded */}
          <div className="absolute w-[100%] h-[95%] border-2 border-primary-fixed/30 rounded-full scanning-hud scale-110 pointer-events-none z-0"></div>
          <div className="absolute w-[90%] h-[85%] border-2 border-dashed border-primary-fixed/40 rounded-full scanning-hud scale-105 pointer-events-none z-0" style={{ animationDirection: 'reverse' }}></div>

          {/* Profile Photo Container */}
          <div className="relative w-full max-w-[280px] md:max-w-[320px] lg:max-w-[380px] z-10">
            <div
              className="relative z-10"
              style={{
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
              }}
            >
              <img
                className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-700 brightness-110"
                alt="Arthur Rosisca portrait"
                src="/profile-hero.png"
              />
            </div>

            {/* Stylized Eye Data Strip (Cyber Censor) — Now Instant */}
            <div
              className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[65%] h-[11%] bg-[#FFF274] z-30 flex items-center justify-center overflow-hidden border-y border-black/10 shadow-[0_0_20px_rgba(255,242,116,0.4)]"
            >
              {/* Technical Text Scrolling Layer */}
              <div className="absolute inset-0 flex items-center opacity-90 pointer-events-none">
                <motion.div
                  className="flex gap-4 whitespace-nowrap text-[11px] font-mono text-black font-black tracking-[0.15em]"
                  animate={{ x: [0, -200] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  <span>0x41 0x52 0x54 0x48 0x55 0x52 0x5F 0x52 0x4F 0x53 0x49 0x53 0x43 0x41</span>
                  <span>0x41 0x52 0x54 0x48 0x55 0x52 0x5F 0x52 0x4F 0x53 0x49 0x53 0x43 0x41</span>
                </motion.div>
              </div>

              {/* Scanning Bar Animation */}
              <motion.div
                className="absolute inset-0 w-full h-[3px] bg-black/15 shadow-[0_0_5px_rgba(0,0,0,0.2)]"
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* Glitch Overlay Effect */}
              <motion.div
                className="absolute inset-0 bg-white/20 mix-blend-overlay"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 1.5 }}
              />
            </div>

            {/* Subtle Crosshairs */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-8 bg-primary-fixed/30 z-20"></div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-px h-8 bg-primary-fixed/30 z-20"></div>
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 h-px w-8 bg-primary-fixed/30 z-20"></div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 h-px w-8 bg-primary-fixed/30 z-20"></div>
          </div>

          {/* Decorative Back Lines */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-px bg-primary-fixed/10 rotate-45 z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-px bg-primary-fixed/10 -rotate-45 z-0"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
