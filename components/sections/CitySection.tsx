'use client';

import { useLayerAnimation } from '@/hooks/useLayerAnimation';
import dynamic from 'next/dynamic';

const CityScene = dynamic(() => import('@/components/CityScene'), {
  ssr: false,
});

export function CitySection() {
  const { layers } = useLayerAnimation({
    staggerDelay: 350,
    initialDelay: 300,
  });

  return (
    <div className="relative w-full h-full">
      <CityScene layers={layers} />
    </div>
  );
}
