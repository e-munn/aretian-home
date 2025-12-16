'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, BarChart3, Building2 } from 'lucide-react';
import Header, { Section, navItems } from '@/components/head/header';
import { useCursorContext } from '@/components/cursor/CursorProvider';
import dynamic from 'next/dynamic';

const IsometricTest = dynamic(() => import('@/components/IsometricTest'), {
  ssr: false,
});

const validSections = ['analytics', 'design', 'projects', 'contact'] as const;

// Analytics Section Content
function AnalyticsContent() {
  return (
    <>
      <motion.div
        className="absolute bottom-16 right-16 max-w-2xl text-right flex flex-col justify-end gap-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight">
          <span className="text-foreground/60">Data-driven insights for </span>
          <span className="text-foreground font-medium">urban planning</span>
        </h2>
        <p className="text-xl md:text-2xl lg:text-3xl font-light leading-tight text-foreground/60">
          We analyze urban data to help cities make smarter decisions about infrastructure, transportation, and development.
        </p>
        <div className="h-1 w-32 bg-[#00C217] ml-auto mt-4 rounded-full" />
      </motion.div>
    </>
  );
}

// Design Section Content
function DesignContent() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl text-center">
        <Building2 className="w-24 h-24 mx-auto mb-8 text-white/80" strokeWidth={1} />
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-white mb-6">
          Urban Design Solutions
        </h2>
        <p className="text-xl md:text-2xl font-light leading-relaxed text-white/70">
          Creating sustainable, livable spaces through innovative urban design and master planning.
        </p>
      </div>
    </motion.div>
  );
}

// Projects Section Content
function ProjectsContent() {
  const projects = [
    { name: 'Barcelona Housing', description: 'Affordable housing analysis and visualization', icon: MapPin },
    { name: 'Smart Mobility', description: 'Transportation network optimization', icon: BarChart3 },
    { name: 'Urban Renewal', description: 'Revitalization strategies for city centers', icon: Building2 },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        {projects.map((project) => {
          const Icon = project.icon;
          return (
            <div
              key={project.name}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <Icon className="w-12 h-12 mb-4 text-[#00C217]" strokeWidth={1.5} />
              <h3 className="text-xl font-medium text-white mb-2">{project.name}</h3>
              <p className="text-white/60">{project.description}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Contact Section Content
function ContactContent() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <motion.div
      className="absolute right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 flex items-center justify-center p-8 md:p-12 pointer-events-auto z-10"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-md">
        {submitted ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-16 h-16 bg-[#00C217] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00C217]/25"
            >
              <Send className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-2xl font-medium text-foreground mb-2">Message sent!</h2>
            <p className="text-foreground/50">We&apos;ll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-1">Get in Touch</h2>
              <p className="text-foreground/50">We&apos;d love to hear from you</p>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="w-full py-3 px-4 bg-white/10 text-foreground rounded-xl placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#00C217]/30 transition-all border-2 border-transparent focus:border-[#00C217]/20"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              rows={4}
              required
              className="w-full py-3 px-4 bg-white/10 text-foreground rounded-xl placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#00C217]/30 transition-all resize-none border-2 border-transparent focus:border-[#00C217]/20"
            />
            <button
              type="submit"
              className="w-full py-3 px-6 bg-[#00C217] text-[#010029] rounded-xl font-medium hover:bg-[#00a813] transition-colors shadow-lg shadow-[#00C217]/25"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}

// Section Overlay Component
function SectionOverlay({ activeSection }: { activeSection: Section }) {
  const isDarkMode = activeSection === 'design' || activeSection === 'projects';

  const getOverlayBg = () => {
    if (isDarkMode) return 'bg-transparent';
    if (activeSection) return 'bg-background/95';
    return 'bg-transparent';
  };

  return (
    <>
      {/* Dark mode background layers */}
      <motion.div
        className="fixed inset-0 bg-black z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: activeSection === 'design' ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed inset-0 bg-[#020035] z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: activeSection === 'projects' ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      <AnimatePresence mode="wait">
        {activeSection && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-10 pointer-events-none ${getOverlayBg()}`}
          >
            <div className="relative w-full h-full pointer-events-none [&>*]:pointer-events-auto">
              {activeSection === 'analytics' && <AnalyticsContent />}
              {activeSection === 'design' && <DesignContent />}
              {activeSection === 'projects' && <ProjectsContent />}
              {activeSection === 'contact' && <ContactContent />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const [hoveredSection, setHoveredSection] = useState<Section>(null);
  const [lockedSection, setLockedSection] = useState<Section>(null);
  const { setDarkMode } = useCursorContext();

  // Read hash on mount and listen for changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Section;
      if (validSections.includes(hash as (typeof validSections)[number])) {
        setLockedSection(hash);
      } else {
        setLockedSection(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavClick = useCallback((id: Section) => {
    if (lockedSection === id) {
      history.pushState(null, '', ' ');
      setLockedSection(null);
    } else {
      history.pushState(null, '', `#${id}`);
      setLockedSection(id);
    }
  }, [lockedSection]);

  const handleNavHover = useCallback((id: Section) => {
    if (lockedSection && lockedSection !== id) {
      history.pushState(null, '', `#${id}`);
      setLockedSection(id);
    } else if (!lockedSection) {
      setHoveredSection(id);
    }
  }, [lockedSection]);

  const handleNavLeave = useCallback(() => {
    if (!lockedSection) {
      setHoveredSection(null);
    }
  }, [lockedSection]);

  const activeSection = lockedSection || hoveredSection;
  const isDarkMode = activeSection === 'design' || activeSection === 'projects';

  // Update cursor dark mode
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode, setDarkMode]);

  return (
    <>
      {/* 3D City background */}
      <IsometricTest />

      <main className="h-screen overflow-hidden relative z-10 pointer-events-none [&>*]:pointer-events-auto">
        <Header
          activeSection={activeSection}
          lockedSection={lockedSection}
          onHover={handleNavHover}
          onLeave={handleNavLeave}
          onClick={handleNavClick}
        />
      </main>

      <SectionOverlay activeSection={activeSection} />
    </>
  );
}
