'use client';

import { useState, useRef, useCallback, useEffect, ReactNode, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { SideNav, NavSection } from './SideNav';
import { SectionStepper } from './SectionStepper';
import { SectionBreak } from '@/components/layout/SectionBreak';
import { usePaletteStore } from '@/stores/paletteStore';
import { useCursorContext } from '@/components/cursor/CursorProvider';

// Context to share active section info with children
type ColorMode = 'dark' | 'light';
const SectionContext = createContext<{
  activeIndex: number;
  colorMode: ColorMode;
  navigateToSection: (index: number) => void;
}>({
  activeIndex: 0,
  colorMode: 'dark',
  navigateToSection: () => {},
});
export const useSectionContext = () => useContext(SectionContext);

// Section theme config - background color and mode (non-aretian sections)
const SECTION_THEME: Record<string, { bg: string; mode: ColorMode }> = {
  services: { bg: '#fff5eb', mode: 'light' },
  research: { bg: '#0f0f1a', mode: 'dark' },
  process: { bg: '#0f0f1a', mode: 'dark' },
  work: { bg: '#0f0f1a', mode: 'dark' },
  team: { bg: '#0f0f1a', mode: 'dark' },
  contact: { bg: '#0f0f1a', mode: 'dark' },
  more: { bg: '#000000', mode: 'dark' },
};

// Global animated background
function GlobalBackground({ sectionId }: { sectionId: string }) {
  const palette = usePaletteStore((state) => state.palette);

  // Use palette bg for aretian section, otherwise use section theme
  const bgColor = sectionId === 'aretian'
    ? palette.bg
    : (SECTION_THEME[sectionId]?.bg || '#0f0f1a');

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


interface SectionProps {
  id: string;
  index: number;
  children: ReactNode;
  scrollProgress: number; // 0 = fully visible, 1 = scrolled away
  isActive: boolean;
}

function Section({ id, children, scrollProgress, isActive }: SectionProps) {
  // Calculate blur and opacity based on scroll progress - exaggerated for dramatic effect
  const blur = Math.min(scrollProgress * 35, 35); // Max 35px blur for dramatic effect
  const opacity = 1 - scrollProgress * 0.6; // Fade to 40% opacity
  const scale = 1 - scrollProgress * 0.08; // More noticeable scale down
  const translateY = scrollProgress * -30; // Slight upward drift as it blurs

  // Don't apply transform when active to prevent jitter on scroll back
  const shouldTransform = !isActive && scrollProgress > 0;

  return (
    <section
      id={id}
      className="h-screen w-full relative"
      style={{
        filter: scrollProgress > 0 && !isActive ? `blur(${blur}px)` : 'none',
        opacity: isActive ? 1 : opacity,
        transform: shouldTransform ? `scale(${scale}) translateY(${translateY}px)` : 'none',
        transition: 'filter 0.15s ease-out, opacity 0.15s ease-out, transform 0.15s ease-out',
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
  renderWindow?: number; // How many sections before/after active to render (default 1)
  extraSection?: ReactNode; // Optional extra section after all nav sections (footer, etc.)
}

// Break height constant - disabled
const BREAK_HEIGHT = 0;

export function FullPageScroll({ sections, children, showBreaks = false, breakHeight = BREAK_HEIGHT, renderWindow = 1, extraSection }: FullPageScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Total sections includes the extra section if present
  const totalSections = sections.length + (extraSection ? 1 : 0);
  const [scrollProgress, setScrollProgress] = useState<number[]>(Array(totalSections).fill(0));
  const [visitedSections, setVisitedSections] = useState<Set<number>>(new Set([0])); // Track visited sections
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const wheelAccumulator = useRef(0);
  const lastWheelTime = useRef(0);

  // Check if we're on the extra section (last one, not in nav)
  const isOnExtraSection = extraSection && activeIndex >= sections.length;

  // Mark sections as visited when they become active
  useEffect(() => {
    setVisitedSections(prev => {
      const next = new Set(prev);
      // Add current and adjacent sections to visited
      for (let i = Math.max(0, activeIndex - renderWindow); i <= Math.min(totalSections - 1, activeIndex + renderWindow); i++) {
        next.add(i);
      }
      return next;
    });
  }, [activeIndex, renderWindow, totalSections]);

  // Check if a section should be rendered (within window or previously visited)
  const shouldRenderSection = useCallback((index: number): boolean => {
    // Always render if within the render window of active section
    if (Math.abs(index - activeIndex) <= renderWindow) return true;
    // Optionally keep visited sections rendered (comment out to be more aggressive)
    // return visitedSections.has(index);
    return false;
  }, [activeIndex, renderWindow]);

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

      const newProgress = Array(totalSections).fill(0).map((_, index) => {
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
  }, [totalSections, showBreaks, breakHeight]);

  // Smooth scroll to section with dramatic easing
  const scrollToSection = useCallback((index: number, updateHash = true) => {
    if (index < 0 || index >= totalSections || isAnimating.current) return;

    isAnimating.current = true;
    setActiveIndex(index);

    // Update URL hash (skip for extra section)
    if (updateHash && typeof window !== 'undefined' && index < sections.length) {
      const sectionId = sections[index]?.id;
      if (sectionId) {
        window.history.replaceState(null, '', `#${sectionId}`);
      }
    } else if (updateHash && typeof window !== 'undefined' && index >= sections.length) {
      // Clear hash for extra section
      window.history.replaceState(null, '', window.location.pathname);
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
  }, [sections, totalSections]);

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

    // Track boundary scroll accumulator for scrollable children
    let boundaryAccumulator = 0;
    let lastBoundaryTime = 0;
    const boundaryThreshold = 500; // Extra scroll needed at boundary before section change (high to prevent accidents)

    const handleWheel = (e: WheelEvent) => {
      // Check if event originated from a scrollable child
      const target = e.target as HTMLElement;
      const scrollableParent = target.closest('[data-scrollable]');

      if (scrollableParent) {
        const el = scrollableParent as HTMLElement;
        const canScrollUp = el.scrollTop > 0;
        const canScrollDown = el.scrollTop < el.scrollHeight - el.clientHeight - 1; // 1px tolerance

        // Let the child handle scrolling if it can scroll in that direction
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          boundaryAccumulator = 0; // Reset boundary accumulator when scrolling normally
          return; // Don't prevent default, let child scroll
        }

        // At boundary - accumulate scroll before allowing section change
        const now = Date.now();
        if (now - lastBoundaryTime > 300) {
          boundaryAccumulator = 0; // Reset if paused
        }
        lastBoundaryTime = now;
        boundaryAccumulator += Math.abs(e.deltaY);

        if (boundaryAccumulator < boundaryThreshold) {
          e.preventDefault();
          return; // Not enough scroll at boundary yet
        }
        // Enough boundary scroll - fall through to section navigation
      }

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
        boundaryAccumulator = 0; // Reset after section change
      } else if (wheelAccumulator.current < -threshold) {
        scrollToSection(activeIndex - 1);
        boundaryAccumulator = 0; // Reset after section change
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

  // Handle window resize - snap to current section to prevent layout jumble
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize to avoid too many updates
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const container = containerRef.current;
        if (!container || isAnimating.current) return;

        // Instantly snap to current section position
        const breaksBeforeTarget = showBreaks ? activeIndex * breakHeight : 0;
        const targetY = activeIndex * window.innerHeight + breaksBeforeTarget;
        container.scrollTop = targetY;
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [activeIndex, showBreaks, breakHeight]);

  const handleNavigate = useCallback((index: number) => {
    scrollToSection(index);
  }, [scrollToSection]);

  // Get current section's color mode
  const currentSectionId = activeIndex < sections.length
    ? (sections[activeIndex]?.id || 'aretian')
    : 'more';
  const colorMode = SECTION_THEME[currentSectionId]?.mode || 'dark';

  // Sync cursor color with section color mode
  const { setDarkMode } = useCursorContext();
  useEffect(() => {
    // Cursor should be dark (black) in light mode sections, white in dark mode sections
    setDarkMode(colorMode === 'dark');
  }, [colorMode, setDarkMode]);

  return (
    <SectionContext.Provider value={{ activeIndex, colorMode, navigateToSection: scrollToSection }}>
      <GlobalBackground sectionId={currentSectionId} />

      {/* Hide nav elements when on extra section */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOnExtraSection ? 0 : 1,
          y: isOnExtraSection ? -50 : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ pointerEvents: isOnExtraSection ? 'none' : 'auto' }}
      >
        <SideNav
          sections={sections}
          activeIndex={activeIndex}
          onNavigate={handleNavigate}
          colorMode={colorMode}
        />

        <SectionStepper
          totalSections={sections.length}
          activeIndex={activeIndex}
          onNavigate={handleNavigate}
          colorMode={colorMode}
        />
      </motion.div>

      <div
        ref={containerRef}
        className="h-screen overflow-hidden relative z-10"
        style={{ overscrollBehavior: 'none' }}
      >
        <div style={{ height: `calc(${totalSections * 100}vh + ${totalBreakHeight}px)` }}>
          {children.map((child, index) => {
            const sectionId = sections[index]?.id || `section-${index}`;
            const nextSectionId = sections[index + 1]?.id;
            const currentTheme = SECTION_THEME[sectionId] || { bg: '#0f0f1a', mode: 'dark' };
            const nextTheme = nextSectionId ? SECTION_THEME[nextSectionId] : currentTheme;
            const shouldRender = shouldRenderSection(index);

            return (
              <div key={sectionId}>
                {shouldRender ? (
                  <Section
                    id={sectionId}
                    index={index}
                    scrollProgress={scrollProgress[index] || 0}
                    isActive={activeIndex === index}
                  >
                    {child}
                  </Section>
                ) : (
                  // Placeholder for unrendered sections - maintains scroll height
                  <div
                    id={sectionId}
                    className="h-screen w-full"
                    style={{ background: currentTheme.bg }}
                  />
                )}
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

          {/* Extra section (more) - not in nav */}
          {extraSection && (
            <div>
              <Section
                id="more"
                index={sections.length}
                scrollProgress={scrollProgress[sections.length] || 0}
                isActive={activeIndex === sections.length}
              >
                {extraSection}
              </Section>
            </div>
          )}
        </div>
      </div>
    </SectionContext.Provider>
  );
}
