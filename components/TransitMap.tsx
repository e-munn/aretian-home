'use client';

import { useState, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { CityConfig, CITIES } from '@/lib/cities';
import * as THREE from 'three';

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

// Load water polygons
async function fetchWater(center: { lat: number; lon: number }): Promise<[number, number][][]> {
  const response = await fetch('/data/boston/water.json');
  if (!response.ok) return [];
  const data = await response.json();

  const nodes: Record<number, { lon: number; lat: number }> = {};
  const polygons: [number, number][][] = [];

  for (const el of data.elements) {
    if (el.type === 'node') nodes[el.id] = { lon: el.lon, lat: el.lat };
  }

  for (const el of data.elements) {
    if (el.type !== 'way' || !el.nodes) continue;
    const path = el.nodes
      .map((id: number) => nodes[id])
      .filter(Boolean)
      .map((n: { lon: number; lat: number }) => project(n.lon, n.lat, center));
    if (path.length >= 3) polygons.push(path);
  }

  return polygons;
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

// Water polygons layer
function WaterLayer({ polygons }: { polygons: [number, number][][] }) {
  return (
    <group>
      {polygons.map((points, i) => {
        const shape = new THREE.Shape();
        shape.moveTo(points[0][0], points[0][1]);
        for (let j = 1; j < points.length; j++) {
          shape.lineTo(points[j][0], points[j][1]);
        }
        shape.closePath();

        return (
          <mesh key={i} position={[0, 0, -1]}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial color="#1a3a5c" transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
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

// Transit stops visualization
function TransitLayer({
  stops,
  maxTrips,
  center
}: {
  stops: TransitStop[];
  maxTrips: number;
  center: { lat: number; lon: number };
}) {
  const busStops = useMemo(() => stops.filter(s => s.type === 'bus'), [stops]);
  const metroStops = useMemo(() => stops.filter(s => s.type === 'metro' || s.type === 'rail'), [stops]);

  const getIntensity = (trips: number) => Math.min(1, trips / maxTrips);
  const getRadius = (trips: number) => 8 + getIntensity(trips) * 40;

  return (
    <group>
      {/* Bus stops */}
      {busStops.map((stop, i) => {
        const [x, y] = project(stop.lon, stop.lat, center);
        const radius = getRadius(stop.trips);
        const intensity = getIntensity(stop.trips);

        return (
          <group key={`bus-${i}`}>
            {intensity > 0.3 && (
              <mesh position={[x, y, 0.5]}>
                <circleGeometry args={[radius * 1.5, 24]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={intensity * 0.15} />
              </mesh>
            )}
            <mesh position={[x, y, 1]}>
              <circleGeometry args={[radius, 24]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.4 + intensity * 0.4} />
            </mesh>
            <mesh position={[x, y, 2]}>
              <circleGeometry args={[3, 12]} />
              <meshBasicMaterial color="#60a5fa" />
            </mesh>
          </group>
        );
      })}

      {/* Metro/Rail stops */}
      {metroStops.map((stop, i) => {
        const [x, y] = project(stop.lon, stop.lat, center);
        const radius = getRadius(stop.trips) * 1.5;
        const intensity = getIntensity(stop.trips);

        return (
          <group key={`metro-${i}`}>
            <mesh position={[x, y, 0.3]}>
              <circleGeometry args={[radius * 2, 32]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.1 + intensity * 0.1} />
            </mesh>
            <mesh position={[x, y, 0.6]}>
              <ringGeometry args={[radius * 0.7, radius, 32]} />
              <meshBasicMaterial color="#fb923c" transparent opacity={0.3 + intensity * 0.3} />
            </mesh>
            <mesh position={[x, y, 1.5]}>
              <circleGeometry args={[radius * 0.5, 24]} />
              <meshBasicMaterial color="#ea580c" transparent opacity={0.7 + intensity * 0.3} />
            </mesh>
            <mesh position={[x, y, 2.5]} rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[12, 12]} />
              <meshBasicMaterial color="#fff7ed" />
            </mesh>
          </group>
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
  const [water, setWater] = useState<[number, number][][]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);
  const [loading, setLoading] = useState(true);

  const city = CITIES['boston'];

  // Load data when city changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRoads(city),
      fetchTransitStops(city),
      fetchWater(city.center)
    ]).then(([roadsData, stopsData, waterData]) => {
      setRoads(roadsData);
      setStops(stopsData);
      setWater(waterData);
      setLoading(false);
    });
  }, [city]);

  const maxTrips = useMemo(() => {
    if (stops.length === 0) return 1;
    return Math.max(...stops.map(s => s.trips));
  }, [stops]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', background: '#0f0f1a', overflow: 'hidden' }}>
      <Canvas
        orthographic
        camera={{ zoom: city.zoom, position: [0, 0, 2000], near: 0.1, far: 5000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraSetup baseZoom={city.zoom} />
        <group rotation={[0, 0, city.rotation]}>
          <WaterLayer polygons={water} />
          <RoadsLayer roads={roads} />
          {!loading && <TransitLayer stops={stops} maxTrips={maxTrips} center={city.center} />}
        </group>
      </Canvas>
    </div>
  );
}
