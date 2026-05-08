import React from 'react';
import TerminalWindow from '../Terminal/TerminalWindow';

const AboutSection = () => {
  return (
    <section className="mb-stack-lg relative" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="section-header">
            <div className="corner-bracket-tl"></div>
            <h2 className="font-headline-lg text-headline-lg mb-8 text-text-primary uppercase tracking-tight">SOBRE <span className="text-primary-fixed">_01</span></h2>
          </div>
          <div className="space-y-6 text-on-surface-variant font-body-lg">
            <p>Estudante de Ciência da Computação na <strong className="text-on-surface">UTFPR</strong>, com foco em Engenharia de Dados e automação industrial.</p>
            <p>Meu foco reside na manipulação de dados utilizando <strong className="text-on-surface">SQL e Pandas</strong>, buscando sempre otimizar processos através da análise técnica e arquitetura de dados eficiente.</p>
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-primary-fixed/20 text-center relative">
                <span className="block font-headline-md text-primary-fixed uppercase text-sm mb-1">UTFPR</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">BACHARELADO</span>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-primary-fixed/20 text-center">
                <span className="block font-headline-md text-primary-fixed uppercase text-sm mb-1">ENGLISH C1</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">PROFICIENCY</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <TerminalWindow />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
