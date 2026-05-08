import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TerminalWindow({ onComplete, isFinished }) {
  const [text, setText] = useState(isFinished ? "cat core_attributes.json" : '');
  const [showJson, setShowJson] = useState(isFinished || false);
  
  const command = "cat core_attributes.json";

  useEffect(() => {
    if (isFinished) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= command.length) {
        setText(command.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowJson(true);
          // Trigger the next phase shortly after JSON is revealed
          if (onComplete) {
            setTimeout(onComplete, 1500); // 1.5s delay before moving to 2D layout
          }
        }, 400); // Wait a bit before showing output
      }
    }, 100); // typing speed
    
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      layoutId="terminal"
      className="glass-panel rounded-[12px] border border-primary-fixed/20 overflow-hidden shadow-[inset_0_0_20px_rgba(250,229,0,0.05)] w-full max-w-lg mx-auto z-50" 
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
          <span className="text-[#73daca]">arthur@utfpr</span>
          <span className="text-[#bb9af7]"> MINGW64 </span>
          <span className="text-[#e0af68]">~/portfolio</span>
          <span className="text-[#7aa2f7]"> (main)</span>
          <span className="text-on-surface ml-2">$ {text}</span>
          {!showJson && <span className="inline-block w-[6px] h-4 bg-primary-fixed ml-1 cursor-blink align-middle"></span>}
        </div>
        
        {/* JSON Output */}
        {showJson && (
          <div className="space-y-1 animate-in fade-in duration-500">
            <p className="text-on-surface">{"{"}</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"location"</span>: <span className="text-[#73daca]">"Ponta Grossa, PR"</span>,</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"specialization"</span>: <span className="text-[#73daca]">"Data Engineering"</span>,</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"focus"</span>: <span className="text-[#73daca]">"Data Modeling / Lakehouse"</span>,</p>
            <p className="ml-4"><span className="text-[#bb9af7]">"status"</span>: <span className="text-[#73daca]">"Available_for_Operations"</span></p>
            <p className="text-on-surface">{"}"}</p>
            
            <div className="mt-4 break-all">
              <span className="text-[#73daca]">arthur@utfpr</span>
              <span className="text-[#bb9af7]"> MINGW64 </span>
              <span className="text-[#e0af68]">~/portfolio</span>
              <span className="text-[#7aa2f7]"> (main)</span>
              <span className="text-on-surface ml-2">$ </span>
              <span className="inline-block w-[6px] h-4 bg-primary-fixed ml-1 cursor-blink align-middle"></span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

