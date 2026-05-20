import React from 'react';

const ExperienceSection = () => {
  return (
    <section className="mb-stack-lg relative">
      <div className="section-header mb-12">
        <div className="corner-bracket-tl"></div>
        <h2 className="font-headline-lg text-headline-lg text-text-primary uppercase tracking-tight">HISTÓRICO <span className="text-primary-fixed">PROFISSIONAL</span></h2>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 w-px h-full bg-primary-fixed/10 ml-6 hidden md:block"></div>
        {/* Card Experience */}
        <div className="md:pl-20 relative mb-12 group">
          <div className="hidden md:block absolute left-4 top-2 w-4 h-4 rounded-full bg-primary-fixed shadow-[0_0_10px_#b4ad07]"></div>
          <div className="glass-panel p-8 rounded-xl border border-primary-fixed/20 group-hover:border-primary-light transition-all relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="font-headline-md text-headline-md text-text-primary uppercase">Front-end Developer</h3>
                <span className="text-primary-fixed font-bold uppercase text-sm tracking-widest">Onikode Solutions</span>
              </div>
              <span className="font-code-sm text-xs bg-surface-container px-3 py-1 rounded-full text-on-surface-variant uppercase">Março 2025 – Agosto 2025</span>
            </div>
            <ul className="space-y-3 text-on-surface-variant font-body-md list-disc list-inside marker:text-primary-fixed uppercase text-xs tracking-widest leading-loose">
              <li>Estruturação do ecossistema de rotas e interface para plataforma de delivery B2B utilizando Angular e TypeScript.</li>
              <li>Implementação de biblioteca modular de componentes, otimizando o tempo de desenvolvimento em 30%.</li>
              <li>Consumo de APIs REST e realização de Code Reviews técnicos com foco em performance e qualidade de código.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
