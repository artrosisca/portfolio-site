import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Database, Workflow, GitBranch, Briefcase, Bot } from 'lucide-react';

const techCategoriesData = [
  {
    id: "data-engineering",
    titleKey: "tech.cat_data_engineering",
    descKey: "tech.desc_data_engineering",
    icon: <Database className="w-4 h-4 text-primary-dark group-hover:text-primary-light group-hover:drop-shadow-[0_0_8px_rgba(250,229,0,0.6)] transition-all duration-300" />,
    tags: ["SQL", "Python", "Databricks", "Data Modeling", "Lakehouse"]
  },
  {
    id: "analytics",
    titleKey: "tech.cat_analytics",
    descKey: "tech.desc_analytics",
    icon: <Workflow className="w-4 h-4 text-primary-dark group-hover:text-primary-light group-hover:drop-shadow-[0_0_8px_rgba(250,229,0,0.6)] transition-all duration-300" />,
    tags: ["Power BI", "Metabase", "Scikit-learn", "XGBoost"]
  },
  {
    id: "web-dev",
    titleKey: "tech.cat_web_dev",
    descKey: "tech.desc_web_dev",
    icon: <Code2 className="w-4 h-4 text-primary-dark group-hover:text-primary-light group-hover:drop-shadow-[0_0_8px_rgba(250,229,0,0.6)] transition-all duration-300" />,
    tags: ["Angular", "React", "TypeScript", "Java", "PHP"]
  },
  {
    id: "devops",
    titleKey: "tech.cat_devops",
    descKey: "tech.desc_devops",
    icon: <GitBranch className="w-4 h-4 text-primary-dark group-hover:text-primary-light group-hover:drop-shadow-[0_0_8px_rgba(250,229,0,0.6)] transition-all duration-300" />,
    tags: ["Git", "Bitbucket", "Docker", "Linux"]
  },
  {
    id: "ai-agents",
    titleKey: "tech.cat_ai",
    descKey: "tech.desc_ai",
    icon: <Bot className="w-4 h-4 text-primary-dark group-hover:text-primary-light group-hover:drop-shadow-[0_0_8px_rgba(250,229,0,0.6)] transition-all duration-300" />,
    tags: ["Generative AI", "Prompt Engineering", "MCPs", "Token Optimization"]
  },
  {
    id: "management",
    titleKey: "tech.cat_management",
    descKey: "tech.desc_management",
    icon: <Briefcase className="w-4 h-4 text-primary-dark group-hover:text-primary-light group-hover:drop-shadow-[0_0_8px_rgba(250,229,0,0.6)] transition-all duration-300" />,
    tags: ["Asana", "Jira", "Scrum"]
  }
];

import { useLanguage } from '../../contexts/LanguageContext';

const TechCard = ({ category, t }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative w-full ${isHovered ? 'z-50' : 'z-10'}`}>
      {/* Invisible placeholder to define the static grid cell size (collapsed state) — desktop only */}
      <div className="hidden md:flex p-6 border border-transparent rounded-xl flex-col justify-start invisible opacity-0 pointer-events-none">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-8 rounded-full border border-transparent"></div>
          <h3 className="font-code-sm text-sm uppercase tracking-[0.2em]">
            {t(category.titleKey)}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3 mt-auto">
          {category.tags.map((tag) => (
            <div key={tag} className="border border-transparent px-4 py-2 rounded-[4px]">
              <span className="font-code-sm text-xs uppercase opacity-0">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actual visible card — relative on mobile (pushes siblings), absolute on desktop (floats over) */}
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsHovered(!isHovered)}
        className="md:absolute md:top-0 md:left-0 w-full h-auto glass-panel depth-card-hover p-6 rounded-xl cursor-pointer group flex flex-col justify-start"
      >
        <motion.div layout className="flex items-center gap-4 mb-4">
          <div className="w-8 h-8 rounded-full border border-primary-light/50 flex items-center justify-center bg-white/5">
            {category.icon}
          </div>
          <h3 className="font-code-sm text-sm text-text-primary uppercase tracking-[0.2em]">
            {t(category.titleKey)}
          </h3>
        </motion.div>

        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="font-body-md text-on-surface-variant text-sm">
                {t(category.descKey)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="flex flex-wrap gap-3 mt-auto">
          {category.tags.map((tag) => (
            <div
              key={tag}
              className="border border-primary-fixed/30 bg-surface/40 backdrop-blur-sm px-4 py-2 rounded-[4px]"
            >
              <span className="font-code-sm text-xs text-on-surface uppercase opacity-90">
                {tag}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function ArchitectureCards() {
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

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-20 items-start">
        {techCategoriesData.map((category) => (
          <TechCard key={category.id} category={category} t={t} />
        ))}
      </motion.div>
    </section>
  );
}
