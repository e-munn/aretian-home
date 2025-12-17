'use client';

import { useState, useRef, useCallback, useEffect, ReactNode, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SideNav, NavSection } from './SideNav';
import { SectionBreak } from '@/components/layout/SectionBreak';

// Context to share active section info with children
type ColorMode = 'dark' | 'light';
const SectionContext = createContext<{ activeIndex: number; colorMode: ColorMode }>({
  activeIndex: 0,
  colorMode: 'dark'
});
export const useSectionContext = () => useContext(SectionContext);

// Section theme config - background color and mode
const SECTION_THEME: Record<string, { bg: string; mode: ColorMode }> = {
  aretian: { bg: '#0f0f1a', mode: 'dark' },
  services: { bg: '#1a2a3a', mode: 'dark' },
  process: { bg: '#0f0f1a', mode: 'dark' },
  design: { bg: '#0f0f1a', mode: 'dark' },
  projects: { bg: '#0f0f1a', mode: 'dark' },
  team: { bg: '#0f0f1a', mode: 'dark' },
  contact: { bg: '#0f0f1a', mode: 'dark' },
};

// Global animated background
function GlobalBackground({ sectionId }: { sectionId: string }) {
  const theme = SECTION_THEME[sectionId] || { bg: '#0f0f1a', mode: 'dark' };
  const bgColor = theme.bg;

  return (
    <motion.div
      className="fixed inset-0 z-0"
      initial={false}
      animate={{ backgroundColor: bgColor }}
      transition={{
        duration: 2.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}

// Bottom-right section description
function SectionDescription({ description, colorMode }: { description?: string; colorMode: ColorMode }) {
  const textColor = colorMode === 'light' ? 'rgba(15, 15, 26, 0.6)' : 'rgba(255, 255, 255, 0.7)';

  return (
    <div className="fixed bottom-8 right-8 z-50 max-w-sm pointer-events-none">
      <AnimatePresence mode="wait">
        {description && (
          <motion.div
            key={description}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-right"
          >
            <motion.p
              className="text-sm leading-relaxed m-0 font-google"
              animate={{ color: textColor }}
              transition={{ duration: 0.8 }}
            >
              {description}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SectionProps {
  id: string;
  index: number;
  children: ReactNode;
  scrollProgress: number; // 0 = fully visible, 1 = scrolled away
  isActive: boolean;
}

function Section({ id, children, scrollProgress, isActive }: SectionProps) {
  // Calculate blur and opacity based on scroll progress
  const blur = Math.min(scrollProgress * 12, 12); // Max 12px blur
  const opacity = 1 - scrollProgress * 0.4; // Fade to 60% opacity
  const scale = 1 - scrollProgress * 0.05; // Slight scale down

  return (
    <section
      id={id}
      className="h-screen w-full relative"
      style={{
        filter: scrollProgress > 0 ? `blur(${blur}px)` : 'none',
        opacity: isActive ? 1 : opacity,
        transform: `scale(${scale})`,
        transition: 'filter 0.1s ease-out, opacity 0.1s ease-out, transform 0.1s ease-out',
      }}
    >
      {children}
    </section>
  );
}

interface FullPageScrollProps {
  sections: NavSection[];
  children: ReactNode[];
  showBreaks?: boolean;
  breakHeight?: number;
}

// Break height constant - disabled
const BREAK_HEIGHT = 0;

export function FullPageScroll({ sections, children, showBreaks = false, breakHeight = BREAK_HEIGHT }: FullPageScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState<number[]>(sections.map(() => 0));
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const wheelAccumulator = useRef(0);
  const lastWheelTime = useRef(0);

  // Calculate total height including breaks
  const sectionHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
  const totalBreakHeight = showBreaks ? breakHeight * (sections.length - 1) : 0;

  // Track scroll progress for blur effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollProgress = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = window.innerHeight;
      const sectionWithBreak = viewportHeight + (showBreaks ? breakHeight : 0);

      const newProgress = sections.map((_, index) => {
        const sectionStart = index * sectionWithBreak;
        const sectionEnd = sectionStart + viewportHeight;

        // How much has this section scrolled past the viewport?
        if (scrollTop >= sectionEnd) {
          return 1; // Fully scrolled away
        } else if (scrollTop > sectionStart) {
          return (scrollTop - sectionStart) / viewportHeight;
        }
        return 0;
      });

      setScrollProgress(newProgress);
    };

    // Use requestAnimationFrame for smooth updates during scroll animation
    let rafId: number;
    const smoothUpdate = () => {
      updateScrollProgress();
      rafId = requestAnimationFrame(smoothUpdate);
    };

    rafId = requestAnimationFrame(smoothUpdate);
    return () => cancelAnimationFrame(rafId);
  }, [sections.length, showBreaks, breakHeight]);

  // Smooth scroll to section with dramatic easing
  const scrollToSection = useCallback((index: number, updateHash = true) => {
    if (index < 0 || index >= sections.length || isAnimating.current) return;

    isAnimating.current = true;
    setActiveIndex(index);

    // Update URL hash
    if (updateHash && typeof window !== 'undefined') {
      const sectionId = sections[index]?.id;
      if (sectionId) {
        window.history.replaceState(null, '', `#${sectionId}`);
      }
    }

    const container = containerRef.current;
    if (!container) return;

    // Calculate target position including break heights
    const breaksBeforeTarget = showBreaks ? index * breakHeight : 0;
    const targetY = index * window.innerHeight + breaksBeforeTarget;
    const startY = container.scrollTop;
    const distance = targetY - startY;
    const duration = 2200; // ms - slow cinematic scroll
    const startTime = performance.now();

    // Ultra-smooth easing: very gradual acceleration and deceleration
    // Custom bezier-like curve for buttery smooth feel
    const smoothEase = (t: number) => {
      // Sine-based easing for the smoothest feel
      return t < 0.5
        ? (1 - Math.cos(t * Math.PI)) / 2
        : (1 + Math.sin((t - 0.5) * Math.PI)) / 2;
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = smoothEase(progress);

      container.scrollTop = startY + distance * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
        wheelAccumulator.current = 0;
      }
    };

    requestAnimationFrame(animate);
  }, [sections]);

  // Handle initial hash and popstate (back/forward buttons)
  useEffect(() => {
    const getIndexFromHash = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (!hash) return 0;
      const index = sections.findIndex((s) => s.id === hash);
      return index >= 0 ? index : 0;
    };

    // On mount, scroll to hash section (instant, no animation)
    const initialIndex = getIndexFromHash();
    if (initialIndex > 0) {
      const container = containerRef.current;
      if (container) {
        const breaksBeforeTarget = showBreaks ? initialIndex * breakHeight : 0;
        container.scrollTop = initialIndex * window.innerHeight + breaksBeforeTarget;
        setActiveIndex(initialIndex);
      }
    }

    // Handle browser back/forward
    const handlePopState = () => {
      const index = getIndexFromHash();
      scrollToSection(index, false); // Don't update hash again
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sections, scrollToSection, showBreaks, breakHeight]);

  // Handle wheel events for controlled scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isAnimating.current) return;

      const now = Date.now();
      // Reset accumulator if too much time passed
      if (now - lastWheelTime.current > 200) {
        wheelAccumulator.current = 0;
      }
      lastWheelTime.current = now;

      // Accumulate wheel delta
      wheelAccumulator.current += e.deltaY;

      // Threshold for triggering section change
      const threshold = 80;

      if (wheelAccumulator.current > threshold) {
        scrollToSection(activeIndex + 1);
      } else if (wheelAccumulator.current < -threshold) {
        scrollToSection(activeIndex - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [activeIndex, scrollToSection]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToSection(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToSection(activeIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, scrollToSection]);

  const handleNavigate = useCallback((index: number) => {
    scrollToSection(index);
  }, [scrollToSection]);

  // Get current section's color mode
  const currentSectionId = sections[activeIndex]?.id || 'aretian';
  const colorMode = SECTION_THEME[currentSectionId]?.mode || 'dark';

  return (
    <SectionContext.Provider value={{ activeIndex, colorMode }}>
      <GlobalBackground sectionId={currentSectionId} />

      <SideNav
        sections={sections}
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
        colorMode={colorMode}
      />

      <div
        ref={containerRef}
        className="h-screen overflow-hidden relative z-10"
        style={{ overscrollBehavior: 'none' }}
      >
        <div style={{ height: `calc(${sections.length * 100}vh + ${totalBreakHeight}px)` }}>
          {children.map((child, index) => {
            const sectionId = sections[index]?.id || `section-${index}`;
            const nextSectionId = sections[index + 1]?.id;
            const currentTheme = SECTION_THEME[sectionId] || { bg: '#0f0f1a', mode: 'dark' };
            const nextTheme = nextSectionId ? SECTION_THEME[nextSectionId] : currentTheme;

            return (
              <div key={sectionId}>
                <Section
                  id={sectionId}
                  index={index}
                  scrollProgress={scrollProgress[index] || 0}
                  isActive={activeIndex === index}
                >
                  {child}
                </Section>
                {/* Add break between sections (except after last) */}
                {showBreaks && index < children.length - 1 && (
                  <SectionBreak
                    height={breakHeight}
                    fromColor={currentTheme.bg}
                    toColor={nextTheme.bg}
                    showDots={true}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionContext.Provider>
  );
}
