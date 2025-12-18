'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

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
  isVisible?: boolean;
}

interface CountryFeature {
  type: string;
  properties: {
    ADMIN: string;
    ISO_A2: string;
    ISO_A3: string;
    ISO_N3: string;
    [key: string]: any;
  };
  geometry: any;
}

// Slate colors for country hex bins
const SLATE_COLORS = [
  '#1e293b', // slate-800
  '#334155', // slate-700
  '#475569', // slate-600
] as const;

// Custom hook to load countries GeoJSON
function useCountries() {
  const [countries, setCountries] = useState<CountryFeature[]>([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((data) => setCountries(data.features))
      .catch((err) => console.error('Error loading countries:', err));
  }, []);

  return countries;
}

// Get color for a country hex
function getCountryColor(feature: CountryFeature, hoveredCountry: string | null, projectCountries: Set<string>): string {
  const countryName = feature.properties?.ADMIN;
  const iso3 = feature.properties?.ISO_A3;

  // Highlight if hovered
  if (hoveredCountry && (countryName === hoveredCountry || iso3 === hoveredCountry)) {
    return 'rgba(255, 255, 255, 0.8)';
  }

  // Highlight if has a project
  if (projectCountries.has(countryName) || projectCountries.has(iso3)) {
    return '#00C217'; // Aretian green
  }

  // Default slate variation based on country code
  const code = parseInt(feature.properties?.ISO_N3) || 0;
  return SLATE_COLORS[code % SLATE_COLORS.length];
}

// Get label HTML for country tooltip
function getCountryLabel(feature: CountryFeature): string {
  const d = feature.properties;
  return `<div style="background: rgba(15,15,26,0.9); padding: 8px 12px; border-radius: 8px; font-size: 12px;">
    <b style="color: white;">${d?.ADMIN}</b>
  </div>`;
}

export function ProjectGlobe({ projects, isVisible = false }: ProjectGlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const countries = useCountries();

  // Create semi-transparent globe material
  const globeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
    });
  }, []);

  // Create set of countries with projects
  const projectCountries = new Set<string>();
  projects.forEach((p) => {
    // Add country name from city string (e.g., "Barcelona, Spain" -> "Spain")
    const parts = p.city.split(', ');
    if (parts.length > 1) {
      projectCountries.add(parts[parts.length - 1]);
    }
  });

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

  // Initial setup
  useEffect(() => {
    if (globeRef.current && countries.length > 0) {
      // Set initial view to show Europe/Americas
      globeRef.current.pointOfView({ lat: 30, lng: -20, altitude: 2.2 }, 0);

      // Setup controls
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.3;
      globeRef.current.controls().enableZoom = false;
    }
  }, [countries]);

  // Entry animation - fast spin that slows down
  useEffect(() => {
    if (!isVisible || hasAnimated || !globeRef.current) return;

    const controls = globeRef.current.controls();
    if (!controls) return;

    // Start with fast spin
    controls.autoRotate = true;
    controls.autoRotateSpeed = 8;
    setHasAnimated(true);

    // Gradually slow down over 2 seconds
    const startTime = Date.now();
    const duration = 2000;
    const startSpeed = 8;
    const endSpeed = 0.3;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentSpeed = startSpeed + (endSpeed - startSpeed) * eased;

      controls.autoRotateSpeed = currentSpeed;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, hasAnimated]);

  const pointsData = projects.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    size: 0.6,
    color: p.color,
    project: p,
  }));

  // Disable rings - they cause spiral artifacts
  // If you want to re-enable, uncomment and adjust parameters
  const ringsData: any[] = [];
  // const ringsData = projects.map((p) => ({
  //   lat: p.lat,
  //   lng: p.lng,
  //   maxR: 3,
  //   propagationSpeed: 1,
  //   repeatPeriod: 2000,
  //   color: p.color,
  // }));

  // Arc from Boston to Barcelona
  const arcsData = [
    {
      startLat: 42.3601,
      startLng: -71.0589,
      endLat: 41.3851,
      endLng: 2.1734,
      color: '#60a5fa', // lighter blue for visibility
      altitude: 0.25,
    },
  ];

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe={true}
        globeImageUrl=""
        globeMaterial={globeMaterial}
        showAtmosphere={false}
        // Hex polygon countries
        hexPolygonsData={countries}
        hexPolygonResolution={3}
        hexPolygonMargin={0.1}
        hexPolygonUseDots={false}
        hexPolygonAltitude={0.01}
        hexPolygonColor={(feature: any) => getCountryColor(feature, hoveredCountry, projectCountries)}
        hexPolygonLabel={(feature: any) => getCountryLabel(feature)}
        onHexPolygonHover={(feature: any) => setHoveredCountry(feature?.properties?.ADMIN || null)}
        // Project markers
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius="size"
        pointsMerge={false}
        onPointHover={(point: any) => setHoveredProject(point?.project || null)}
        // Pulsing rings
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor={(d: any) => `${d.color}90`}
        // Arc from Boston to Barcelona
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude="altitude"
        arcStroke={3}
        arcDashLength={1}
        arcDashGap={0}
        arcDashAnimateTime={0}
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

    </div>
  );
}

export default ProjectGlobe;
