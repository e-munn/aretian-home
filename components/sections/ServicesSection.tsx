'use client';

import dynamic from 'next/dynamic';
import { MessageCircleQuestion } from 'lucide-react';
import type { CardData } from '@/components/ui/MagicBento';
import { Visible } from '@/components/layout/Visible';
import { AsyncBoundary } from '@/components/ui/AsyncBoundary';

// Dynamically import MagicBento to avoid SSR issues with gsap
const MagicBento = dynamic(() => import('@/components/ui/MagicBento'), {
  ssr: false,
});

const BentoLoadingFallback = (
  <div className="w-full h-full flex items-center justify-center text-[#00001e]/30">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading services...</span>
    </div>
  </div>
);

// Nested bento items for Analytics card
const ANALYTICS_ITEMS = [
  {
    label: 'Master Planning',
    description: 'Spatial analysis meets design strategy for livable, efficient cities.',
    color: '#1e3a5f',  // dark navy
    area: 'a'
  },
  {
    label: 'Strategic Planning',
    description: 'Data-driven scenarios for urban and economic growth.',
    color: '#1e40af',  // indigo-blue
    area: 'b'
  },
  {
    label: 'Spatial Analysis',
    description: 'Optimizing locations and layouts for community services.',
    color: '#0c4a6e',  // dark cyan
    area: 'c'
  },
  {
    label: 'Network Modelling',
    description: 'Mapping innovation, transport, and infrastructure networks.',
    color: '#334155',  // slate
    area: 'd'
  },
];

function NestedBento() {
  return (
    <div
      className="h-full gap-2 relative z-20"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'repeat(5, 1fr)',
        gridTemplateAreas: `
          "a a"
          "a a"
          "b b"
          "c d"
          "c d"
        `
      }}
    >
      {ANALYTICS_ITEMS.map((item) => (
        <button
          key={item.area}
          type="button"
          className="group relative rounded-lg p-3 md:p-4 flex flex-col justify-start text-left transition-all hover:scale-[1.02]"
          style={{
            gridArea: item.area,
            backgroundColor: `${item.color}15`,
            border: `1px solid ${item.color}30`,
            cursor: 'default',
          }}
          data-cursor-corners
        >
          <div
            className="text-base md:text-lg uppercase tracking-widest mb-1"
            style={{ color: item.color, filter: 'brightness(0.8)', fontFamily: 'var(--font-bebas-neue), sans-serif' }}
          >
            {item.label}
          </div>
          <div
            className="text-xs md:text-sm leading-snug"
            style={{ color: item.color, filter: 'brightness(0.7)' }}
          >
            {item.description}
          </div>
          {/* Hover icon - slides in from left */}
          <MessageCircleQuestion
            className="absolute bottom-3 right-3 w-5 h-5 opacity-0 -translate-x-3 group-hover:opacity-70 group-hover:translate-x-0 transition-all duration-300 ease-out"
            style={{ color: item.color }}
          />
        </button>
      ))}
    </div>
  );
}

// Nested bento items for Software card
const SOFTWARE_ITEMS = [
  {
    label: 'Digital Twins',
    description: 'Real-time digital replicas for visualization, simulation, and urban management.',
    color: '#9d174d',  // pink-800
    area: 'a'
  },
  {
    label: 'Custom SaaS',
    description: 'Tailored cloud platforms and BI tools for data-driven decision making.',
    color: '#db2777',  // pink-600
    area: 'b'
  },
];

function SoftwareBento() {
  return (
    <div
      className="h-full gap-2 relative z-20"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr 1fr',
        gridTemplateAreas: '"a" "b"'
      }}
    >
      {SOFTWARE_ITEMS.map((item) => (
        <button
          key={item.area}
          type="button"
          className="group relative rounded-lg p-3 md:p-4 flex flex-col justify-start text-left transition-all hover:scale-[1.02]"
          style={{
            gridArea: item.area,
            backgroundColor: `${item.color}15`,
            border: `1px solid ${item.color}30`,
            cursor: 'default',
          }}
          data-cursor-corners
        >
          <div
            className="text-base md:text-lg uppercase tracking-widest mb-1"
            style={{ color: item.color, filter: 'brightness(0.8)', fontFamily: 'var(--font-bebas-neue), sans-serif' }}
          >
            {item.label}
          </div>
          <div
            className="text-xs md:text-sm leading-snug"
            style={{ color: item.color, filter: 'brightness(0.7)' }}
          >
            {item.description}
          </div>
          {/* Hover icon - slides in from left */}
          <MessageCircleQuestion
            className="absolute bottom-3 right-3 w-5 h-5 opacity-0 -translate-x-3 group-hover:opacity-70 group-hover:translate-x-0 transition-all duration-300 ease-out"
            style={{ color: item.color }}
          />
        </button>
      ))}
    </div>
  );
}

const SERVICES: CardData[] = [
  {
    color: '#3b82f6',  // blue-500
    bgColor: 'rgba(59, 130, 246, 0.15)',
    titleColor: '#1e40af',  // blue-800
    title: 'Urban Analytics',
    description: 'Data-driven insights using advanced analytics to understand city patterns and inform decision-making.',
    label: 'Analytics',
    customContent: <NestedBento />,
  },
  {
    color: '#f59e0b',  // amber-500
    bgColor: 'rgba(245, 158, 11, 0.15)',
    titleColor: '#92400e',  // amber-800
    title: 'Research',
    description: 'Collaborating with academic and research partners, our Harvard-based group drives groundbreaking research in Innovation, Networks, and Urbanism.',
    label: 'Research',
  },
  {
    color: '#ec4899',  // pink-500
    bgColor: 'rgba(236, 72, 153, 0.15)',
    titleColor: '#9d174d',  // pink-800
    title: 'Software',
    description: 'Aretian develops custom digital tools to enhance decision-making for cities and organizations.',
    label: 'Software',
    customContent: <SoftwareBento />,
  },
];

export function ServicesSection() {
  return (
    <section
      id="services"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Visible>
        <AsyncBoundary loadingFallback={BentoLoadingFallback}>
          <MagicBento
            cards={SERVICES}
            textAutoHide={false}
            hideTitle={true}
            darkMode={false}
            enableStars={false}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={false}
            particleCount={0}
            spotlightRadius={500}
            glowColor="59, 130, 246"
          />
        </AsyncBoundary>
      </Visible>
    </section>
  );
}
