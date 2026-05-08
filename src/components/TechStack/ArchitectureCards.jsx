import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Database, Workflow, GitBranch, Briefcase } from 'lucide-react';

const techCategories = [
  {
    id: "data-engineering",
    title: "Data Engineering",
    icon: <Database className="w-4 h-4 text-primary-fixed" />,
    items: [
      { name: "SQL", details: "DataWarehouse, Views, Functions" },
      { name: "Python", details: "Pandas, PySpark, APIs" },
      { name: "Databricks", details: "Medallion Architecture" },
      { name: "Data Modeling", details: "Star Schema, Snowflake" },
      { name: "Lakehouse", details: "Delta Lake, Parquet" }
    ]
  },
  {
    id: "analytics",
    title: "Analytics & BI",
    icon: <Workflow className="w-4 h-4 text-primary-fixed" />,
    items: [
      { name: "Power BI", details: "DAX, Dashboards" },
      { name: "Metabase", details: "SQL Queries, Reports" }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Version Control",
    icon: <GitBranch className="w-4 h-4 text-primary-fixed" />,
    items: [
      { name: "Git", details: "Version Control" },
      { name: "Bitbucket", details: "CI/CD Pipelines" },
      { name: "Docker", details: "Containerization" }
    ]
  },
  {
    id: "management",
    title: "Project Management",
    icon: <Briefcase className="w-4 h-4 text-primary-fixed" />,
    items: [
      { name: "Asana", details: "Task Tracking" },
      { name: "Jira", details: "Agile, Scrums" },
      { name: "Scrum", details: "Methodology" }
    ]
  }
];

import { useLanguage } from '../../contexts/LanguageContext';

export default function ArchitectureCards() {
  const [selectedTech, setSelectedTech] = useState(null);
  const { t } = useLanguage();

  return (
    <section className="mb-stack-lg" id="tech">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 relative">
        <div className="section-header">
          <div className="corner-bracket-tl"></div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary uppercase tracking-tight">
            {t('tech.title')}
          </h2>
        </div>
        <p className="text-on-surface-variant max-w-md font-label-md text-label-md uppercase tracking-[0.2em]">
          {t('tech.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techCategories.map((category) => (
          <div key={category.id} className="glass-panel p-6 border border-primary-fixed/20 rounded-xl relative hover:border-primary-fixed/50 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full border border-primary-fixed/30 flex items-center justify-center bg-primary-fixed/5">
                {category.icon}
              </div>
              <h3 className="font-code-sm text-sm text-primary-fixed uppercase tracking-[0.2em]">
                {category.title}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {category.items.map((tech) => (
                <button
                  key={tech.name}
                  onClick={() => setSelectedTech(tech)}
                  className="glass-panel border border-primary-fixed/30 bg-surface/40 backdrop-blur-sm px-4 py-2 rounded-[4px] hover:border-primary-fixed transition-all hover:bg-primary-fixed/10 active:scale-95 cursor-pointer text-left group"
                >
                  <span className="font-code-sm text-xs text-on-surface uppercase group-hover:text-primary-fixed transition-colors">
                    {tech.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up for Tech details */}
      <AnimatePresence>
        {selectedTech && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTech(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel border border-primary-fixed p-8 rounded-xl max-w-md w-full relative caution-stripes-border"
            >
              <button 
                onClick={() => setSelectedTech(null)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary-fixed"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-primary-fixed rounded-full animate-pulse"></div>
                <h3 className="font-headline-lg text-2xl text-primary-fixed uppercase tracking-widest">{selectedTech.name}</h3>
              </div>
              <p className="font-body-md text-on-surface mb-6">
                <span className="font-code-sm text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">{t('tech.popup_title')}</span>
                {selectedTech.details}
              </p>
              
              <div className="border-t border-primary-fixed/20 pt-4 flex justify-end">
                <a href="#projects" onClick={() => setSelectedTech(null)} className="font-code-sm text-xs text-primary-fixed hover:text-white uppercase tracking-widest flex items-center gap-2 group">
                  {t('tech.popup_cta')}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
