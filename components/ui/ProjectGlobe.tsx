'use client';

import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  name: string;
  description: string;
  tags: string[];
  color: string;
  lat: number;
  lng: number;
  city: string;
}

interface ProjectGlobeProps {
  projects: Project[];
}

export function ProjectGlobe({ projects }: ProjectGlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Set initial view to show Europe/Americas
      globeRef.current.pointOfView({ lat: 30, lng: -20, altitude: 2.2 }, 0);

      // Auto-rotate
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.3;
      globeRef.current.controls().enableZoom = false;
    }
  }, []);

  const pointsData = projects.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    size: 0.4,
    color: p.color,
    project: p,
  }));

  const ringsData = projects.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    maxR: 3,
    propagationSpeed: 1,
    repeatPeriod: 2000,
    color: p.color,
  }));

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        showAtmosphere={true}
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.15}
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointsMerge={false}
        onPointHover={(point: any) => setHoveredProject(point?.project || null)}
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor={(d: any) => `${d.color}60`}
      />

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredProject && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-xl max-w-sm"
            style={{
              backgroundColor: 'rgba(15, 15, 26, 0.95)',
              border: `1px solid ${hoveredProject.color}40`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex gap-2 mb-2">
              {hoveredProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: hoveredProject.color, background: `${hoveredProject.color}20` }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3
              className="text-lg text-white uppercase tracking-wide mb-1"
              style={{ fontFamily: 'var(--font-bebas-neue)' }}
            >
              {hoveredProject.name}
            </h3>
            <p className="text-white/50 text-xs">{hoveredProject.city}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project count indicator */}
      <div className="absolute top-4 right-4 text-white/40 text-xs">
        {projects.length} projects worldwide
      </div>
    </div>
  );
}
