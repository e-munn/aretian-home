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
    color: '#3b82f6',  // blue-500
    bgColor: 'rgba(59, 130, 246, 0.1)',   // blue-500/10
    titleColor: '#1d4ed8',                 // blue-700
    title: 'Urban Analytics',
    description: 'Data-driven insights using advanced analytics to understand city patterns and inform decision-making.',
    label: 'Analytics',
  },
  {
    color: '#8b5cf6',  // violet-500
    bgColor: 'rgba(139, 92, 246, 0.1)',   // violet-500/10
    titleColor: '#6d28d9',                 // violet-700
    title: 'Digital Twins',
    description: 'Real-time city simulation with our City Digital Twin platform for scenario testing and optimization.',
    label: 'Simulation',
  },
  {
    color: '#14b8a6',  // teal-500
    bgColor: 'rgba(20, 184, 166, 0.1)',   // teal-500/10
    titleColor: '#0f766e',                 // teal-700
    title: 'Master Planning',
    description: 'Metropolitan-scale design optimization using complexity science and network analysis.',
    label: 'Planning',
  },
  {
    color: '#f59e0b',  // amber-500
    bgColor: 'rgba(245, 158, 11, 0.1)',   // amber-500/10
    titleColor: '#b45309',                 // amber-700
    title: 'Economic Development',
    description: 'Growth strategies for distributed prosperity and sustainable economic ecosystems.',
    label: 'Growth',
  },
  {
    color: '#06b6d4',  // cyan-500
    bgColor: 'rgba(6, 182, 212, 0.1)',    // cyan-500/10
    titleColor: '#0e7490',                 // cyan-700
    title: 'Network Analysis',
    description: 'Machine learning and complexity science to reveal hidden patterns in urban systems.',
    label: 'Networks',
  },
  {
    color: '#ec4899',  // pink-500
    bgColor: 'rgba(236, 72, 153, 0.1)',   // pink-500/10
    titleColor: '#be185d',                 // pink-700
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
