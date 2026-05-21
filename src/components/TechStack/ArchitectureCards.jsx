import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Database, Workflow, GitBranch, Briefcase, Bot, X } from 'lucide-react';

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

const TechCard = ({ category, t, index, isMobileExpanded, onToggle, onClose, isMobile }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth scroll vertically to card when expanded on mobile (preventing horizontal shifts)
  useEffect(() => {
    if (isMobile && isMobileExpanded && cardRef.current) {
      const timer = setTimeout(() => {
        const container = document.getElementById('main-scroll-container');
        if (container && cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Center the card vertically if it fits, otherwise align to the top with a 20px padding
          const padding = 20;
          const space = containerRect.height - rect.height;
          const offset = space > 0 ? space / 2 : padding;
          
          const targetScrollTop = container.scrollTop + (rect.top - containerRect.top) - offset;
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }, 300); // allow layout sorting and DOM updates to stabilize
      return () => clearTimeout(timer);
    }
  }, [isMobileExpanded, isMobile]);

  const isExpanded = isMobile ? isMobileExpanded : isHovered;

  const handleHoverStart = () => {
    if (!isMobile) {
      setIsHovered(true);
    }
  };

  const handleHoverEnd = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      onToggle(category.id);
    }
  };

  const motionProps = isMobile ? {} : {
    layout: true,
    initial: { opacity: 0, rotateX: -12, y: 40, scale: 0.96 },
    whileInView: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { 
      default: { type: "tween", ease: "easeInOut", duration: 0.35, delay: index * 0.12 },
      layout: { type: "tween", ease: "easeInOut", duration: 0.3, delay: 0 }
    },
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd
  };

  return (
    <motion.div 
      ref={cardRef}
      layout={isMobile ? "position" : false}
      transition={isMobile ? { type: "tween", ease: "easeInOut", duration: 0.25 } : undefined}
      className={`relative w-full ${isMobile ? '' : 'transition-all duration-300'} ${isExpanded ? 'z-50 col-span-2 md:col-span-1 h-auto' : 'z-10 col-span-1 h-32 md:h-auto'}`}
    >
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
        {...motionProps}
        onClick={handleClick}
        className={`md:absolute md:top-0 md:left-0 w-full glass-panel depth-card-hover p-4 md:p-6 cursor-pointer group flex flex-col ${isExpanded ? 'justify-start' : 'justify-center md:justify-start'} rounded-xl ${isExpanded ? 'h-auto' : 'h-full md:h-auto'} ${isMobile ? 'no-transition' : ''}`}
      >
        {/* Mobile close button in top right corner */}
        {isExpanded && isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(category.id);
            }}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border border-white/20 bg-surface-container-highest/80 text-text-primary backdrop-blur-md z-30 active:scale-95 transition-transform"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {isMobile && !isExpanded ? (
          <>
            <div className="absolute top-4 left-4 w-8 h-8 rounded-full border border-primary-light/50 flex items-center justify-center bg-white/5 shrink-0 z-20">
              {category.icon}
            </div>
            <div className="flex items-end justify-center text-center w-full h-full min-h-[96px] z-10 pb-4">
              <h3 className="font-code-sm text-xs text-text-primary uppercase tracking-[0.1em] break-words px-2">
                {t(category.titleKey)}
              </h3>
            </div>
          </>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4">
            <div className="w-8 h-8 rounded-full border border-primary-light/50 flex items-center justify-center bg-white/5 shrink-0">
              {category.icon}
            </div>
            <h3 className="font-code-sm text-xs md:text-sm text-text-primary uppercase tracking-[0.1em] md:tracking-[0.2em] break-words pr-8 md:pr-0">
              {t(category.titleKey)}
            </h3>
          </div>
        )}

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="font-body-md text-on-surface-variant text-sm">
                {t(category.descKey)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout="position"
          className={`flex-wrap gap-2 md:gap-3 mt-auto ${isExpanded ? 'flex' : 'hidden md:flex'}`}
        >
          {category.tags.map((tag) => (
            <div
              key={tag}
              className="border border-primary-fixed/30 bg-surface/40 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-[4px]"
            >
              <span className="font-code-sm text-[10px] md:text-xs text-on-surface uppercase opacity-90">
                {tag}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function ArchitectureCards() {
  const { t } = useLanguage();
  const [openedCards, setOpenedCards] = useState([]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setOpenedCards([]);
    }
  }, [isMobile]);

  const toggleCard = (id) => {
    setOpenedCards((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const closeCard = (id) => {
    setOpenedCards((prev) => prev.filter((item) => item !== id));
  };

  const displayList = useMemo(() => {
    if (!isMobile) return techCategoriesData;

    const openList = openedCards
      .map((id) => techCategoriesData.find((c) => c.id === id))
      .filter(Boolean);
    const collapsedList = techCategoriesData.filter((c) => !openedCards.includes(c.id));

    return [...openList, ...collapsedList];
  }, [openedCards, isMobile]);

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

      <div 
        className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-16 lg:gap-20 items-start"
        style={{ perspective: 1200 }}
      >
        {displayList.map((category, index) => {
          const originalIndex = techCategoriesData.findIndex((c) => c.id === category.id);
          return (
            <TechCard 
              key={category.id} 
              category={category} 
              t={t} 
              index={originalIndex} 
              isMobileExpanded={openedCards.includes(category.id)}
              onToggle={toggleCard}
              onClose={closeCard}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </section>
  );
}
