import React from 'react';
import { motion } from 'framer-motion';
import { Element } from 'react-scroll';
import TopNavBar from './Layout/TopNavBar';
import Footer from './Layout/Footer';
import HeroSection from './Sections/HeroSection';
import AboutSection from './Sections/AboutSection';
import ArchitectureCards from './TechStack/ArchitectureCards';
import ExperienceSection from './Sections/ExperienceSection';
import ProjectGallery from './Projects/ProjectGallery';
import ContactSection from './Sections/ContactSection';
import InteractiveDots from './ui/InteractiveDots';

// Section color constants
const DARK_BG = '#000000';
const GRAY_BG = '#7a6f05';

// Full-bleed section wrapper with alternating backgrounds
const SectionWrapper = ({ children, id, theme = 'dark', className = '', customFooter, pyClass = 'py-20 md:py-32' }) => (
  <Element name={id} className="snap-start">
    <div
      id={id}
      data-section-theme={theme}
      className={`w-full min-h-screen flex flex-col justify-center relative ${className}`}
    >
      {/* Background layer behind the dots (z-0) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: theme === 'gray' ? GRAY_BG : DARK_BG }}
      />
      {/* Content layer in front of the dots (z-20) */}
      <div className={`relative z-20 max-w-container-max mx-auto px-4 md:px-gutter w-full ${pyClass}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full h-full flex flex-col justify-center"
        >
          {children}
        </motion.div>
      </div>
      {/* Custom footer glued to the absolute bottom of the min-h-screen wrapper */}
      {customFooter && (
        <div className="absolute bottom-0 left-0 right-0 z-30 w-full pointer-events-auto">
          {customFooter}
        </div>
      )}
    </div>
  </Element>
);

const MainLayout = () => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Content layer wrapper - no stacking context to let descendants stack globally relative to dots */}
      <div className="relative text-on-surface font-body-md">
        <TopNavBar />

        <main>

          <SectionWrapper id="hero" theme="dark" pyClass="pt-12 pb-20 md:py-0">
            <HeroSection />
          </SectionWrapper>

          <SectionWrapper id="about" theme="gray">
            <AboutSection />
          </SectionWrapper>

          <SectionWrapper id="tech" theme="dark">
            <ArchitectureCards />
          </SectionWrapper>

          {/* Commented out as requested:
          <SectionWrapper id="experience" theme="gray">
            <ExperienceSection />
          </SectionWrapper>
          */}

          <SectionWrapper id="projects" theme="gray">
            <ProjectGallery />
          </SectionWrapper>

          <SectionWrapper id="contact" theme="dark" customFooter={<Footer />}>
            <div className="pb-16 md:pb-24">
              <ContactSection />
            </div>
          </SectionWrapper>

        </main>
      </div>

      {/* Interactive dots overlay — above backgrounds (z-0), but behind contents (z-20) */}
      <InteractiveDots gridSpacing={35} />
    </div>
  );
};

export default MainLayout;
