import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

function Magnetic({
  magneticDistance = 200,
  strength = 0.9,
  stiffness = 80,
  damping = 10,
  children,
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });
  const [isHovering, setIsHovering] = useState(false);

  const onMouseMove = useCallback(
    (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < magneticDistance) {
        const pull = Math.pow(1 - dist / magneticDistance, 0.5);
        x.set(dx * pull * strength);
        y.set(dy * pull * strength);
        setIsHovering(true);
      } else {
        x.set(0);
        y.set(0);
        setIsHovering(false);
      }
    },
    [x, y, magneticDistance, strength]
  );

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: 'inline-block' }}
    >
      {typeof children === 'function' ? children(isHovering) : children}
    </motion.div>
  );
}

export default Magnetic;
