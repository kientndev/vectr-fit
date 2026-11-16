'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type RevealDirection = 'left' | 'right' | 'up' | 'down' | 'none';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  viewportAmount?: number | 'some' | 'all';
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 50,
  className = '',
  viewportAmount = 0.12,
  once = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (shouldReduceMotion || direction === 'none') {
      return { x: 0, y: 0 };
    }
    switch (direction) {
      case 'left':
        return { x: -distance, y: 0 };
      case 'right':
        return { x: distance, y: 0 };
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      default:
        return { x: 0, y: distance };
    }
  };

  const initial = {
    opacity: 0,
    ...getInitialPosition(),
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once,
        amount: viewportAmount,
        margin: '0px 0px -30px 0px',
      }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier spring feel
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};
