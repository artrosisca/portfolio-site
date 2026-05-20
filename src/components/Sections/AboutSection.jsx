import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView, motion } from 'framer-motion';

/* ─── Terminal that types when the About section scrolls into view ─── */
function AboutTerminal() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [text, setText] = useState('');
  const [showJson, setShowJson] = useState(false);
  const hasStarted = useRef(false);

  const command = "cat core_attributes.json";

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    let i = 0;
    const interval = setInterval(() => {
      if (i <= command.length) {
        setText(command.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowJson(true), 400);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotateX: -10, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 85, damping: 14, mass: 1 }}
      className="glass-panel rounded-[12px] overflow-hidden w-full"
    >
      {/* Terminal Header */}
      <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-primary-fixed/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <div className="flex-grow text-center pr-8">
          <span className="text-[10px] font-code-sm text-on-surface-variant/50 tracking-widest uppercase">bash — 80x24</span>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div className="p-6 font-code-sm text-sm leading-relaxed text-left min-h-[350px] flex flex-col">
        {/* Starship Command Prompt Line 1 */}
        <div className="flex flex-wrap items-center text-[12px] leading-none font-mono mb-2">
          <span className="text-[#313244] mr-1">╭─</span>
          <span className="bg-[#313244] text-[#b4befe] px-2 py-1 font-bold flex items-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.001 0C5.376 0 .008 5.369.004 11.992H.002v9.287h.002A2.726 2.726 0 0 0 2.73 24h9.275c6.626-.004 11.993-5.372 11.993-11.997C23.998 5.375 18.628 0 12 0zm2.431 4.94c2.015 0 3.917 1.543 3.917 3.671 0 .197.001.395-.03.619a1.002 1.002 0 0 1-1.137.893 1.002 1.002 0 0 1-.842-1.175 2.61 2.61 0 0 0 .013-.337c0-1.207-.987-1.672-1.92-1.672-.934 0-1.775.784-1.777 1.672.016 1.027 0 2.046 0 3.07l1.732-.012c1.352-.028 1.368 2.009.016 1.998l-1.748.013c-.004.826.006.677.002 1.093 0 0 .015 1.01-.016 1.776-.209 2.25-2.124 4.046-4.424 4.046-2.438 0-4.448-1.993-4.448-4.437.073-2.515 2.078-4.492 4.603-4.469l1.409-.01v1.996l-1.409.013h-.007c-1.388.04-2.577.984-2.6 2.47a2.438 2.438 0 0 0 2.452 2.439c1.356 0 2.441-.987 2.441-2.437l-.001-7.557c0-.14.005-.252.02-.407.23-1.848 1.883-3.256 3.754-3.256z"/></svg>
          </span>
          <span className="bg-[#b4befe] text-[#313244] px-2 py-1 font-bold">
            arthur@portfolio
          </span>
          <span className="bg-[#fab387] text-[#313244] px-2 py-1 font-bold">
            ~/portfolio-site
          </span>
          <span className="bg-[#a6e3a1] text-[#11111b] px-2 py-1 font-bold">
            main
          </span>
        </div>

        {/* Starship Command Prompt Line 2 */}
        <div className="flex items-center break-all text-sm mb-4">
          <span className="text-[#313244] mr-2">╰─</span>
          <span className="text-[#a6e3a1] font-bold mr-2">❯</span>
          <span className="text-on-surface">{text}</span>
          {!showJson && isInView && <span className="inline-block w-[6px] h-4 bg-[#a6e3a1] ml-1 cursor-blink align-middle"></span>}
        </div>
        
        {/* JSON Output */}
        {showJson && (
          <div className="space-y-1 animate-in fade-in duration-500">
            <p className="text-on-surface">{"{"}</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"location"</span>: <span className="text-[#73daca]">"{t('terminal.location') || 'Ponta Grossa, PR'}"</span>,</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"specialization"</span>: <span className="text-[#73daca]">"{t('terminal.specialization')}"</span>,</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"focus"</span>: <span className="text-[#73daca]">"{t('terminal.focus')}"</span>,</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"status"</span>: <span className="text-[#73daca]">"{t('terminal.status')}"</span></p>
            <p className="text-on-surface">{"}"}</p>
            
            {/* New Starship Prompt after command */}
            <div className="mt-6 flex flex-wrap items-center text-[12px] leading-none font-mono mb-2">
              <span className="text-[#313244] mr-1">╭─</span>
              <span className="bg-[#313244] text-[#b4befe] px-2 py-1 font-bold flex items-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.001 0C5.376 0 .008 5.369.004 11.992H.002v9.287h.002A2.726 2.726 0 0 0 2.73 24h9.275c6.626-.004 11.993-5.372 11.993-11.997C23.998 5.375 18.628 0 12 0zm2.431 4.94c2.015 0 3.917 1.543 3.917 3.671 0 .197.001.395-.03.619a1.002 1.002 0 0 1-1.137.893 1.002 1.002 0 0 1-.842-1.175 2.61 2.61 0 0 0 .013-.337c0-1.207-.987-1.672-1.92-1.672-.934 0-1.775.784-1.777 1.672.016 1.027 0 2.046 0 3.07l1.732-.012c1.352-.028 1.368 2.009.016 1.998l-1.748.013c-.004.826.006.677.002 1.093 0 0 .015 1.01-.016 1.776-.209 2.25-2.124 4.046-4.424 4.046-2.438 0-4.448-1.993-4.448-4.437.073-2.515 2.078-4.492 4.603-4.469l1.409-.01v1.996l-1.409.013h-.007c-1.388.04-2.577.984-2.6 2.47a2.438 2.438 0 0 0 2.452 2.439c1.356 0 2.441-.987 2.441-2.437l-.001-7.557c0-.14.005-.252.02-.407.23-1.848 1.883-3.256 3.754-3.256z"/></svg>
              </span>
              <span className="bg-[#b4befe] text-[#313244] px-2 py-1 font-bold">
                arthur@portfolio
              </span>
              <span className="bg-[#fab387] text-[#313244] px-2 py-1 font-bold">
                ~/portfolio-site
              </span>
              <span className="bg-[#a6e3a1] text-[#11111b] px-2 py-1 font-bold">
                main
              </span>
            </div>
            <div className="flex items-center break-all text-sm">
              <span className="text-[#313244] mr-2">╰─</span>
              <span className="text-[#a6e3a1] font-bold mr-2">❯</span>
              <span className="inline-block w-[6px] h-4 bg-[#a6e3a1] ml-1 cursor-blink align-middle"></span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section className="mb-stack-lg relative" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch" style={{ perspective: 1200 }}>
        <div className="flex flex-col justify-between h-full py-1">
          <div className="space-y-6">
            <div className="section-header">
              <div className="corner-bracket-tl"></div>
              <h2 className="font-headline-lg text-headline-lg mb-6 text-text-primary uppercase tracking-tight">{t('about.title')}</h2>
            </div>
            <div className="space-y-6 text-on-surface-variant font-body-lg">
              <p dangerouslySetInnerHTML={{ __html: t('about.p1') }} />
              <p dangerouslySetInnerHTML={{ __html: t('about.p2') }} />
            </div>
          </div>
          
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ perspective: 1200 }}>
            <motion.div 
              initial={{ opacity: 0, rotateX: -10, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 85, damping: 14, mass: 1, delay: 0.1 }}
              className="glass-panel depth-card-hover p-4 rounded-xl text-center relative"
            >
              <span className="block font-headline-md text-primary-fixed font-bold uppercase text-sm mb-1">UTFPR</span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{t('about.degree')}</span>
            </motion.div>
          </div>
        </div>
        <div className="hidden lg:block">
          <AboutTerminal />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
