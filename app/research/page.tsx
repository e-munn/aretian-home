'use client';

import dynamic from 'next/dynamic';
import { FiPlay } from 'react-icons/fi';

const Carousel = dynamic(() => import('@/components/Carousel'), { ssr: false });

const VIDEO_ITEMS = [
  {
    id: 1,
    title: 'City Science Research',
    description: 'Exploring urban analytics and data-driven city planning methodologies.',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    thumbnail: '/images/research-thumb-1.jpg',
    icon: <FiPlay className="carousel-icon" />
  },
  {
    id: 2,
    title: 'Digital Twin Technology',
    description: 'How digital twins are transforming urban infrastructure management.',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    thumbnail: '/images/research-thumb-2.jpg',
    icon: <FiPlay className="carousel-icon" />
  },
  {
    id: 3,
    title: 'Innovation Districts',
    description: 'Building the future of cities through strategic innovation hubs.',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    thumbnail: '/images/research-thumb-3.jpg',
    icon: <FiPlay className="carousel-icon" />
  }
];

export default function ResearchPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: '#0f0f1a' }}
    >
      <h1
        className="text-5xl md:text-7xl text-white mb-4 uppercase tracking-wide text-center"
        style={{ fontFamily: 'var(--font-bebas-neue)' }}
      >
        Research
      </h1>
      <p className="text-white/50 text-center mb-12 max-w-xl">
        Explore our latest research in urban analytics, city science, and innovation district development.
      </p>

      <div style={{ height: '450px', position: 'relative' }}>
        <Carousel
          items={VIDEO_ITEMS}
          baseWidth={340}
          autoplay={true}
          autoplayDelay={4000}
          pauseOnHover={true}
          loop={true}
          round={false}
        />
      </div>
    </div>
  );
}
