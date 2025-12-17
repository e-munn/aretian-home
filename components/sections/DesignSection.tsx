'use client';

import dynamic from 'next/dynamic';
import { Visible } from '@/components/layout/Visible';

// Dynamically import TransitMap to avoid SSR issues with Three.js
const TransitMap = dynamic(() => import('@/components/TransitMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-transparent flex items-center justify-center text-white/40">
      Loading transit data...
    </div>
  ),
});

export function DesignSection() {
  return (
    <div className="w-full h-full bg-transparent relative overflow-hidden">
      <Visible>
        <div
          className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[55vw] h-[70vh] max-w-[800px] max-h-[650px]"
        >
          <TransitMap />
        </div>
      </Visible>
    </div>
  );
}
