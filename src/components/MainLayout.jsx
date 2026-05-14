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
import BackgroundWrapper from './Layout/BackgroundWrapper';

// Section wrapper using react-scroll Element for snap targeting
const SectionWrapper = ({ children, id, className = '' }) => (
  <Element name={id} className="snap-start">
    <motion.div
      id={id}
      className={`w-full min-h-screen flex flex-col justify-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  </Element>
);

const MainLayout = () => {
  return (
    <BackgroundWrapper>
      <div className="text-on-surface font-body-md">
        <TopNavBar />
        
        <main className="max-w-container-max mx-auto px-gutter">
          
          <SectionWrapper id="hero">
            <HeroSection />
          </SectionWrapper>

          <SectionWrapper id="about">
            <AboutSection />
          </SectionWrapper>
          
          <SectionWrapper id="tech">
            <ArchitectureCards />
          </SectionWrapper>

          {/* Commented out as requested:
          <SectionWrapper id="experience">
            <ExperienceSection />
          </SectionWrapper>
          */}
          
          <SectionWrapper id="projects">
            <ProjectGallery />
          </SectionWrapper>

          <SectionWrapper id="contact">
            <ContactSection />
          </SectionWrapper>
          
        </main>

        {/* Footer outside sections, at the bottom */}
        <Element name="footer-section" className="snap-start">
          <div id="footer-section">
            <Footer />
          </div>
        </Element>
      </div>
    </BackgroundWrapper>
  );
};

export default MainLayout;
