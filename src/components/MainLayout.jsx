import React from 'react';
import { motion } from 'framer-motion';
import TopNavBar from './Layout/TopNavBar';
import Footer from './Layout/Footer';
import HeroSection from './Sections/HeroSection';
import AboutSection from './Sections/AboutSection';
import ArchitectureCards from './TechStack/ArchitectureCards';
import ExperienceSection from './Sections/ExperienceSection';
import ProjectGallery from './Projects/ProjectGallery';
import ContactSection from './Sections/ContactSection';
import BackgroundWrapper from './Layout/BackgroundWrapper';

// Section wrapper for scroll snapping and entrance animations
const SectionWrapper = ({ children, id, className = '' }) => (
  <motion.div
    id={id}
    className={`w-full snap-start scroll-mt-24 ${className}`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const MainLayout = () => {
  return (
    <BackgroundWrapper>
      <div className="text-on-surface font-body-md overflow-x-hidden min-h-screen">
        <TopNavBar />
        
        {/* snap-y mandatory requires the container to have a height and overflow. 
            However, enabling overflow-y here might break the window scroll. 
            For full-page snapping, it's better to use native html/body snapping or just smooth scroll entrances. 
            We will use CSS scroll-behavior: smooth on the html tag via Tailwind if needed, 
            and keep snap on for section wrappers. */}
        <main className="max-w-container-max mx-auto px-gutter pt-32 snap-y snap-mandatory h-screen overflow-y-auto no-scrollbar">
          
          <SectionWrapper id="hero" className="snap-center">
            <HeroSection />
          </SectionWrapper>

          <SectionWrapper id="about">
            <AboutSection />
          </SectionWrapper>
          
          <SectionWrapper id="tech">
            <ArchitectureCards />
          </SectionWrapper>

          <SectionWrapper id="experience">
            <ExperienceSection />
          </SectionWrapper>
          
          <SectionWrapper id="projects">
            <ProjectGallery />
          </SectionWrapper>

          <SectionWrapper id="contact">
            <ContactSection />
            <Footer />
          </SectionWrapper>
          
        </main>
      </div>
    </BackgroundWrapper>
  );
};

export default MainLayout;

