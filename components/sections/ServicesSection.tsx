'use client';

import dynamic from 'next/dynamic';
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

function AnalyticsList() {
  return (
    <div className="h-full relative z-20 flex flex-col justify-start gap-3">
      {ANALYTICS_ITEMS.map((item, i) => (
        <div
          key={item.area}
          className="group flex items-start gap-3 py-2 px-3 rounded-lg transition-all hover:bg-black/5"
        >
          <span
            className="text-xl font-medium opacity-30 mt-0.5"
            style={{ color: item.color, fontFamily: 'var(--font-bebas-neue)' }}
          >
            0{i + 1}
          </span>
          <div className="flex-1">
            <div
              className="uppercase tracking-wider text-base font-semibold mb-0.5"
              style={{ color: item.color }}
            >
              {item.label}
            </div>
            <div
              className="text-sm leading-relaxed opacity-70"
              style={{ color: item.color }}
            >
              {item.description}
            </div>
          </div>
        </div>
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

function SoftwareList() {
  return (
    <div className="h-full relative z-20 flex flex-col justify-start gap-3">
      {SOFTWARE_ITEMS.map((item, i) => (
        <div
          key={item.area}
          className="group flex items-start gap-3 py-2 px-3 rounded-lg transition-all hover:bg-black/5"
        >
          <span
            className="text-xl font-medium opacity-30 mt-0.5"
            style={{ color: item.color, fontFamily: 'var(--font-bebas-neue)' }}
          >
            0{i + 1}
          </span>
          <div className="flex-1">
            <div
              className="uppercase tracking-wider text-base font-semibold mb-0.5"
              style={{ color: item.color }}
            >
              {item.label}
            </div>
            <div
              className="text-sm leading-relaxed opacity-70"
              style={{ color: item.color }}
            >
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Research publications
const RESEARCH_PUBLICATIONS = [
  {
    label: 'City Science Book',
    description: 'Performance Follows Form — A study of 100 cities across 5 continents.',
    color: '#92400e',  // amber-800
    url: 'https://actar.com/product/city-science/',
  },
  {
    label: 'Barcelona Report',
    description: 'A Vision for Barcelona\'s Future — Strategic growth framework.',
    color: '#b45309',  // amber-700
    url: '#',
  },
];

function ResearchList() {
  return (
    <div className="h-full relative z-20 flex flex-col justify-start gap-3">
      {RESEARCH_PUBLICATIONS.map((item, i) => (
        <a
          key={item.label}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 py-2 px-3 rounded-lg transition-all hover:bg-black/5"
        >
          <span
            className="text-xl font-medium opacity-30 mt-0.5"
            style={{ color: item.color, fontFamily: 'var(--font-bebas-neue)' }}
          >
            0{i + 1}
          </span>
          <div className="flex-1">
            <div
              className="uppercase tracking-wider text-base font-semibold mb-0.5"
              style={{ color: item.color }}
            >
              {item.label}
            </div>
            <div
              className="text-sm leading-relaxed opacity-70"
              style={{ color: item.color }}
            >
              {item.description}
            </div>
          </div>
        </a>
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
    customContent: <AnalyticsList />,
  },
  {
    color: '#f59e0b',  // amber-500
    bgColor: 'rgba(245, 158, 11, 0.15)',
    titleColor: '#92400e',  // amber-800
    title: 'Research',
    description: 'Collaborating with academic and research partners, our Harvard-based group drives groundbreaking research in Innovation, Networks, and Urbanism.',
    label: 'Research',
    customContent: <ResearchList />,
  },
  {
    color: '#ec4899',  // pink-500
    bgColor: 'rgba(236, 72, 153, 0.15)',
    titleColor: '#9d174d',  // pink-800
    title: 'Software',
    description: 'Aretian develops custom digital tools to enhance decision-making for cities and organizations.',
    label: 'Software',
    customContent: <SoftwareList />,
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
