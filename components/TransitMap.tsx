'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { CityConfig, CITIES } from '@/lib/cities';
import * as THREE from 'three';

// Animation config
const DROP_HEIGHT = 150;
const ANIMATION_DURATION = 0.5; // seconds
const STAGGER_DELAY = 0.003; // seconds between each point

// Ease out back for bounce effect
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Transit stop data
interface TransitStop {
  lat: number;
  lon: number;
  type: string;
  name: string;
  trips: number;
}

function project(lon: number, lat: number, center: { lat: number; lon: number }): [number, number] {
  const x = (lon - center.lon) * 111000 * Math.cos(center.lat * Math.PI / 180);
  const y = (lat - center.lat) * 111000;
  return [x, y];
}

// Load roads for a city
async function fetchRoads(config: CityConfig) {
  const response = await fetch(config.roadsDataPath);
  if (!response.ok) return [];
  const data = await response.json();

  const nodes: Record<number, { lon: number; lat: number }> = {};
  const roads: [number, number][][] = [];

  for (const el of data.elements) {
    if (el.type === 'node') nodes[el.id] = { lon: el.lon, lat: el.lat };
  }

  for (const el of data.elements) {
    if (el.type !== 'way' || !el.nodes || !el.tags?.highway) continue;
    // Filter by road type
    if (!config.roadTypes.includes(el.tags.highway)) continue;
    const path = el.nodes
      .map((id: number) => nodes[id])
      .filter(Boolean)
      .map((n: { lon: number; lat: number }) => project(n.lon, n.lat, config.center));
    if (path.length >= 2) roads.push(path);
  }

  return roads;
}

// Load transit stops
async function fetchTransitStops(config: CityConfig): Promise<TransitStop[]> {
  const response = await fetch(config.transitDataPath);
  if (!response.ok) return [];
  return response.json();
}

// Reference roads layer
function RoadsLayer({ roads }: { roads: [number, number][][] }) {
  return (
    <group>
      {roads.map((path, i) => (
        <Line
          key={i}
          points={path.map(p => [p[0], p[1], 0] as [number, number, number])}
          color="#4a4a5a"
          lineWidth={2.5}
        />
      ))}
    </group>
  );
}

