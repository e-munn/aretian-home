'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';

// ===========================================
// SCROLL CONTEXT
// ===========================================

interface ScrollContextType {
  currentSection: number;
  totalSections: number;
  scrollTo: (index: number) => void;
  scrollNext: () => void;
  scrollPrev: () => void;
  isAnimating: boolean;
  direction: 'up' | 'down' | null;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export function useFullPageScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useFullPageScroll must be used within FullPageScrollProvider');
  }
  return context;
}

// ===========================================
// MAIN PROVIDER & CONTAINER
// ===========================================

interface FullPageScrollProps {
  children: ReactNode;
  /** Duration of scroll animation in seconds */
  duration?: number;
  /** Easing function */
  ease?: number[] | string;
  /** Enable keyboard navigation */
  keyboard?: boolean;
  /** Enable touch/swipe */
  touch?: boolean;
  /** Enable mouse wheel */
  wheel?: boolean;
  /** Cooldown between scrolls (ms) */
  cooldown?: number;
  /** Callback when section changes */
  onSectionChange?: (index: number) => void;
  /** Custom transition variants */
  variants?: {
    enter: (direction: number) => object;
    center: object;
    exit: (direction: number) => object;
  };
}

const defaultVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export function FullPageScroll({
  children,
  duration = 0.8,
  ease = [0.43, 0.13, 0.23, 0.96],
  keyboard = true,
  touch = true,
  wheel = true,
  cooldown = 800,
  onSectionChange,
  variants = defaultVariants,
}: FullPageScrollProps) {
  const sections = React.Children.toArray(children);
  const totalSections = sections.length;

  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastScrollTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to specific section
  const scrollTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      if (index < 0 || index >= totalSections) return;
      if (index === currentSection) return;

      const now = Date.now();
      if (now - lastScrollTime.current < cooldown) return;
      lastScrollTime.current = now;

      setDirection(index > currentSection ? 'down' : 'up');
      setIsAnimating(true);
      setCurrentSection(index);
      onSectionChange?.(index);
    },
    [currentSection, totalSections, isAnimating, cooldown, onSectionChange]
  );

  const scrollNext = useCallback(() => {
    scrollTo(currentSection + 1);
  }, [currentSection, scrollTo]);

  const scrollPrev = useCallback(() => {
    scrollTo(currentSection - 1);
  }, [currentSection, scrollTo]);

  // Wheel handler
  useEffect(() => {
    if (!wheel) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        scrollNext();
      } else if (e.deltaY < 0) {
        scrollPrev();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [wheel, scrollNext, scrollPrev]);

  // Keyboard handler
  useEffect(() => {
    if (!keyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          scrollNext();
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          scrollPrev();
          break;
        case 'Home':
          e.preventDefault();
          scrollTo(0);
          break;
        case 'End':
          e.preventDefault();
          scrollTo(totalSections - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboard, scrollNext, scrollPrev, scrollTo, totalSections]);

  // Touch/swipe handler
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!touch) return;

      const threshold = 50;
      const velocity = 500;

      if (info.offset.y < -threshold || info.velocity.y < -velocity) {
        scrollNext();
      } else if (info.offset.y > threshold || info.velocity.y > velocity) {
        scrollPrev();
      }
    },
    [touch, scrollNext, scrollPrev]
  );

  const contextValue: ScrollContextType = {
    currentSection,
    totalSections,
    scrollTo,
    scrollNext,
    scrollPrev,
    isAnimating,
    direction,
  };

  return (
    <ScrollContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence
          initial={false}
          mode="wait"
          custom={direction === 'down' ? 1 : -1}
          onExitComplete={() => setIsAnimating(false)}
        >
          <motion.div
            key={currentSection}
            custom={direction === 'down' ? 1 : -1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration, ease }}
            drag={touch ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            {sections[currentSection]}
          </motion.div>
        </AnimatePresence>
      </div>
    </ScrollContext.Provider>
  );
}

// ===========================================
// SECTION COMPONENT
// ===========================================

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Background color or gradient */
  bg?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function Section({ children, className = '', bg, style }: SectionProps) {
  return (
    <div
      className={`h-screen w-screen flex items-center justify-center ${className}`}
      style={{ background: bg, ...style }}
    >
      {children}
    </div>
  );
}

// ===========================================
// NAVIGATION DOTS
// ===========================================

