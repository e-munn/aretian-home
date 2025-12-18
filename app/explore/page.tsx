'use client';

import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamically import CityScene to avoid SSR issues with Three.js
const CityScene = dynamic(() => import('@/components/CityScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0f0f1a]">
      <div className="text-white/50">Loading city...</div>
    </div>
  ),
});

export default function ExplorePage() {
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[#0f0f1a]">
      {/* Full screen city scene with large radius */}
      <CityScene sizeMode="large" />

      {/* Back button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </Link>

      {/* Title */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <h1
          className="text-2xl text-white/80 uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
        >
          Barcelona City Explorer
        </h1>
      </div>
    </div>
  );
}
