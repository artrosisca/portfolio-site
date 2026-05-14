import React, { useEffect, useRef } from 'react';

const BackgroundWrapper = ({ children }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (wrapperRef.current) {
        // For fixed background, we just need viewport coordinates
        wrapperRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        wrapperRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative min-h-screen w-full bg-background"
    >
      {/* Static Base Dot Grid layer */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(250, 229, 0, 0.2) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Interactive Hover Dot Grid layer (lights up dots around the cursor) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(250, 229, 0, 0.29) 1.5px, transparent 0)',
          backgroundSize: '32px 32px',
          WebkitMaskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
          maskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;