// Animated pulsating point
function AnimatedPoint({
  x,
  y,
  radius,
  intensity,
  color,
  glowColor,
  pulseSpeed,
  staggerIndex,
  animationStartTime,
}: {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color: string;
  glowColor: string;
  pulseSpeed: number;
  staggerIndex: number;
  animationStartTime: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const mainRef = useRef<THREE.Mesh>(null);
  const animationComplete = useRef(false);

  useFrame(({ clock }) => {
    if (!groupRef.current || !glowRef.current || !mainRef.current) return;

    const elapsed = clock.elapsedTime - animationStartTime;
    const delay = staggerIndex * STAGGER_DELAY;
    const localTime = Math.max(0, elapsed - delay);
    const dropProgress = Math.min(1, localTime / ANIMATION_DURATION);

    if (dropProgress < 1) {
      // Drop animation
      const eased = easeOutBack(dropProgress);
      const zOffset = DROP_HEIGHT * (1 - eased);
      groupRef.current.position.z = zOffset;

      // Fade in during drop
      const opacity = dropProgress;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.15 * opacity;
      (mainRef.current.material as THREE.MeshBasicMaterial).opacity = (0.4 + intensity * 0.4) * opacity;
    } else {
      // Animation complete - start pulsing
      groupRef.current.position.z = 0;

      if (!animationComplete.current) {
        animationComplete.current = true;
      }

      // Pulsating effect
      const pulseTime = (localTime - ANIMATION_DURATION) * pulseSpeed;
      const pulse = 0.85 + Math.sin(pulseTime) * 0.15;
      const glowPulse = 0.7 + Math.sin(pulseTime + Math.PI / 4) * 0.3;

      // Scale pulse
      mainRef.current.scale.setScalar(pulse);
      glowRef.current.scale.setScalar(glowPulse);

      // Opacity pulse
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.15 * glowPulse;
    }
  });

  return (
    <group ref={groupRef} position={[x, y, DROP_HEIGHT]}>
      {intensity > 0.3 && (
        <mesh ref={glowRef} position={[0, 0, 0.5]}>
          <circleGeometry args={[radius * 1.5, 24]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0} />
        </mesh>
      )}
      <mesh ref={mainRef} position={[0, 0, 1]}>
        <circleGeometry args={[radius, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
      <mesh position={[0, 0, 2]}>
        <circleGeometry args={[3, 12]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>
    </group>
  );
}

// Animated metro point with ring
function AnimatedMetroPoint({
  x,
  y,
  radius,
  intensity,
  staggerIndex,
  animationStartTime,
}: {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  staggerIndex: number;
  animationStartTime: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const animationComplete = useRef(false);

  useFrame(({ clock }) => {
    if (!groupRef.current || !outerRef.current || !ringRef.current || !innerRef.current) return;

    const elapsed = clock.elapsedTime - animationStartTime;
    const delay = staggerIndex * STAGGER_DELAY;
    const localTime = Math.max(0, elapsed - delay);
    const dropProgress = Math.min(1, localTime / ANIMATION_DURATION);

    if (dropProgress < 1) {
      // Drop animation
      const eased = easeOutBack(dropProgress);
      const zOffset = DROP_HEIGHT * (1 - eased);
      groupRef.current.position.z = zOffset;

      // Fade in during drop
      const opacity = dropProgress;
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = (0.1 + intensity * 0.1) * opacity;
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (0.3 + intensity * 0.3) * opacity;
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity = (0.7 + intensity * 0.3) * opacity;
    } else {
      // Animation complete - start pulsing
      groupRef.current.position.z = 0;

      if (!animationComplete.current) {
        animationComplete.current = true;
      }

      // Pulsating effect - slightly different speeds for each layer
      const pulseTime = (localTime - ANIMATION_DURATION) * 2.5;
      const outerPulse = 0.9 + Math.sin(pulseTime * 0.8) * 0.1;
      const ringPulse = 0.85 + Math.sin(pulseTime + Math.PI / 3) * 0.15;
      const innerPulse = 0.9 + Math.sin(pulseTime * 1.2) * 0.1;

      outerRef.current.scale.setScalar(outerPulse);
      ringRef.current.scale.setScalar(ringPulse);
      innerRef.current.scale.setScalar(innerPulse);

      // Opacity pulse
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = (0.1 + intensity * 0.1) * outerPulse;
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (0.3 + intensity * 0.3) * ringPulse;
    }
  });

  return (
    <group ref={groupRef} position={[x, y, DROP_HEIGHT]}>
      <mesh ref={outerRef} position={[0, 0, 0.3]}>
        <circleGeometry args={[radius * 2, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.6]}>
        <ringGeometry args={[radius * 0.7, radius, 32]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0} />
      </mesh>
      <mesh ref={innerRef} position={[0, 0, 1.5]}>
        <circleGeometry args={[radius * 0.5, 24]} />
        <meshBasicMaterial color="#ea580c" transparent opacity={0} />
      </mesh>
      <mesh position={[0, 0, 2.5]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#fff7ed" />
      </mesh>
    </group>
  );
}

// Transit stops visualization with animations
function TransitLayer({
  stops,
  maxTrips,
  center
}: {
  stops: TransitStop[];
  maxTrips: number;
  center: { lat: number; lon: number };
}) {
  const startTimeRef = useRef<number | null>(null);
  const [startTime, setStartTime] = useState(0);

  // Sort stops by distance from center for radial animation
  const sortedBusStops = useMemo(() => {
    const busStops = stops.filter(s => s.type === 'bus');
    return busStops
      .map((stop, originalIndex) => {
        const [x, y] = project(stop.lon, stop.lat, center);
        const dist = Math.sqrt(x * x + y * y);
        return { stop, x, y, dist, originalIndex };
      })
      .sort((a, b) => a.dist - b.dist);
  }, [stops, center]);

  const sortedMetroStops = useMemo(() => {
    const metroStops = stops.filter(s => s.type === 'metro' || s.type === 'rail');
    return metroStops
      .map((stop, originalIndex) => {
        const [x, y] = project(stop.lon, stop.lat, center);
        const dist = Math.sqrt(x * x + y * y);
        return { stop, x, y, dist, originalIndex };
      })
      .sort((a, b) => a.dist - b.dist);
  }, [stops, center]);

  const getIntensity = (trips: number) => Math.min(1, trips / maxTrips);
  const getRadius = (trips: number) => 8 + getIntensity(trips) * 40;

  // Capture start time on first frame
  useFrame(({ clock }) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = clock.elapsedTime;
      setStartTime(clock.elapsedTime);
    }
  });

  return (
    <group>
      {/* Bus stops */}
      {sortedBusStops.map(({ stop, x, y }, staggerIndex) => {
        const radius = getRadius(stop.trips);
        const intensity = getIntensity(stop.trips);
        const pulseSpeed = 2 + intensity * 2; // Faster pulse for busier stops

        return (
          <AnimatedPoint
            key={`bus-${staggerIndex}`}
            x={x}
            y={y}
            radius={radius}
            intensity={intensity}
            color="#3b82f6"
            glowColor="#60a5fa"
            pulseSpeed={pulseSpeed}
            staggerIndex={staggerIndex}
            animationStartTime={startTime}
          />
        );
      })}

      {/* Metro/Rail stops - start after bus stops with offset */}
      {sortedMetroStops.map(({ stop, x, y }, staggerIndex) => {
        const radius = getRadius(stop.trips) * 1.5;
        const intensity = getIntensity(stop.trips);

        return (
          <AnimatedMetroPoint
            key={`metro-${staggerIndex}`}
            x={x}
            y={y}
            radius={radius}
            intensity={intensity}
            staggerIndex={staggerIndex + sortedBusStops.length} // Offset after bus stops
            animationStartTime={startTime}
          />
        );
      })}
    </group>
  );
}

// Camera setup - responsive like CityScene
function CameraSetup({ baseZoom }: { baseZoom: number }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    const orthoCamera = camera as THREE.OrthographicCamera;

    // Base zoom scales with viewport - reference: 1920x1080
    const responsiveZoom = Math.min(size.width / 1920, size.height / 1080) * baseZoom * 2.5;
    orthoCamera.zoom = Math.max(0.15, Math.min(0.6, responsiveZoom));

    // Offset to position scene - shifts right on wider screens
    let offsetX: number;
    let offsetY: number;

    if (aspect > 1.4) {
      // Wide screen (desktop) - push scene to the right
      offsetX = 600 + (aspect - 1.4) * 150;
      offsetY = -50;
    } else if (aspect > 1) {
      // Medium width
      offsetX = 400 + (aspect - 1) * 200;
      offsetY = 0;
    } else {
      // Narrow (mobile)
      offsetX = 100;
      offsetY = 0;
    }

    camera.position.set(offsetX, offsetY, 2000);
    camera.up.set(0, 1, 0);
    camera.lookAt(offsetX, offsetY, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, baseZoom]);

  return null;
}

interface TransitMapProps {
  className?: string;
}

export default function TransitMap({ className }: TransitMapProps) {
  const [roads, setRoads] = useState<[number, number][][]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);
  const [loading, setLoading] = useState(true);

  const city = CITIES['boston'];

  // Load data when city changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRoads(city),
      fetchTransitStops(city),
    ]).then(([roadsData, stopsData]) => {
      setRoads(roadsData);
      setStops(stopsData);
      setLoading(false);
    });
  }, [city]);

  const maxTrips = useMemo(() => {
    if (stops.length === 0) return 1;
    return Math.max(...stops.map(s => s.trips));
  }, [stops]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent', overflow: 'hidden' }}>
      <Canvas
        orthographic
        camera={{ zoom: city.zoom, position: [0, 0, 2000], near: 0.1, far: 5000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraSetup baseZoom={city.zoom} />
        <group rotation={[0, 0, city.rotation]}>
          <RoadsLayer roads={roads} />
          {!loading && <TransitLayer stops={stops} maxTrips={maxTrips} center={city.center} />}
        </group>
      </Canvas>
    </div>
  );
}
