'use client';

import { LoadingLegend } from '@/components/city/LoadingLegend';
import GradualBlur from '@/components/GradualBlur';
import '@/components/GradualBlur.css';
import dynamic from 'next/dynamic';
import { AsyncBoundary } from '@/components/ui/AsyncBoundary';

const CityScene = dynamic(() => import('@/components/CityScene'), {
  ssr: false,
});

const CityLoadingFallback = (
  <div className="w-full h-full flex items-center justify-center bg-[#00001e]">
    <div className="flex flex-col items-center gap-3 text-white/40">
      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading city visualization...</span>
    </div>
  </div>
);

export function CitySection() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <AsyncBoundary loadingFallback={CityLoadingFallback}>
        <CityScene />
      </AsyncBoundary>
      {/* Blur overlay - hidden for now
      <GradualBlur
        target="parent"
        position="bottom"
        height="25%"
        strength={2}
        divCount={10}
        curve="bezier"
        exponential={false}
        opacity={0.8}
      />
      */}
      <LoadingLegend />
    </div>
  );
}
