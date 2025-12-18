'use client';

import { motion, AnimatePresence } from 'framer-motion';
import DecryptedText from '@/components/DecryptedText';

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

// Nav font for non-Aretian items
const NAV_FONT = 'var(--font-albert-sans)';
// Logo font
const LOGO_FONT = 'var(--font-bebas-neue)';

export function SideNav({ sections, activeIndex, onNavigate, colorMode = 'dark' }: SideNavProps) {
  // Text colors based on color mode
  const textColor = colorMode === 'light' ? '#0f0f1a' : '#ffffff';

  return (
    <div className="fixed left-0 top-0 bottom-0 z-[100] w-screen h-screen flex flex-col pointer-events-none">
      {/* Navigation */}
      <nav className="flex-1 flex flex-col pt-10 pb-8 px-8">
        <ul className="flex flex-col justify-between h-full list-none m-0 p-0">
          {sections.map((section, index) => {
            const isFirst = index === 0;
            const fontSize = isFirst ? 'clamp(4.5rem, 7vw, 9rem)' : 'clamp(3.5rem, 5.5vw, 7rem)';
            const fontFamily = isFirst ? LOGO_FONT : NAV_FONT;
            const fontWeight = isFirst ? 800 : 600;
            const letterSpacing = isFirst ? '0.15em' : '0.05em';

            // Eased stagger - starts fast, slows down
            const staggerDelay = Math.pow(index, 1.5) * 0.08;

            return (
              <motion.li
                key={section.id}
                initial={{ opacity: 0, filter: 'blur(20px)', y: 20 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0.5,
                  filter: 'blur(0px)',
                  scale: activeIndex === index ? 1.02 : 1,
                  y: 0,
                }}
                style={{ transformOrigin: 'left center' }}
                transition={{
                  duration: 1.2,
                  delay: staggerDelay,
                  ease: [0.22, 1, 0.36, 1],
                  filter: { duration: 1.4, delay: staggerDelay },
                  opacity: { duration: 0.3, delay: staggerDelay + 0.2 },
                }}
              >
                <div className="flex items-center gap-4 flex-nowrap">
                  <button
                    onClick={() => onNavigate?.(index)}
                    className="pointer-events-auto cursor-pointer text-left bg-transparent border-none p-0 m-0"
                    aria-label={`Go to ${section.label}`}
                  >
                    <motion.span
                      animate={{ color: textColor }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        fontSize,
                        fontFamily,
                        fontWeight,
                        letterSpacing,
                        lineHeight: 0.85,
                        textTransform: 'uppercase',
                      }}
                    >
                      {section.label}
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {isFirst && activeIndex === 0 && (
                      <motion.div
                        initial={{ opacity: 0, filter: 'blur(8px)', x: -20 }}
                        animate={{
                          opacity: 1,
                          filter: 'blur(0px)',
                          x: 0,
                          color: colorMode === 'light' ? '#0f0f1a' : '#ffffff'
                        }}
                        exit={{ opacity: 0, filter: 'blur(12px)', x: 20 }}
                        transition={{
                          duration: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                          exit: { duration: 0.5, ease: [0.4, 0, 1, 1] }
                        }}
                        className="shrink-0"
                        style={{
                          fontFamily: LOGO_FONT,
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {/* Desktop - single line */}
                        <span
                          className="hidden min-[840px]:inline items-center gap-4"
                          style={{ fontSize: 'clamp(2.5rem, 4vw, 5rem)', whiteSpace: 'nowrap', display: 'inline-flex' }}
                        >
                          <span className="w-0.5 h-[72px] bg-current opacity-40 -mt-3" />
                          <DecryptedText
                            text="URBAN ANALYTICS"
                            animateOn="view"
                            characters=";:."
                            speed={80}
                            sequential={true}
                            revealDirection="start"
                          />
                          <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 400, fontSize: '0.85em', position: 'relative', top: '-0.1em', margin: '0 -0.1em' }}>&</span>
                          <DecryptedText
                            text="DESIGN"
                            animateOn="view"
                            characters=";:."
                            speed={80}
                            sequential={true}
                            revealDirection="start"
                          />
                        </span>
                        {/* Mobile - two lines */}
                        <span
                          className="min-[840px]:hidden flex flex-col leading-tight"
                          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-0.5 h-14 bg-current opacity-40 -mt-1" />
                            <DecryptedText
                              text="URBAN ANALYTICS"
                              animateOn="view"
                              characters=";:."
                              speed={80}
                              sequential={true}
                              revealDirection="start"
                            />
                          </span>
                          <span>
                            <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 400, fontSize: '0.85em', position: 'relative', top: '-0.1em', margin: '0 -0.05em' }}>&</span>
                            <DecryptedText
                              text="DESIGN"
                              animateOn="view"
                              characters=";:."
                              speed={80}
                              sequential={true}
                              revealDirection="start"
                            />
                          </span>
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
