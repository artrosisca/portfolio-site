'use client';

import React, { useEffect, useRef, useCallback } from 'react';

/**
 * InteractiveDots — Section-Aware Difference Masking
 * 
 * Draws dots on a transparent fixed canvas. Uses canvas clipping to draw
 * different dot colors per section theme:
 *   - Dark sections (#050505): light gray dots, yellow near cursor
 *   - Gray sections (#2a2a2a): black dots, stays black near cursor
 * 
 * Dots at section boundaries are pixel-perfectly split by the clip regions.
 */
const InteractiveDots = ({
  gridSpacing = 30,
  animationSpeed = 0.005,
  removeWaveLine = true
}) => {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const animationFrameId = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false });
  const ripples = useRef([]);
  const dotsRef = useRef([]);
  const dprRef = useRef(1);

  // --- Influence helpers (unchanged logic) ---

  const getMouseInfluence = (x, y) => {
    const dx = x - mouseRef.current.x;
    const dy = y - mouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 150;
    return Math.max(0, 1 - distance / maxDistance);
  };

  const getRippleInfluence = (x, y) => {
    let totalInfluence = 0;
    const currentTime = Date.now();
    ripples.current.forEach((ripple) => {
      const age = currentTime - ripple.time;
      const maxAge = ripple.duration || 3000;
      if (age < maxAge) {
        const dx = x - ripple.x;
        const dy = y - ripple.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radiusMultiplier = ripple.radius || 400;
        const rippleRadius = (age / maxAge) * radiusMultiplier;
        const rippleWidth = ripple.width || 70;

        if (Math.abs(distance - rippleRadius) < rippleWidth) {
          const rippleStrength = (1 - age / maxAge) * ripple.intensity;
          const proximityToRipple =
            1 - Math.abs(distance - rippleRadius) / rippleWidth;
          totalInfluence += rippleStrength * proximityToRipple;
        }
      }
    });
    return Math.min(totalInfluence, 4);
  };

  // --- Dot initialization ---

  const initializeDots = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const dots = [];

    for (let x = gridSpacing / 2; x < canvasWidth; x += gridSpacing) {
      for (let y = gridSpacing / 2; y < canvasHeight; y += gridSpacing) {
        dots.push({
          x,
          y,
          originalX: x,
          originalY: y,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    dotsRef.current = dots;
  }, [gridSpacing]);

  // --- Canvas resize ---

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    initializeDots();
  }, [initializeDots]);

  // --- Mouse handlers ---

  const handleMouseMove = useCallback((e) => {
    if (window.innerWidth <= 768) return;
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (window.innerWidth <= 768) return;
    mouseRef.current.isDown = true;

    ripples.current.push({
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      intensity: 2,
    });

    const now = Date.now();
    ripples.current = ripples.current.filter(
      (ripple) => now - ripple.time < (ripple.duration || 3000)
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false;
  }, []);

  // --- Draw dots within clipped regions ---

  const drawDotsInRegions = (ctx, regions, colorConfig, canvasWidth, canvasHeight, isGraySection = false) => {
    if (regions.length === 0) return;

    const { baseR, baseG, baseB, highlightR, highlightG, highlightB } = colorConfig;
    const time = timeRef.current;

    ctx.save();

    // Create clip path from all regions
    ctx.beginPath();
    regions.forEach((r) => {
      // Clamp to canvas bounds
      const top = Math.max(0, r.top);
      const bottom = Math.min(canvasHeight, r.bottom);
      const left = 0;
      const right = canvasWidth;
      if (bottom > top) {
        ctx.rect(left, top, right - left, bottom - top);
      }
    });
    ctx.clip();

    // Draw all dots within clip
    dotsRef.current.forEach((dot) => {
      const mouseInfluence = getMouseInfluence(dot.originalX, dot.originalY);
      const rippleInfluence = getRippleInfluence(dot.originalX, dot.originalY);
      const totalInfluence = mouseInfluence + rippleInfluence;

      // Mask alpha for cursor proximity color shift
      const dx = dot.originalX - mouseRef.current.x;
      const dy = dot.originalY - mouseRef.current.y;
      const distFromMouse = Math.sqrt(dx * dx + dy * dy);
      const maxMaskRadius = 300;

      let maskAlpha = 1 - distFromMouse / maxMaskRadius;
      maskAlpha = Math.max(0, Math.min(1, maskAlpha));

      const baseDotSize = 2.5;
      const dotSize =
        baseDotSize +
        totalInfluence * 2.5 +
        Math.sin(time + dot.phase) * 0.5;

      let opacity = Math.max(
        0.30,
        0.30 +
        maskAlpha * 0.4 +
        Math.abs(Math.sin(time * 0.8 + dot.phase)) * 0.05
      );

      if (isGraySection) {
        // Significantly higher base opacity and visual strength for black dots on gray background
        opacity = Math.max(
          0.38,
          0.38 + Math.abs(Math.sin(time * 0.5 + dot.phase)) * 0.1
        );
      }

      // Interpolate from base color to highlight color based on cursor proximity
      const r = Math.round(baseR + (highlightR - baseR) * maskAlpha);
      const g = Math.round(baseG + (highlightG - baseG) * maskAlpha);
      const b = Math.round(baseB + (highlightB - baseB) * maskAlpha);

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.fill();
    });

    ctx.restore();
  };

  // --- Animation loop ---

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += animationSpeed;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Query section boundaries from DOM
    const darkRects = [];
    const grayRects = [];

    document.querySelectorAll('[data-section-theme]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      const theme = el.dataset.sectionTheme;
      const entry = { top: rect.top, bottom: rect.bottom };

      if (theme === 'dark') {
        darkRects.push(entry);
      } else if (theme === 'gray') {
        grayRects.push(entry);
      }
    });

    // Pass 1: Light dots on dark sections FIRST SECTION
    drawDotsInRegions(ctx, darkRects, {
      baseR: 78, baseG: 71, baseB: 3,       // #4e4703 (lighter base color)
      highlightR: 122, highlightG: 111, highlightB: 5,  // #7a6f05 (glows to primary mustard yellow on hover)
    }, canvasWidth, canvasHeight, false);

    // Pass 2: Dark dots on gray sections SECOND SECTION
    drawDotsInRegions(ctx, grayRects, {
      baseR: 48, baseG: 44, baseB: 2,           // #302c02 (darker base color)
      highlightR: 38, highlightG: 36, highlightB: 2,   // #262402 (darker hover highlight)
    }, canvasWidth, canvasHeight, true);

    // Draw ripple rings (optional visual)
    if (!removeWaveLine) {
      const currentTime = Date.now();
      ripples.current.forEach((ripple) => {
        const age = currentTime - ripple.time;
        const maxAge = 3000;
        if (age < maxAge) {
          const progress = age / maxAge;
          const radius = progress * 300;
          const alpha = (1 - progress) * 0.3 * ripple.intensity;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.arc(ripple.x, ripple.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    }

    // Clean up old ripples
    const now = Date.now();
    ripples.current = ripples.current.filter(
      (r) => now - r.time < (r.duration || 3000)
    );

    animationFrameId.current = requestAnimationFrame(animate);
  }, [animationSpeed, removeWaveLine]);

  // --- Lifecycle ---

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    const handleResize = () => resizeCanvas();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Listen for ripples triggered by other components
    const handleExternalRipple = (e) => {
      const { x, y, intensity = 2, duration, radius, width } = e.detail || {};
      if (x !== undefined && y !== undefined) {
        ripples.current.push({
          x,
          y,
          time: Date.now(),
          intensity,
          duration,
          radius,
          width,
        });
      }
    };
    window.addEventListener('portfolio-ripple', handleExternalRipple);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('portfolio-ripple', handleExternalRipple);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      timeRef.current = 0;
      ripples.current = [];
      dotsRef.current = [];
    };
  }, [animate, resizeCanvas, handleMouseMove, handleMouseDown, handleMouseUp]);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{
        zIndex: 10,
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default InteractiveDots;
