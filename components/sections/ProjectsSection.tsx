'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Globe, Grid3X3 } from 'lucide-react';
import { useState } from 'react';
import { Visible } from '@/components/layout/Visible';
import { useSectionContext } from '@/components/navigation/FullPageScroll';

// Awards and recognitions data with gold theme
const AWARDS = [
  { emoji: '🏆', text: 'UrbanNext and Actar Network Urban Design Firm' },
  { emoji: '🎖️', text: 'Dan Schodek Excellence in Design Award - Harvard GSD' },
  { emoji: '💡', text: 'Venture Incubation Program (VIP) Harvard Innovation Lab' },
  { emoji: '🌿', text: 'Campus Innovation Award - Harvard Office for Sustainability' },
  { emoji: '⭐', text: 'Tech and Startup Mover and Shaker Thought Leader - BostInno' },
  { emoji: '🌍', text: 'Sustainable Cities and Communities Leadership Award - CogX2020' },
  { emoji: '🎓', text: 'Fellows at School of Engineering and Applied Sciences - Harvard' },
];

const ProjectGlobe = dynamic(() => import('@/components/ui/ProjectGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/30">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading globe...</span>
      </div>
    </div>
  ),
});

// Real Aretian projects with coordinates - muted colors for grid view
const PROJECTS = [
  {
    name: 'Barcelona Metropolitan Digital Twin',
    description: 'State-of-the-art City Digital Twin simulating infrastructure, socio-economic dynamics, mobility, and land use across 36 municipalities.',
    tags: ['Digital Twin', 'City Science'],
    color: '#4a9c5a',
    lat: 41.3851,
    lng: 2.1734,
    city: 'Barcelona, Spain',
  },
  {
    name: 'Sant Feliu Innovation District',
    description: 'Strategic masterplan transforming Sant Feliu de Llobregat into an innovation district through urban regeneration and institutional collaboration.',
    tags: ['Planning', 'Innovation'],
    color: '#6b8cba',
    lat: 41.3833,
    lng: 2.0448,
    city: 'Sant Feliu de Llobregat, Spain',
  },
  {
    name: 'NOA Belém Airport District',
    description: 'Masterplanning to revitalize Belém\'s airport area into an innovation hub supporting economic growth, sustainability, and COP30.',
    tags: ['Planning', 'Sustainability'],
    color: '#5a9e94',
    lat: -1.4558,
    lng: -48.4902,
    city: 'Belém, Brazil',
  },
  {
    name: 'Esplugues Innovation District',
    description: 'Transforming Esplugues into a leading innovation hub through strategic urban and economic regeneration.',
    tags: ['Innovation', 'Economic Dev'],
    color: '#8a7cb8',
    lat: 41.3764,
    lng: 2.0889,
    city: 'Esplugues de Llobregat, Spain',
  },
  {
    name: 'São Paulo CITI Innovation District',
    description: 'Analyzing the network of talent and urban infrastructure and developing an innovation placemaking strategy.',
    tags: ['Analytics', 'Innovation'],
    color: '#b8943a',
    lat: -23.5505,
    lng: -46.6333,
    city: 'São Paulo, Brazil',
  },
  {
    name: 'Global Cities Study',
    description: 'Revolutionizing urban planning with evidence-based city science across Amsterdam, Boston, Barcelona, Munich, and Stockholm.',
    tags: ['Research', 'City Science'],
    color: '#b87a94',
    lat: 52.3676,
    lng: 4.9041,
    city: 'Amsterdam, Netherlands',
  },
  {
    name: 'NYC Real Estate Predictive Modelling',
    description: 'Informing real estate strategy with advanced analytics for targeted investments in the U.S. market.',
    tags: ['Analytics', 'Real Estate'],
    color: '#7a7eb8',
    lat: 40.7128,
    lng: -74.006,
    city: 'New York City, USA',
  },
  {
    name: 'Badalona Innovation District',
    description: 'Growing job opportunities and strategic industry investment through innovation district masterplanning.',
    tags: ['Planning', 'Economic Dev'],
    color: '#5a8ab8',
    lat: 41.4469,
    lng: 2.2450,
    city: 'Badalona, Spain',
  },
  {
    name: 'Massport Digital Transformation',
    description: 'Enhancing MassPort\'s operational efficiency with a unified Airport Business Intelligence platform.',
    tags: ['Digital Twin', 'Software'],
    color: '#b8784a',
    lat: 42.3656,
    lng: -71.0096,
    city: 'Boston, USA',
  },
  {
    name: 'EU Real Estate Investment',
    description: 'Targeting high-value industries and predicting office space demand for real estate development across Europe.',
    tags: ['Analytics', 'Real Estate'],
    color: '#7a9c5a',
    lat: 50.8503,
    lng: 4.3517,
    city: 'Brussels, Belgium',
  },
  {
    name: 'MIT Coworking Space Analytics',
    description: 'Sensor-based mapping to measure the success of start-up teams working in MIT\'s coworking space.',
    tags: ['Research', 'Analytics'],
    color: '#9a7ab8',
    lat: 42.3601,
    lng: -71.0942,
    city: 'Cambridge, USA',
  },
  {
    name: 'Mexico City & Monterrey Districts',
    description: 'Revitalizing Mexico City and Monterrey with cutting-edge analytics for innovation district growth.',
    tags: ['Planning', 'Innovation'],
    color: '#b86a6a',
    lat: 19.4326,
    lng: -99.1332,
    city: 'Mexico City, Mexico',
  },
];

