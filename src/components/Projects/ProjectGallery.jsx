import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.805 1.102.805 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
  </svg>
);
import { useLanguage } from '../../contexts/LanguageContext';

export default function ProjectGallery() {
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  const projects = [
    {
      id: 1,
      title: t('projects.p1.title'),
      category: "DATA WAREHOUSE",
      domain: "DATA ENGINEERING",
      description: t('projects.p1.desc'),
      tags: ["ETL", "SQL-SERVER", "MEDALLION-ARCHITECTURE", "STAR-SCHEMA", "T-SQL"],
      link: "https://github.com/artrosisca/sql-data-warehouse",
      image: "/dw-arquitetura.png",
      architecture: [
        { step: "01", title: "Bronze Layer", desc: t('projects.p1.step1') },
        { step: "02", title: "Silver Layer", desc: t('projects.p1.step2') },
        { step: "03", title: "Gold Layer", desc: t('projects.p1.step3') }
      ]
    },
    {
      id: 2,
      title: t('projects.p2.title'),
      category: "MACHINE LEARNING",
      domain: "HEALTH TECH",
      description: t('projects.p2.desc'),
      tags: ["PYTHON", "PANDAS", "SKLEARN", "RANDOM-FOREST", "ETL"],
      link: "https://github.com/artrosisca/Predicao-Dcnt-Unimed",
      image: "/ml-grafico.jpg.png",
      architecture: [
        { step: "01", title: "ETL Pipeline", desc: t('projects.p2.step1') },
        { step: "02", title: "Model Comparison", desc: t('projects.p2.step2') },
        { step: "03", title: "Data Quality", desc: t('projects.p2.step3') }
      ]
    },
    {
      id: 3,
      title: t('projects.p3.title'),
      category: "WEB APPLICATION",
      domain: "FULL STACK",
      description: t('projects.p3.desc'),
      tags: ["PHP", "MySQL", "HTML/CSS", "REST-API", "MVC"],
      link: "https://github.com/artrosisca/controle-despesas",
      architecture: [
        { step: "01", title: "Backend", desc: t('projects.p3.step1') },
        { step: "02", title: "Frontend", desc: t('projects.p3.step2') },
        { step: "03", title: "Reports", desc: t('projects.p3.step3') }
      ]
    },
    {
      id: 4,
      title: t('projects.p4.title'),
      category: "PROCESS MINING",
      domain: "DATA SCIENCE",
      description: t('projects.p4.desc'),
      tags: ["PYTHON", "PM4PY", "JUPYTER", "PROCESS-MINING", "EVENT-LOGS"],
      link: "https://github.com/artrosisca/process-mining-Analise-Fluxo-Recebimento",
      image: "/fluxo.jpg.png",
      architecture: [
        { step: "01", title: "ETL", desc: t('projects.p4.step1') },
        { step: "02", title: "Discovery", desc: t('projects.p4.step2') },
        { step: "03", title: "Conformance", desc: t('projects.p4.step3') }
      ]
    }
  ];

  const scrollTo = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.offsetWidth || container.offsetWidth;
    const gap = 32;
    const step = cardWidth + gap;

    if (direction === 'next') {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 10) {
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="mb-stack-lg relative" id="projects">
      <div className="flex items-center justify-between mb-12">
        <div className="section-header">
          <div className="corner-bracket-tl"></div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary uppercase tracking-tight">{t('projects.title')}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollTo('prev')} className="w-12 h-12 rounded-full flex items-center justify-center glass-panel depth-btn-secondary cursor-pointer">
            <ChevronLeft className="text-primary-dark" />
          </button>
          <button onClick={() => scrollTo('next')} className="w-12 h-12 rounded-full flex items-center justify-center glass-panel depth-btn-secondary cursor-pointer">
            <ChevronRight className="text-primary-dark" />
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden w-full -mt-6 pt-6">
        <div ref={scrollRef} className="w-full flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pt-6 pb-8 -mt-6" style={{ perspective: 1200 }}>
          {projects.map((project, index) => (
            <motion.div 
              key={project.id} 
              initial={{ opacity: 0, rotateX: -8, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                type: "spring", 
                stiffness: 85, 
                damping: 14, 
                mass: 1,
                delay: index * 0.05
              }}
              className="flex-shrink-0 w-full snap-center px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 glass-panel rounded-xl overflow-hidden group">
                <div className="h-48 md:h-64 relative overflow-hidden bg-surface-container-highest/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80 z-10"></div>
                  
                  {project.image ? (
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 z-0" 
                    />
                  ) : (
                    <div className="absolute inset-0 opacity-20 flex items-center justify-center text-primary-fixed font-code-sm text-[8px] overflow-hidden leading-tight break-all z-0 px-4">
                      {`SELECT * FROM ${project.domain.replace(' ', '_')} WHERE STATUS = 'ACTIVE' AND IMPACT > 9000; `.repeat(50)}
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 flex gap-2.5 z-20">
                    <span className="bg-[#202023]/65 text-text-primary border-2 border-primary-light/35 backdrop-blur-md font-bold text-[10px] px-3 py-1.5 rounded-md uppercase tracking-wider">
                      {project.category}
                    </span>
                    <span className="bg-[#202023]/65 text-text-primary border-2 border-white/25 backdrop-blur-md font-bold text-[10px] px-3 py-1.5 rounded-md uppercase tracking-wider">
                      {project.domain}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 md:p-8">
                  <h3 className="font-headline-md text-headline-md mb-4 text-text-primary uppercase">{project.title}</h3>
                  <p className="text-on-surface-variant mb-8 font-body-md">{project.description}</p>
                  
                  {/* Technical Specs as inline tag pills — replaces the old big squares */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="font-code-sm text-sm text-text-primary uppercase px-4 py-2 rounded-md border border-white/15 bg-[#202023]/65 backdrop-blur-sm tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="glass-panel rounded-xl p-4 md:p-8 flex-grow relative">
                  <h4 className="font-label-md text-label-md mb-8 text-text-primary uppercase tracking-[0.2em]">{t('projects.architecture')}</h4>
                  <ul className="space-y-6">
                    {project.architecture.map((arch, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="w-8 h-8 rounded-full border border-primary-fixed text-text-primary flex items-center justify-center font-bold text-xs shrink-0">{arch.step}</span>
                        <div>
                          <h5 className="font-bold text-text-primary uppercase text-xs">{arch.title}</h5>
                          <p className="text-xs text-on-surface-variant mt-1">{arch.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="glass-panel depth-card-hover p-6 rounded-xl flex items-center justify-between transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <GithubIcon className="w-5 h-5 text-on-surface-variant" />
                    <span className="font-bold text-text-primary uppercase text-xs tracking-widest">{t('projects.view_github')}</span>
                  </div>
                  <ArrowRight className="text-primary-dark group-hover:translate-x-2 transition-transform w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
