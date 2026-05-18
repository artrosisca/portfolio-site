import React from 'react';

const Footer = () => {
  return (
    <div className="flex justify-center w-full pb-0 mt-0">
      <footer className="w-[95%] max-w-container-max py-3 md:py-4 px-4 md:px-gutter flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/60 backdrop-blur-xl border border-primary-fixed/10 border-b-0 rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
        <div className="font-headline-md text-headline-md text-text-primary uppercase">ARTHUR <span className="text-primary-fixed">ROSISCA</span></div>
        <p className="font-code-sm text-[10px] text-on-surface-variant uppercase tracking-widest text-center">© {new Date().getFullYear()} ARTHUR ROSISCA. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-6">
          <a className="text-on-surface-variant hover:text-primary-fixed transition-colors font-code-sm text-[10px] uppercase tracking-widest" href="https://www.linkedin.com/in/artrosisca/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="text-on-surface-variant hover:text-primary-fixed transition-colors font-code-sm text-[10px] uppercase tracking-widest" href="https://github.com/artrosisca" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
