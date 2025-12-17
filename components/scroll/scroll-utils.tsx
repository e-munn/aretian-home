'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, MotionValue } from 'framer-motion';

// ===========================================
// SCROLL TRIGGER HOOK
// Triggers animations when element enters viewport
// ===========================================

interface ScrollTriggerOptions {
  /** Threshold for triggering (0-1) */
  threshold?: number;
  /** Only trigger once */
  once?: boolean;
  /** Root margin */
  margin?: string;
}

export function useScrollTrigger(options: ScrollTriggerOptions = {}) {
  const { threshold = 0.1, once = true, margin = '0px' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin,
    amount: threshold,
  });

  return { ref, isInView };
}

// ===========================================
// PARALLAX HOOK
// Creates parallax effect based on scroll position
// ===========================================

interface ParallaxOptions {
  /** Speed multiplier (-1 to 1, negative = opposite direction) */
  speed?: number;
  /** Use spring physics */
  spring?: boolean;
  /** Spring config */
  springConfig?: { stiffness?: number; damping?: number };
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, spring = true, springConfig = { stiffness: 100, damping: 30 } } = options;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Transform scroll progress to y offset
  const rawY = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  // Optionally apply spring physics
  const y = spring ? useSpring(rawY, springConfig) : rawY;

  return { ref, y, progress: scrollYProgress };
}

// ===========================================
// SCROLL REVEAL COMPONENT
// Reveals content with animation when scrolled into view
// ===========================================

type RevealAnimation = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'blur';

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation type */
  animation?: RevealAnimation;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Only animate once */
  once?: boolean;
  /** Custom initial state */
  initial?: object;
  /** Custom animate state */
  animate?: object;
  /** Threshold for triggering */
  threshold?: number;
  /** Additional className */
  className?: string;
}

const revealVariants: Record<RevealAnimation, { initial: object; animate: object }> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
  },
  slideRight: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
  },
};

export function ScrollReveal({
  children,
  animation = 'slideUp',
  delay = 0,
  duration = 0.6,
  once = true,
  initial,
  animate,
  threshold = 0.1,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const variant = revealVariants[animation];
  const initialState = initial || variant.initial;
  const animateState = animate || variant.animate;

  return (
    <motion.div
      ref={ref}
      initial={initialState}
      animate={isInView ? animateState : initialState}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===========================================
// STAGGER CHILDREN REVEAL
// Reveals multiple children with staggered timing
// ===========================================

interface StaggerRevealProps {
  children: ReactNode;
  /** Stagger delay between children (seconds) */
  stagger?: number;
  /** Base delay before first child (seconds) */
  delay?: number;
  /** Animation type for children */
  animation?: RevealAnimation;
  /** Only animate once */
  once?: boolean;
  /** Container className */
  className?: string;
}

export function StaggerReveal({
  children,
  stagger = 0.1,
  delay = 0,
  animation = 'slideUp',
  once = true,
  className = '',
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  const variant = revealVariants[animation];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: variant.initial,
    visible: {
      ...variant.animate,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
}

// ===========================================
// TEXT REVEAL (Character by character)
// ===========================================

interface TextRevealProps {
  text: string;
  /** Delay between characters */
  stagger?: number;
  /** Base delay */
  delay?: number;
  /** Only animate once */
  once?: boolean;
  /** ClassName for container */
  className?: string;
  /** ClassName for each character span */
  charClassName?: string;
}

export function TextReveal({
  text,
  stagger = 0.03,
  delay = 0,
  once = true,
  className = '',
  charClassName = '',
}: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className={`inline-block ${charClassName}`}
          variants={charVariants}
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ===========================================
// SCROLL PROGRESS FOR ELEMENT
// ===========================================

interface ElementScrollProgressProps {
  children: (progress: MotionValue<number>) => ReactNode;
  /** Offset configuration */
  offset?: ['start' | 'end' | 'center', 'start' | 'end' | 'center'][];
}

export function ElementScrollProgress({
  children,
  offset = [['start', 'end'], ['end', 'start']],
}: ElementScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset.map((o) => o.join(' ')) as any,
  });

  return <div ref={ref}>{children(scrollYProgress)}</div>;
}
