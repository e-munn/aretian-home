'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SectionStepperProps {
  totalSections: number;
  activeIndex: number;
  onNavigate: (index: number) => void;
  colorMode: 'dark' | 'light';
}

export function SectionStepper({ totalSections, activeIndex, onNavigate, colorMode }: SectionStepperProps) {
  const canGoUp = activeIndex > 0;
  const canGoDown = activeIndex < totalSections - 1;

  const activeColor = colorMode === 'light' ? 'rgba(15, 15, 26, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const disabledColor = colorMode === 'light' ? 'rgba(15, 15, 26, 0.2)' : 'rgba(255, 255, 255, 0.2)';

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center">
      <motion.button
        onClick={() => canGoUp && onNavigate(activeIndex - 1)}
        disabled={!canGoUp}
        className="p-1"
        style={{
          color: canGoUp ? activeColor : disabledColor,
          cursor: canGoUp ? 'pointer' : 'default',
        }}
        whileHover={canGoUp ? { scale: 1.15, y: -2 } : {}}
        whileTap={canGoUp ? { scale: 0.9 } : {}}
        aria-label="Previous section"
      >
        <motion.div
          animate={canGoUp ? { y: [0, -2, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronUp size={28} strokeWidth={1.5} />
        </motion.div>
      </motion.button>

      <motion.button
        onClick={() => canGoDown && onNavigate(activeIndex + 1)}
        disabled={!canGoDown}
        className="p-1"
        style={{
          color: canGoDown ? activeColor : disabledColor,
          cursor: canGoDown ? 'pointer' : 'default',
        }}
        whileHover={canGoDown ? { scale: 1.15, y: 2 } : {}}
        whileTap={canGoDown ? { scale: 0.9 } : {}}
        aria-label="Next section"
      >
        <motion.div
          animate={canGoDown ? { y: [0, 2, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={28} strokeWidth={1.5} />
        </motion.div>
      </motion.button>
    </div>
  );
}
