'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export interface NavSection {
  id: string;
  label: string;
  description?: string;
}

type ColorMode = 'dark' | 'light';

interface SideNavProps {
  sections: NavSection[];
  activeIndex: number;
  onNavigate?: (index: number) => void;
  colorMode?: ColorMode;
}

const FONTS = [
  { key: '1', name: 'Google Sans', family: "'Google Sans', sans-serif" },
  { key: '2', name: 'Space Grotesk', family: 'var(--font-space-grotesk)' },
  { key: '3', name: 'Outfit', family: 'var(--font-outfit)' },
  { key: '4', name: 'Urbanist', family: 'var(--font-urbanist)' },
  { key: '5', name: 'Plus Jakarta Sans', family: 'var(--font-plus-jakarta)' },
  { key: '6', name: 'Albert Sans', family: 'var(--font-albert-sans)' },
  { key: '7', name: 'Josefin Sans', family: 'var(--font-josefin-sans)' },
  { key: '8', name: 'Rubik', family: 'var(--font-rubik)' },
  { key: '9', name: 'DM Sans', family: 'var(--font-dm-sans)' },
  { key: '0', name: 'Sora', family: 'var(--font-sora)' },
];

export function SideNav({ sections, activeIndex, onNavigate, colorMode = 'dark' }: SideNavProps) {
  const [fontIndex, setFontIndex] = useState(2); // Outfit

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const fontKey = FONTS.findIndex(f => f.key === e.key);
      if (fontKey !== -1) {
        setFontIndex(fontKey);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentFont = FONTS[fontIndex];

  // Text colors based on color mode
  const textColor = colorMode === 'light' ? '#0f0f1a' : '#ffffff';

  return (
    <div className="fixed left-0 top-0 bottom-0 z-[100] w-screen h-screen flex flex-col pointer-events-none">
      {/* Navigation */}
      <nav className="flex-1 flex flex-col justify-center px-8">
        <ul className="flex flex-col gap-2 list-none m-0 p-0">
          {sections.map((section, index) => (
            <motion.li
              key={section.id}
              initial={false}
              animate={{
                opacity: activeIndex === index ? 1 : 0.3,
                scale: activeIndex === index ? 1.02 : 1,
              }}
              transition={{
                duration: 0.1,
                ease: 'linear',
              }}
            >
              <button
                onClick={() => onNavigate?.(index)}
                className="pointer-events-auto cursor-pointer text-left bg-transparent border-none p-0 m-0"
                aria-label={`Go to ${section.label}`}
              >
                <motion.span
                  className="uppercase whitespace-nowrap"
                  animate={{ color: textColor }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontSize: index === 0 ? 'clamp(5rem, 12vw, 10rem)' : 'clamp(4rem, 10vw, 8rem)',
                    lineHeight: 0.85,
                    letterSpacing: index === 0 ? '0.15em' : 'normal',
                    fontWeight: index === 0 ? 800 : 600,
                    fontFamily: index === 0 ? 'var(--font-geo)' : currentFont.family,
                  }}
                >
                  {section.label}
                </motion.span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

{/* Font picker hidden - press 1-9, 0 to change */}
    </div>
  );
}
