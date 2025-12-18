'use client';

import dynamic from 'next/dynamic';
import { Visible } from '@/components/layout/Visible';

// Dynamically import TransitMap to avoid SSR issues with Three.js
const TransitMap = dynamic(() => import('@/components/TransitMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/40">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading transit data...</span>
      </div>
    </div>
  ),
});

export function DesignSection() {
  return (
    <div className="w-full h-full bg-transparent relative overflow-hidden">
      <Visible>
        <div
          className="absolute right-[5%] top-1/2 -translate-y-1/2"
          style={{
            width: 'min(70vh, 70vw, 700px)',
            height: 'min(70vh, 70vw, 700px)',
            aspectRatio: '1 / 1',
          }}
        >
          <TransitMap />
        </div>
      </Visible>
    </div>
  );
}
