'use client';

import dynamic from 'next/dynamic';
import { BarChart3, Layers, Map, TrendingUp, Share2, Eye } from 'lucide-react';
import type { CardData } from '@/components/ui/MagicBento';

// Dynamically import MagicBento to avoid SSR issues with gsap
const MagicBento = dynamic(() => import('@/components/ui/MagicBento'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0f0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666'
    }}>
      Loading...
    </div>
  ),
});

const SERVICES: CardData[] = [
  {
    color: '#0a1628',
    title: 'Urban Analytics',
    description: 'Data-driven insights using advanced analytics to understand city patterns and inform decision-making.',
    label: 'Analytics',
    icon: <BarChart3 size={24} />,
  },
  {
    color: '#0a1628',
    title: 'Digital Twins',
    description: 'Real-time city simulation with our City Digital Twin platform for scenario testing and optimization.',
    label: 'Simulation',
    icon: <Layers size={24} />,
  },
  {
    color: '#0a1628',
    title: 'Master Planning',
    description: 'Metropolitan-scale design optimization using complexity science and network analysis.',
    label: 'Planning',
    icon: <Map size={24} />,
  },
  {
    color: '#0a1628',
    title: 'Economic Development',
    description: 'Growth strategies for distributed prosperity and sustainable economic ecosystems.',
    label: 'Growth',
    icon: <TrendingUp size={24} />,
  },
  {
    color: '#0a1628',
    title: 'Network Analysis',
    description: 'Machine learning and complexity science to reveal hidden patterns in urban systems.',
    label: 'Networks',
    icon: <Share2 size={24} />,
  },
  {
    color: '#0a1628',
    title: 'Visualization',
    description: 'Interactive dashboards and Business Intelligence Platforms for stakeholder engagement.',
    label: 'Visual',
    icon: <Eye size={24} />,
  },
];

export function TransitSection() {
  return (
    <section
      id="transit"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#0f0f1a',
      }}
    >
      <MagicBento
        cards={SERVICES}
        textAutoHide={true}
        enableStars={false}
        enableSpotlight={false}
        enableBorderGlow={true}
        enableTilt={false}
        enableMagnetism={false}
        clickEffect={false}
        spotlightRadius={500}
        glowColor="59, 130, 246"
      />
    </section>
  );
}