interface NavigationDotsProps {
  /** Position of dots */
  position?: 'left' | 'right';
  /** Custom class for container */
  className?: string;
  /** Active dot color */
  activeColor?: string;
  /** Inactive dot color */
  inactiveColor?: string;
}

export function NavigationDots({
  position = 'right',
  className = '',
  activeColor = '#00C217',
  inactiveColor = 'rgba(255,255,255,0.3)',
}: NavigationDotsProps) {
  const { currentSection, totalSections, scrollTo } = useFullPageScroll();

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 ${
        position === 'right' ? 'right-6' : 'left-6'
      } ${className}`}
    >
      {Array.from({ length: totalSections }).map((_, i) => (
        <button
          key={i}
          onClick={() => scrollTo(i)}
          className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-125"
          style={{
            backgroundColor: i === currentSection ? activeColor : inactiveColor,
            transform: i === currentSection ? 'scale(1.2)' : 'scale(1)',
          }}
          aria-label={`Go to section ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ===========================================
// SCROLL PROGRESS INDICATOR
// ===========================================

interface ScrollProgressProps {
  /** Position */
  position?: 'top' | 'bottom';
  /** Height of progress bar */
  height?: number;
  /** Color */
  color?: string;
  /** Background color */
  bgColor?: string;
}

export function ScrollProgress({
  position = 'top',
  height = 3,
  color = '#00C217',
  bgColor = 'rgba(255,255,255,0.1)',
}: ScrollProgressProps) {
  const { currentSection, totalSections } = useFullPageScroll();
  const progress = ((currentSection + 1) / totalSections) * 100;

  return (
    <div
      className={`fixed left-0 right-0 z-50 ${position === 'top' ? 'top-0' : 'bottom-0'}`}
      style={{ height, backgroundColor: bgColor }}
    >
      <motion.div
        className="h-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

// ===========================================
// SECTION INDICATOR (Current / Total)
// ===========================================

interface SectionIndicatorProps {
  className?: string;
  /** Show as "01 / 05" format */
  padded?: boolean;
}

export function SectionIndicator({ className = '', padded = true }: SectionIndicatorProps) {
  const { currentSection, totalSections } = useFullPageScroll();

  const format = (n: number) => (padded ? String(n).padStart(2, '0') : String(n));

  return (
    <div className={`fixed bottom-6 right-6 z-50 text-white/50 font-mono text-sm ${className}`}>
      <span className="text-white">{format(currentSection + 1)}</span>
      <span className="mx-2">/</span>
      <span>{format(totalSections)}</span>
    </div>
  );
}

// ===========================================
// SCROLL-LINKED ANIMATION HOOK
// ===========================================

export function useScrollAnimation(sectionIndex: number) {
  const { currentSection, direction, isAnimating } = useFullPageScroll();

  const isActive = currentSection === sectionIndex;
  const isEntering = isActive && isAnimating;
  const isLeaving = !isActive && isAnimating && currentSection !== sectionIndex;

  return {
    isActive,
    isEntering,
    isLeaving,
    direction,
    isAnimating,
  };
}

// ===========================================
// ALTERNATIVE VARIANTS
// ===========================================

export const scrollVariants = {
  // Default slide up/down
  slide: defaultVariants,

  // Fade only
  fade: {
    enter: () => ({ opacity: 0 }),
    center: { opacity: 1 },
    exit: () => ({ opacity: 0 }),
  },

  // Scale + fade
  scale: {
    enter: (direction: number) => ({
      opacity: 0,
      scale: direction > 0 ? 0.8 : 1.2,
    }),
    center: { opacity: 1, scale: 1 },
    exit: (direction: number) => ({
      opacity: 0,
      scale: direction > 0 ? 1.2 : 0.8,
    }),
  },

  // Horizontal slide
  horizontal: {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  },

  // 3D flip
  flip: {
    enter: (direction: number) => ({
      rotateX: direction > 0 ? 90 : -90,
      opacity: 0,
    }),
    center: { rotateX: 0, opacity: 1 },
    exit: (direction: number) => ({
      rotateX: direction > 0 ? -90 : 90,
      opacity: 0,
    }),
  },

  // Cube rotation
  cube: {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      x: direction > 0 ? '50%' : '-50%',
      opacity: 0,
    }),
    center: { rotateY: 0, x: 0, opacity: 1 },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      x: direction > 0 ? '-50%' : '50%',
      opacity: 0,
    }),
  },
};
