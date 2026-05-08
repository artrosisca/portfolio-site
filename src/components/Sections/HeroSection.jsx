import React from 'react';
import TerminalWindow from '../Terminal/TerminalWindow';

const HeroSection = () => {
  return (
    <section className="min-h-[716px] flex flex-col justify-center items-start relative mb-stack-lg pt-32">
      <div className="z-10 grid lg:grid-cols-2 gap-12 items-center w-full relative">
        {/* Removed Hero Glow to prevent clipping and keep clean look */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-12 h-[2px] bg-primary-fixed"></span>
            <span className="font-label-md text-label-md text-primary-fixed uppercase tracking-[0.2em]">DATA ENGINEERING CORE</span>
          </div>
          <h1 className="font-headline-xl text-[64px] md:text-[100px] leading-none mb-6 font-bold tracking-tighter text-text-primary uppercase">
            ARTHUR <br /> <span className="text-primary-fixed">ROSISCA</span>
          </h1>

          <p className="font-headline-md text-headline-md text-on-surface-variant mb-10 max-w-xl">
            Engenheiro de Dados. Transformando fluxos brutos em inteligência industrial e pipelines de alta performance.
          </p>
          <div className="flex flex-wrap gap-4">
            <a className="bg-primary-fixed text-on-primary-fixed font-bold px-8 py-4 text-lg active:scale-95 transition-all uppercase tracking-widest rounded-[15px]" href="#contact">
              Contact
            </a>
            <a className="bg-surface-container border border-primary-fixed/30 text-on-surface font-bold px-8 py-4 text-lg hover:bg-primary-fixed/10 active:scale-95 transition-all uppercase tracking-widest rounded-[15px]" href="#projects">
              View Projects
            </a>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300 transform hover:scale-110" href="#">
              <svg className="w-8 h-8 fill-current" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>LinkedIn</title>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
              </svg>
            </a>
            <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300 transform hover:scale-110" href="#">
              <svg className="w-8 h-8 fill-current" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>GitHub</title>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.805 1.102.805 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
            </a>
          </div>
        </div>
        {/* Profile HUD Decoration */}
        <div className="relative flex justify-center items-center">
          {/* Scanning HUD - Adjusting sizes to prevent clipping */}
          <div className="absolute w-[100%] h-[100%] border border-primary-fixed/10 rounded-full scanning-hud scale-110"></div>
          <div className="absolute w-[100%] h-[100%] border border-dashed border-primary-fixed/20 rounded-full scanning-hud scale-105" style={{ animationDirection: 'reverse' }}></div>
          {/* Crosshairs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-primary-fixed/10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-primary-fixed/10"></div>
          <div className="relative aspect-square w-full max-w-md overflow-hidden border-2 border-primary-fixed p-2 rounded-full">
            <img className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700" alt="Arthur Rosisca portrait in a circular HUD frame." src="https://lh3.googleusercontent.com/aida/ADBb0ugmf5rvLOBWeOKcow3tb_P2oKMVg-YThulBvaFnUjYUcKg9MY0oUbCKlUvK44MuOagHIWbl31M3F2FPnZ73qLRhIJG8hhObBzpDG6OTJky3-OKnJHE8caFQizGs8tzjVjGYI9eze-hEPy7fesooKEHri245Cjbso60bfOMZAbFDHi34PHQ8uu0B98vMMzzkMpF8ofsQPEpYVSVOa1gphq5OWZ2zfqv2Mx0nseuIHa4D1PtdO-BN9sPQxvTPZdGTmFkrIWOSiPS3Lnk" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
