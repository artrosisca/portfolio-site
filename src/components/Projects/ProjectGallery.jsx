import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: "SQL Data Warehouse (Medallion Architecture)",
    category: "DATA WAREHOUSE",
    domain: "DATA ENGINEERING",
    description: "Implementação de um Data Warehouse completo utilizando o SQL Server, estruturado sob a Arquitetura de Medalhão (Bronze, Silver e Gold). O projeto simula um ecossistema real de engenharia de dados, integrando fontes distintas de CRM e ERP para transformar dados brutos em um modelo dimensional de alto desempenho (Star Schema).",
    stats: [
      { value: "3", label: "LAYERS" },
      { value: "Star", label: "SCHEMA" },
      { value: "T-SQL", label: "LANGUAGE" }
    ],
    tags: ["ETL", "SQL-SERVER", "MEDALLION-ARCHITECTURE", "STAR-SCHEMA"],
    link: "https://github.com/artrosisca/sql-data-warehouse",
    architecture: [
      { step: "01", title: "Bronze Layer", desc: "Ingestão de dados brutos do CRM e ERP." },
      { step: "02", title: "Silver Layer", desc: "Limpeza, padronização e data quality." },
      { step: "03", title: "Gold Layer", desc: "Modelagem dimensional (Star Schema) pronta para BI." }
    ]
  },
  {
    id: 2,
    title: "Predição de Risco de Doenças Crônicas",
    category: "MACHINE LEARNING",
    domain: "HEALTH TECH",
    description: "Desenvolvido em parceria com Unimed & UTFPR para identificar precocemente beneficiários em risco.",
    stats: [
      { value: "84.57%", label: "RECALL RATE" },
      { value: "R$ 65.8k", label: "ANNUAL SAVINGS" },
      { value: "10k+", label: "BENEFICIARIES" }
    ],
    tags: ["ETL", "SCALABLE", "REAL-TIME", "PANDAS", "SKLEARN"],
    link: "#",
    architecture: [
      { step: "01", title: "ETL Pipeline", desc: "Consolidação de 6 fontes distintas e padronização." },
      { step: "02", title: "Model Comparison", desc: "Random Forest e Gradient Boosting." },
      { step: "03", title: "Data Quality", desc: "Tratamento de outliers clínicos." }
    ]
  }
];

export default function ProjectGallery() {
  return (
    <section className="mb-stack-lg relative" id="projects">
      <div className="flex items-center gap-4 mb-12">
        <div className="section-header">
          <div className="corner-bracket-tl"></div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary uppercase tracking-tight">IMPACT <span className="text-primary-fixed">PROJECTS</span></h2>
        </div>
        <div className="flex-grow h-px bg-primary-fixed/10 mx-4"></div>
        <div className="flex gap-2">
          <button className="w-12 h-12 rounded-full border border-primary-fixed/20 flex items-center justify-center hover:border-primary-fixed transition-colors active:scale-90">
            <ChevronLeft className="text-primary-fixed" />
          </button>
          <button className="w-12 h-12 rounded-full border border-primary-fixed/20 flex items-center justify-center hover:border-primary-fixed transition-colors active:scale-90">
            <ChevronRight className="text-primary-fixed" />
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden w-full">
        <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-4">
          {projects.map((project) => (
            <div key={project.id} className="flex-shrink-0 w-full snap-start grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 glass-panel border border-primary-fixed/20 rounded-xl overflow-hidden group">
                <div className="h-64 relative overflow-hidden bg-surface-container-highest/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80 z-10"></div>
                  
                  {/* Background decoration representing data for the project image placeholder */}
                  <div className="absolute inset-0 opacity-20 flex items-center justify-center text-primary-fixed font-code-sm text-[8px] overflow-hidden leading-tight break-all z-0 px-4">
                    {`SELECT * FROM ${project.domain.replace(' ', '_')} WHERE STATUS = 'ACTIVE' AND IMPACT > 9000; `.repeat(50)}
                  </div>

                  <div className="absolute bottom-6 left-6 flex gap-2 z-20">
                    <span className="bg-primary-fixed text-on-primary-fixed font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">{project.category}</span>
                    <span className="bg-surface-container text-primary-fixed font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">{project.domain}</span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="font-headline-md text-headline-md mb-4 text-text-primary uppercase">{project.title}</h3>
                  <p className="text-on-surface-variant mb-8 font-body-md">{project.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {project.stats.map((stat, i) => (
                      <div key={i} className="border border-primary-fixed/10 p-6 rounded-xl bg-surface-container-lowest">
                        <span className="block text-primary-fixed font-headline-lg text-[40px]">{stat.value}</span>
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Technical Specs Footer */}
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-primary-fixed/10 font-code-sm text-[10px] text-primary-fixed/60">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="uppercase">[{tag}]</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="glass-panel border border-primary-fixed/20 rounded-xl p-8 flex-grow relative">
                  <h4 className="font-label-md text-label-md mb-8 text-text-primary uppercase tracking-[0.2em]">ARQUITETURA</h4>
                  <ul className="space-y-6">
                    {project.architecture.map((arch, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="w-8 h-8 rounded-full border border-primary-fixed text-primary-fixed flex items-center justify-center font-bold text-xs shrink-0">{arch.step}</span>
                        <div>
                          <h5 className="font-bold text-text-primary uppercase text-xs">{arch.title}</h5>
                          <p className="text-xs text-on-surface-variant mt-1">{arch.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="bg-surface-container border border-primary-fixed/20 p-6 rounded-xl flex items-center justify-between hover:bg-primary-fixed/10 transition-all group active:scale-95">
                  <span className="font-bold text-text-primary uppercase text-xs tracking-widest">View GitHub</span>
                  <ArrowRight className="text-primary-fixed group-hover:translate-x-2 transition-transform w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