// Grid View
function GridView({ projects }: { projects: typeof PROJECTS }) {
  return (
    <div className="h-full pt-12 px-6 pb-6 md:pt-12 md:px-8 md:pb-8">
      <div
        className="h-full grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
        }}
      >
        {projects.map((project, i) => (
          <motion.button
            key={project.name}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative rounded-xl p-4 flex flex-col text-left transition-all hover:scale-[1.02] overflow-hidden"
            style={{
              backgroundColor: `${project.color}10`,
              border: `1px solid ${project.color}25`,
              cursor: 'pointer',
            }}
            data-cursor-corners
          >
            {/* Title */}
            <h3
              className="text-base md:text-lg leading-tight mb-1.5 uppercase tracking-wide"
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'var(--font-bebas-neue)',
              }}
            >
              {project.name}
            </h3>

            {/* Description - with ellipsis overflow */}
            <p
              className="text-[11px] leading-relaxed text-white/40 flex-1 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {project.description}
            </p>

            {/* Tags at bottom */}
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[8px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                  style={{
                    color: project.color,
                    background: `${project.color}20`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Accent line at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
              style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Globe View
function GlobeView({ projects, isVisible }: { projects: typeof PROJECTS; isVisible: boolean }) {
  return (
    <div className="h-full w-full">
      <ProjectGlobe projects={projects} isVisible={isVisible} />
    </div>
  );
}

// Awards Badge Marquee component
function AwardsBadgeMarquee() {
  const row1 = AWARDS.slice(0, 4);
  const row2 = AWARDS.slice(4);

  const renderRow = (awards: typeof AWARDS, direction: 1 | -1, rowIndex: number) => {
    const duplicated = [...awards, ...awards, ...awards];
    return (
      <div className="relative overflow-hidden">
        <motion.div
          className="flex items-center gap-4"
          animate={{ x: direction === -1 ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 25,
              ease: 'linear',
            },
          }}
        >
          {duplicated.map((award, i) => (
            <div
              key={`${rowIndex}-${i}`}
              className="flex items-center gap-2 shrink-0 p-1.5 px-4 rounded-full border border-white/10 bg-white/[0.03]"
            >
              <span className="text-base">{award.emoji}</span>
              <span className="text-white/80 text-sm md:text-base whitespace-nowrap font-medium">
                {award.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {renderRow(row1, -1, 0)}
      {renderRow(row2, 1, 1)}
    </div>
  );
}

export function ProjectsSection() {
  const [view, setView] = useState<'grid' | 'globe'>('globe');
  const { activeIndex } = useSectionContext();
  const isVisible = activeIndex === 4; // Work section is index 4

  return (
    <section
      id="work"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* View toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-1 p-1 rounded-lg bg-black/40 border border-white/20 backdrop-blur-sm">
        <button
          onClick={() => setView('globe')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${view === 'globe' ? 'bg-white/15 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
          title="Globe view"
        >
          <Globe size={14} />
          <span className="text-[10px] font-medium uppercase tracking-wide">Globe</span>
        </button>
        <button
          onClick={() => setView('grid')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${view === 'grid' ? 'bg-white/15 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
          title="Grid view"
        >
          <Grid3X3 size={14} />
          <span className="text-[10px] font-medium uppercase tracking-wide">Grid</span>
        </button>
      </div>

      <Visible>
        <div className="w-full h-full pb-56">
          {/* Projects view - takes full height minus awards */}
          {view === 'grid' ? (
            <GridView projects={PROJECTS} />
          ) : (
            <GlobeView projects={PROJECTS} isVisible={isVisible} />
          )}
        </div>
      </Visible>

      {/* Awards banner - outside Visible for full width */}
      <div className="absolute bottom-0 left-0 right-0 h-56 flex flex-col justify-center w-full bg-[#0f0f1a]/80 backdrop-blur-md z-10 overflow-hidden">
        <p className="text-white/80 text-sm md:text-base pb-4 uppercase tracking-widest px-8 text-right flex items-center justify-end gap-2">
          <span className="text-base md:text-lg leading-none relative -top-1">:</span>
          <span className="border-b-2 border-white/20 pb-1">Awards & Recognitions</span>
        </p>
        <AwardsBadgeMarquee />
        {/* Gradient overlay - fades from solid on left to transparent on right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #0f0f1a 0%, #0f0f1a 15%, rgba(15,15,26,0.8) 25%, rgba(15,15,26,0) 40%, transparent 100%)',
            zIndex: 50,
          }}
        />
      </div>
    </section>
  );
}
