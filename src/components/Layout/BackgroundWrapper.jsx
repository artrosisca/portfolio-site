import React from 'react';
import InteractiveDots from '../ui/InteractiveDots';

const BackgroundWrapper = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <InteractiveDots 
        backgroundColor="#0C0D05" 
        dotColor="#fae500" 
        gridSpacing={32}
      />
      {/* Content */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BackgroundWrapper;
