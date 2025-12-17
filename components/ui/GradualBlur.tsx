'use client';

import { useMemo } from 'react';

interface GradualBlurProps {
  position?: 'top' | 'bottom';
  height?: string;
  strength?: number;
  divCount?: number;
  curve?: 'linear' | 'bezier' | 'ease';
  exponential?: boolean;
  opacity?: number;
  className?: string;
}

export function GradualBlur({
  position = 'bottom',
  height = '80px',
  strength = 2,
  divCount = 5,
  curve = 'bezier',
  exponential = true,
  opacity = 1,
  className = '',
}: GradualBlurProps) {
  // Generate blur layers with progressive blur amounts
  const layers = useMemo(() => {
    return Array.from({ length: divCount }, (_, i) => {
      const progress = i / (divCount - 1);

      // Calculate blur amount based on curve type
      let blurProgress: number;
      if (exponential) {
        blurProgress = Math.pow(progress, 2);
      } else if (curve === 'bezier') {
        // Cubic bezier-like curve
        blurProgress = progress * progress * (3 - 2 * progress);
      } else if (curve === 'ease') {
        // Ease-in-out
        blurProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      } else {
        blurProgress = progress;
      }

      const blur = blurProgress * strength;

      // Layer height as percentage of total
      const layerHeight = 100 / divCount;
      const layerTop = i * layerHeight;

      return {
        blur,
        top: position === 'top' ? `${layerTop}%` : undefined,
        bottom: position === 'bottom' ? `${100 - layerTop - layerHeight}%` : undefined,
        height: `${layerHeight + 1}%`, // Slight overlap to prevent gaps
        opacity: 0.1 + (progress * 0.9), // Fade in the blur
      };
    });
  }, [divCount, strength, curve, exponential, position]);

  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${className}`}
      style={{
        [position]: 0,
        height,
        opacity,
      }}
    >
      {layers.map((layer, index) => (
        <div
          key={index}
          className="absolute left-0 right-0"
          style={{
            top: layer.top,
            bottom: layer.bottom,
            height: layer.height,
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            maskImage: position === 'bottom'
              ? 'linear-gradient(to bottom, transparent, black)'
              : 'linear-gradient(to top, transparent, black)',
            WebkitMaskImage: position === 'bottom'
              ? 'linear-gradient(to bottom, transparent, black)'
              : 'linear-gradient(to top, transparent, black)',
          }}
        />
      ))}
    </div>
  );
}
