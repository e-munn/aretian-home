'use client';

import { LoadingLegend } from '@/components/city/LoadingLegend';
import dynamic from 'next/dynamic';

const CityScene = dynamic(() => import('@/components/CityScene'), {
  ssr: false,
});

export function CitySection() {
  return (
    <div className="relative w-full h-full">
      <CityScene />
      <LoadingLegend />
    </div>
  );
}
