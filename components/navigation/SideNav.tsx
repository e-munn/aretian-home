'use client';

import { motion } from 'framer-motion';

export interface NavSection {
  id: string;
  label: string;
}

interface SideNavProps {
  sections: NavSection[];
  activeIndex: number;
  onNavigate?: (index: number) => void;
}

export function SideNav({ sections, activeIndex, onNavigate }: SideNavProps) {
  return (
    <div className="fixed left-0 top-0 bottom-0 z-50 w-screen h-screen flex flex-col pointer-events-none">
      {/* Logo */}
      <div className="p-8">
        <span className="text-2xl font-bold tracking-wider text-white uppercase">
          Aretian
        </span>
      </div>

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
                <span
                  className="text-white font-bold uppercase whitespace-nowrap"
                  style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', lineHeight: 0.85 }}
                >
                  {section.label}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
