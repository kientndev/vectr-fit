'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type RevealDirection =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'converge-left'
  | 'converge-right'
  | 'none';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  tilt?: boolean;
  scale?: boolean;
  blur?: boolean;
  glowOnEnter?: boolean;
  className?: string;
  viewportAmount?: number | 'some' | 'all';
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 90,
  tilt = true,
  scale = true,
  blur = true,
  glowOnEnter = false,
  className = '',
  viewportAmount = 0.1,
  once = true,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`relative ${className}`} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  const getInitialPosition = () => {
    if (direction === 'none') {
      return { x: 0, y: 0, rotate: 0, scale: 1 };
    }

    const baseScale = scale ? 0.94 : 1;

    switch (direction) {
      case 'left':
      case 'converge-left':
        return {
          x: -distance,
          y: 15, // Slide + Float up simultaneously
          rotate: tilt ? -2.5 : 0,
          scale: baseScale,
        };
      case 'right':
      case 'converge-right':
        return {
          x: distance,
          y: 15,
          rotate: tilt ? 2.5 : 0,
          scale: baseScale,
        };
      case 'up':
        return {
          x: 0,
          y: distance,
          rotate: tilt ? 1 : 0,
          scale: baseScale,
        };
      case 'down':
        return {
          x: 0,
          y: -distance,
          rotate: tilt ? -1 : 0,
          scale: baseScale,
        };
      default:
        return { x: 0, y: distance, rotate: 0, scale: baseScale };
    }
  };

  const initial = {
    opacity: 0,
    filter: blur ? 'blur(8px)' : 'none',
    ...getInitialPosition(),
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      viewport={{
        once,
        amount: viewportAmount,
        margin: '0px 0px -40px 0px',
      }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 90,
        mass: 0.85,
        delay,
        duration: duration || 0.8,
      }}
      onAnimationComplete={() => setHasSettled(true)}
      suppressHydrationWarning
      className={`relative ${className} [will-change:transform,opacity,filter] [transform-style:preserve-3d] ${
        glowOnEnter && hasSettled ? 'juicy-settled-glow' : ''
      }`}
    >
      {/* Juicy Ambient Kinetic Glint Highlight on entry */}
      {glowOnEnter && (
        <span
          className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/25 to-emerald-500/20 blur-xl opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
      {children}
    </motion.div>
  );
};

/**
 * JuicyConvergeRow: Dual container where Left child slides from left and Right child slides from right,
 * converging directly into the center with kinetic spring physics!
 */
export const JuicyConvergeRow: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  delay?: number;
}> = ({
  left,
  right,
  className = '',
  leftClassName = '',
  rightClassName = '',
  delay = 0,
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${className}`}>
      <ScrollReveal
        direction="converge-left"
        distance={110}
        delay={delay}
        glowOnEnter
        className={`lg:col-span-6 ${leftClassName}`}
      >
        {left}
      </ScrollReveal>

      <ScrollReveal
        direction="converge-right"
        distance={110}
        delay={delay + 0.12}
        glowOnEnter
        className={`lg:col-span-6 ${rightClassName}`}
      >
        {right}
      </ScrollReveal>
    </div>
  );
};
