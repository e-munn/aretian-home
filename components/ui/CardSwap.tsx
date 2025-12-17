'use client';

import React, { useState, useEffect, Children, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full h-full rounded-2xl bg-[#0a1628] border border-white/10 p-8 ${className}`}>
      {children}
    </div>
  );
}

interface CardSwapProps {
  children: ReactNode;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
}

export default function CardSwap({
  children,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
}: CardSwapProps) {
  const cards = Children.toArray(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, delay);

    return () => clearInterval(interval);
  }, [cards.length, delay, isPaused]);

  const getCardStyle = (index: number) => {
    const position = (index - activeIndex + cards.length) % cards.length;
    
    // Stack cards with offset
    const xOffset = position * cardDistance;
    const yOffset = position * verticalDistance;
    const scale = 1 - position * 0.05;
    const zIndex = cards.length - position;
    const opacity = position === 0 ? 1 : 0.7 - position * 0.2;

    return {
      x: xOffset,
      y: yOffset,
      scale,
      zIndex,
      opacity: Math.max(0.3, opacity),
    };
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div className="relative" style={{ width: '500px', height: '350px' }}>
        <AnimatePresence>
          {cards.map((card, index) => {
            const style = getCardStyle(index);
            return (
              <motion.div
                key={index}
                className="absolute inset-0 cursor-pointer"
                initial={false}
                animate={{
                  x: style.x,
                  y: style.y,
                  scale: style.scale,
                  opacity: style.opacity,
                  zIndex: style.zIndex,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={() => setActiveIndex(index)}
                style={{ zIndex: style.zIndex }}
              >
                {card}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
