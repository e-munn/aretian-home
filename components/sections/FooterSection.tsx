'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useSectionContext } from '@/components/navigation/FullPageScroll';

// Dynamic import to avoid SSR issues with react-globe.gl
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// Boston/Cambridge coordinates
const BOSTON = { lat: 42.3601, lng: -71.0589 };

interface CountryFeature {
  type: string;
  properties: { ADMIN: string; [key: string]: any };
  geometry: any;
}

function MiniGlobe() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [countries, setCountries] = useState<CountryFeature[]>([]);

  const globeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    });
  }, []);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((data) => setCountries(data.features))
      .catch((err) => console.error('Error loading countries:', err));
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const size = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight);
        setDimensions({ width: size, height: size });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Set up globe orientation when ready
  useEffect(() => {
    if (globeRef.current && countries.length > 0) {
      // Orbit 40 degrees from Boston to show globe from different angle
      const orbitOffset = 40;
      globeRef.current.pointOfView({ lat: BOSTON.lat, lng: BOSTON.lng - orbitOffset, altitude: 1.8 }, 0);

      const controls = globeRef.current.controls();
      controls.autoRotate = false;
      controls.enableZoom = false;
      controls.enableRotate = false;
      controls.enablePan = false;
    }
  }, [countries]);

  const pointsData = [{ lat: BOSTON.lat, lng: BOSTON.lng, size: 0.6, color: '#00C217' }];
  const ringsData = [{ lat: BOSTON.lat, lng: BOSTON.lng, maxR: 6, propagationSpeed: 2, repeatPeriod: 1500, color: '#00C217' }];

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe={true}
        globeImageUrl=""
        globeMaterial={globeMaterial}
        showAtmosphere={false}
        hexPolygonsData={countries}
        hexPolygonResolution={3}
        hexPolygonMargin={0.1}
        hexPolygonAltitude={0.01}
        hexPolygonColor={(feature: any) => {
          if (feature.properties?.ADMIN === 'United States of America') return '#1e3a5f';
          return '#1a1a2a';
        }}
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius="size"
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor={(d: any) => `${d.color}60`}
        enablePointerInteraction={false}
      />
    </div>
  );
}

export function FooterSection() {
  const { navigateToSection, activeIndex } = useSectionContext();

  // Only load heavy components when near the footer (section 7 = contact, 8 = footer)
  const shouldLoadMaps = activeIndex >= 6;

  const scrollToTop = () => {
    navigateToSection(0);
  };

  return (
    <section
      id="more"
      className="relative w-full min-h-screen bg-black flex flex-col"
    >
      {/* Back to top button - h-48 */}
      <motion.button
        onClick={scrollToTop}
        className="w-full h-48 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10"
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        whileTap={{ scale: 0.99 }}
      >
        <ChevronUp size={32} className="text-white/40" />
        <span
          className="text-white/60 text-2xl uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
        >
          Back to Top
        </span>
      </motion.button>

      {/* Main content area with maps */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8">
        {/* Headquarters label */}
        <div className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-[0.3em] mb-2">
            Headquarters
          </p>
          <h2
            className="text-white text-4xl md:text-5xl uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-bebas-neue)' }}
          >
            Cambridge, MA
          </h2>
        </div>

        {/* Globe - only load when near footer */}
        {shouldLoadMaps && (
          <div className="flex items-center justify-center">
            {/* Mini Globe */}
            <div
              style={{
                width: 'min(50vh, 50vw, 500px)',
                height: 'min(50vh, 50vw, 500px)',
              }}
            >
              <MiniGlobe />
            </div>

            {/* Transit Map (2D Boston) - commented out for now */}
            {/* <div
              style={{
                width: 'min(40vh, 40vw, 400px)',
                height: 'min(40vh, 40vw, 400px)',
              }}
            >
              <TransitMap />
            </div> */}
          </div>
        )}
      </div>

      {/* Footer - h-48 */}
      <div className="w-full h-48 flex flex-col items-center justify-center border-t border-white/10 bg-black">
        <p
          className="text-white/40 text-lg uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
        >
          Aretian Urban Analytics
        </p>
        <p className="text-white/30 text-sm mb-4">
          © {new Date().getFullYear()} Aretian. All rights reserved.
        </p>
        <div className="flex gap-6 text-white/30 text-xs">
          <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          <a href="mailto:hello@aretian.com" className="hover:text-white/60 transition-colors">hello@aretian.com</a>
        </div>
      </div>
    </section>
  );
}
