'use client';

import { motion } from 'framer-motion';
import { GradualBlur } from '@/components/ui/GradualBlur';

interface SectionBreakProps {
  height?: number;
  fromColor?: string;
  toColor?: string;
  showDots?: boolean;
}

export function SectionBreak({
  height = 80,
  fromColor = '#0f0f1a',
  toColor = '#0f0f1a',
  showDots = true,
}: SectionBreakProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height,
        background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
      }}
    >
      {/* Top blur fading from previous section */}
      <GradualBlur
        position="top"
        height={`${height / 2}px`}
        strength={3}
        divCount={6}
        exponential
      />

      {/* Bottom blur fading into next section */}
      <GradualBlur
        position="bottom"
        height={`${height / 2}px`}
        strength={3}
        divCount={6}
        exponential
      />

      {/* Animated center line/dots */}
      {showDots && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/20"
                initial={{ opacity: 0.2, scale: 0.8 }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  );
}
