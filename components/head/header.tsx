'use client';

import { motion } from 'framer-motion';
import AretianLogo from '@/components/AretianLogo';
import { useCursorContext } from '@/components/cursor/CursorProvider';

type Section = 'analytics' | 'design' | 'projects' | 'contact' | null;

const navItems: { label: string; id: Section }[] = [
  { label: 'Analytics', id: 'analytics' },
  { label: 'Design', id: 'design' },
  { label: 'Projects', id: 'projects' },
  { label: 'Contact', id: 'contact' },
];

function NavItem({
  label,
  isActive,
  isLocked,
  darkMode,
  onHover,
  onLeave,
  onClick,
}: {
  label: string;
  isActive: boolean;
  isLocked: boolean;
  darkMode: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const getTextColor = () => {
    if (isLocked || isActive) {
      return 'text-[#00C217]';
    }
    return 'text-white/70 hover:text-[#00C217]';
  };

  return (
    <motion.div
      className="py-2 w-fit"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <motion.button
        className={`font-medium uppercase tracking-wide cursor-pointer bg-transparent border-none text-left px-2 py-1 transition-colors duration-300 font-google ${getTextColor()}`}
        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {label}
      </motion.button>
    </motion.div>
  );
}

interface HeaderProps {
  activeSection: Section;
  lockedSection: Section;
  onHover: (section: Section) => void;
  onLeave: () => void;
  onClick: (section: Section) => void;
}

export default function Header({
  activeSection,
  lockedSection,
  onHover,
  onLeave,
  onClick,
}: HeaderProps) {
  const isDarkMode = activeSection === 'design' || activeSection === 'projects';

  return (
    <div className="pl-12 md:pl-16 lg:pl-24 py-12 h-full">
      <div className="relative z-20">
        <AretianLogo darkMode={isDarkMode} />
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              isActive={activeSection === item.id}
              isLocked={lockedSection === item.id}
              darkMode={isDarkMode}
              onHover={() => onHover(item.id)}
              onLeave={onLeave}
              onClick={() => onClick(item.id)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

export { navItems };
export type { Section };
