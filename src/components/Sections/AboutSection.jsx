import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from 'framer-motion';

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
    <div
      ref={ref}
      className="glass-panel rounded-[12px] border border-primary-fixed/20 overflow-hidden w-full"
      style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
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
      <div className="p-6 font-code-sm text-sm leading-relaxed text-left min-h-[300px] flex flex-col">
        {/* Command Prompt */}
        <div className="mb-4 break-all">
          <span className="text-primary-fixed font-bold">&gt; </span>
          <span className="text-on-surface">{text}</span>
          {!showJson && isInView && <span className="inline-block w-[6px] h-4 bg-primary-fixed ml-1 cursor-blink align-middle"></span>}
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
            
            <div className="mt-4 break-all">
              <span className="text-primary-fixed font-bold">&gt; </span>
              <span className="inline-block w-[6px] h-4 bg-primary-fixed ml-1 cursor-blink align-middle"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section className="mb-stack-lg relative" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="section-header">
            <div className="corner-bracket-tl"></div>
            <h2 className="font-headline-lg text-headline-lg mb-8 text-text-primary uppercase tracking-tight">{t('about.title')}</h2>
          </div>
          <div className="space-y-6 text-on-surface-variant font-body-lg">
            <p dangerouslySetInnerHTML={{ __html: t('about.p1') }} />
            <p dangerouslySetInnerHTML={{ __html: t('about.p2') }} />
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-primary-fixed/20 text-center relative">
                <span className="block font-headline-md text-primary-fixed uppercase text-sm mb-1">UTFPR</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{t('about.degree')}</span>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-primary-fixed/20 text-center">
                <span className="block font-headline-md text-primary-fixed uppercase text-sm mb-1">ENGLISH C1</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{t('about.proficiency')}</span>
              </div>
            </div>
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
