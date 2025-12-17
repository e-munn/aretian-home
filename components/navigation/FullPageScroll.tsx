'use client';

import { useState, useRef, useCallback, useEffect, ReactNode, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SideNav, NavSection } from './SideNav';

// Context to share active section index with children
const SectionContext = createContext<{ activeIndex: number }>({ activeIndex: 0 });
export const useSectionContext = () => useContext(SectionContext);

// Bottom-right section description
function SectionDescription({ description }: { description?: string }) {
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
            <p className="text-white/70 text-sm leading-relaxed m-0 font-google">
              {description}
            </p>
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
}

function Section({ id, children }: SectionProps) {
  return (
    <section
      id={id}
      className="h-screen w-full relative"
    >
      {children}
    </section>
  );
}

interface FullPageScrollProps {
  sections: NavSection[];
  children: ReactNode[];
}

export function FullPageScroll({ sections, children }: FullPageScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const wheelAccumulator = useRef(0);
  const lastWheelTime = useRef(0);

  // Smooth scroll to section with dramatic easing
  const scrollToSection = useCallback((index: number) => {
    if (index < 0 || index >= sections.length || isAnimating.current) return;

    isAnimating.current = true;
    setActiveIndex(index);

    const container = containerRef.current;
    if (!container) return;

    const targetY = index * window.innerHeight;
    const startY = container.scrollTop;
    const distance = targetY - startY;
    const duration = 1200; // ms - slower for more drama
    const startTime = performance.now();

    // Dramatic easing: slow start, fast middle, slow end
    const easeInOutQuart = (t: number) => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuart(progress);

      container.scrollTop = startY + distance * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
        wheelAccumulator.current = 0;
      }
    };

    requestAnimationFrame(animate);
  }, [sections.length]);

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

  return (
    <SectionContext.Provider value={{ activeIndex }}>
      <SideNav
        sections={sections}
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
      />

      <SectionDescription description={sections[activeIndex]?.description} />

      <div
        ref={containerRef}
        className="h-screen overflow-hidden"
        style={{ overscrollBehavior: 'none' }}
      >
        <div style={{ height: `${sections.length * 100}vh` }}>
          {children.map((child, index) => (
            <Section
              key={sections[index]?.id || index}
              id={sections[index]?.id || `section-${index}`}
              index={index}
            >
              {child}
            </Section>
          ))}
        </div>
      </div>
    </SectionContext.Provider>
  );
}
