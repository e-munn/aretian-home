'use client';

import dynamic from 'next/dynamic';
import type { CardData } from '@/components/ui/MagicBento';
import { Visible } from '@/components/layout/Visible';

// Dynamically import MagicBento to avoid SSR issues with gsap
const MagicBento = dynamic(() => import('@/components/ui/MagicBento'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(0, 0, 30, 0.3)'
    }}>
      Loading...
    </div>
  ),
});

const SERVICES: CardData[] = [
  {
    color: '#1e3a5f',  // Deep blue
    title: 'Urban Analytics',
    description: 'Data-driven insights using advanced analytics to understand city patterns and inform decision-making.',
    label: 'Analytics',
  },
  {
    color: '#3b1d4a',  // Deep purple
    title: 'Digital Twins',
    description: 'Real-time city simulation with our City Digital Twin platform for scenario testing and optimization.',
    label: 'Simulation',
  },
  {
    color: '#134e4a',  // Teal
    title: 'Master Planning',
    description: 'Metropolitan-scale design optimization using complexity science and network analysis.',
    label: 'Planning',
  },
  {
    color: '#4a2c1d',  // Warm brown
    title: 'Economic Development',
    description: 'Growth strategies for distributed prosperity and sustainable economic ecosystems.',
    label: 'Growth',
  },
  {
    color: '#1e3a3a',  // Dark cyan
    title: 'Network Analysis',
    description: 'Machine learning and complexity science to reveal hidden patterns in urban systems.',
    label: 'Networks',
  },
  {
    color: '#2d2d4a',  // Slate purple
    title: 'Visualization',
    description: 'Interactive dashboards and Business Intelligence Platforms for stakeholder engagement.',
    label: 'Visual',
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
        <MagicBento
          cards={SERVICES}
          textAutoHide={true}
          enableStars={false}
          enableSpotlight={false}
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={false}
          particleCount={0}
          spotlightRadius={500}
          glowColor="59, 130, 246"
        />
      </Visible>
    </section>
  );
}
