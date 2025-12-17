'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SideNav, NavSection } from './SideNav';

interface SectionProps {
  id: string;
  index: number;
  isActive: boolean;
  onEnterViewport: (index: number) => void;
  children: ReactNode;
}

function Section({ id, index, isActive, onEnterViewport, children }: SectionProps) {
  return (
    <motion.section
      id={id}
      className="h-screen w-full snap-start snap-always relative"
      onViewportEnter={() => onEnterViewport(index)}
      viewport={{
        margin: '-40% 0px -59% 0px',
        amount: 'some',
      }}
    >
      {children}
    </motion.section>
  );
}

interface FullPageScrollProps {
  sections: NavSection[];
  children: ReactNode[];
}

export function FullPageScroll({ sections, children }: FullPageScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback((index: number) => {
    const sectionId = sections[index]?.id;
    if (sectionId) {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sections]);

  const handleEnterViewport = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <>
      <SideNav
        sections={sections}
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
      />

      <div
        ref={containerRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {children.map((child, index) => (
          <Section
            key={sections[index]?.id || index}
            id={sections[index]?.id || `section-${index}`}
            index={index}
            isActive={activeIndex === index}
            onEnterViewport={handleEnterViewport}
          >
            {child}
          </Section>
        ))}
      </div>
    </>
  );
}
