'use client';

import dynamic from 'next/dynamic';

// Dynamically import TransitMap to avoid SSR issues with Three.js
const TransitMap = dynamic(() => import('@/components/TransitMap'), {
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
      Loading transit data...
    </div>
  ),
});

export function DesignSection() {
  return (
    <section
      id="design"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#0f0f1a',
      }}
    >
      <TransitMap />
    </section>
  );
}
