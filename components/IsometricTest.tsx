'use client';

import React, { useRef, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import * as turf from '@turf/turf';

// Configuration
const CENTER = { lat: 41.39086, lon: 2.15644 }; // Barcelona Eixample
const HALF_SIZE_KM = 0.3; // 0.6km x 0.6km area
const GRID_SIZE = 0.2; // Grid size in scene units
const SCENE_SCALE = 25; // Scale factor for converting km to scene units

// The Eixample grid is rotated ~45° from north, so we snap to a 45° rotated grid
// This means snapping in a coordinate system where the grid lines are at 45°

// Convert lat/lon to scene coordinates (no rotation - we'll handle grid alignment differently)
function projectToScene(lon: number, lat: number): [number, number] {
  const x = (lon - CENTER.lon) * 111000 * Math.cos(CENTER.lat * Math.PI / 180);
  const z = (lat - CENTER.lat) * 111000;
  // Scale to scene units (meters to scene)
  return [x / 1000 * SCENE_SCALE, z / 1000 * SCENE_SCALE];
}

// Snap to a 45° rotated grid (aligned with Barcelona's Eixample)
// The grid lines run at 45° angles (NE-SW and NW-SE)
const GRID_ANGLE = 45 * (Math.PI / 180);

function snapToRotatedGrid(x: number, z: number, gridSize: number): [number, number] {
  // Rotate point by -45° to align with grid
  const cos = Math.cos(-GRID_ANGLE);
  const sin = Math.sin(-GRID_ANGLE);
  const rotX = x * cos - z * sin;
  const rotZ = x * sin + z * cos;

  // Snap in rotated space
  const snappedRotX = Math.round(rotX / gridSize) * gridSize;
  const snappedRotZ = Math.round(rotZ / gridSize) * gridSize;

  // Rotate back by +45°
  const finalX = snappedRotX * cos + snappedRotZ * sin;
  const finalZ = -snappedRotX * sin + snappedRotZ * cos;

  return [finalX, finalZ];
}

// Snap a path to 45° rotated grid
function snapPathToGrid(path: [number, number][], gridSize: number): [number, number][] {
  if (path.length < 2) return path;

  const result: [number, number][] = [];

  for (let i = 0; i < path.length; i++) {
    const snapped = snapToRotatedGrid(path[i][0], path[i][1], gridSize);

    // Skip if same as previous point (with small tolerance)
    if (i > 0) {
      const prev = result[result.length - 1];
      const dist = Math.sqrt(Math.pow(snapped[0] - prev[0], 2) + Math.pow(snapped[1] - prev[1], 2));
      if (dist < gridSize * 0.1) continue;
    }

    result.push(snapped);
  }

  return result;
}

// Fetch OSM road data - only major roads for now
async function fetchOSMRoads() {
  const LAT_OFFSET = HALF_SIZE_KM / 111;
  const LON_OFFSET = HALF_SIZE_KM / (111 * Math.cos(CENTER.lat * Math.PI / 180));
  const BBOX = `${CENTER.lat - LAT_OFFSET},${CENTER.lon - LON_OFFSET},${CENTER.lat + LAT_OFFSET},${CENTER.lon + LON_OFFSET}`;

  // Only fetch primary and secondary roads for cleaner visualization
  const query = `
    [out:json][timeout:30];
    (
      way["highway"~"^(primary|secondary|tertiary)$"](${BBOX});
    );
    out body;
    >;
    out skel qt;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Failed to fetch OSM data');
  return response.json();
}

// Road data with both original and snapped paths for debugging
interface RoadData {
  originalPath: [number, number][];
  snappedPath: [number, number][];
  type: string;
  width: number;
}

// Parse OSM data into road paths
function parseOSMRoads(data: any): RoadData[] {
  const nodes: Record<number, { lon: number; lat: number }> = {};
  const roads: RoadData[] = [];

  // Index nodes
  for (const el of data.elements) {
    if (el.type === 'node') {
      nodes[el.id] = { lon: el.lon, lat: el.lat };
    }
  }

  // Road width by type (in scene units)
  const roadWidths: Record<string, number> = {
    primary: 0.3,
    secondary: 0.25,
    tertiary: 0.2,
  };

  // Process ways
  for (const el of data.elements) {
    if (el.type !== 'way' || !el.nodes || !el.tags?.highway) continue;

    const coords = el.nodes
      .map((id: number) => nodes[id])
      .filter(Boolean)
      .map((n: { lon: number; lat: number }) => projectToScene(n.lon, n.lat));

    if (coords.length < 2) continue;

    // Original path (no snapping)
    const originalPath = coords as [number, number][];

    // Snap to grid (creates orthogonal paths)
    const snappedPath = snapPathToGrid(originalPath, GRID_SIZE);

    if (snappedPath.length >= 2) {
      roads.push({
        originalPath,
        snappedPath,
        type: el.tags.highway,
        width: roadWidths[el.tags.highway] || 0.2,
      });
    }
  }

  return roads;
}

// Merge connected road segments that are collinear
function mergeCollinearSegments(roads: { path: [number, number][]; type: string; width: number }[]) {
  // For now, just return as-is. Could implement segment merging later.
  return roads;
}

// Dot grid floor - visual grid (sparser than road grid for performance)
function DotFloor({ gridExtent = 40, dotSpacing = 0.5 }: { gridExtent?: number; dotSpacing?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const gridPoints = Math.floor(gridExtent / dotSpacing) * 2 + 1;
  const count = gridPoints * gridPoints;

  useLayoutEffect(() => {
    if (!ref.current) return;
    const transform = new THREE.Matrix4();
    let idx = 0;

    const halfExtent = Math.floor(gridExtent / dotSpacing);
    for (let i = -halfExtent; i <= halfExtent; i++) {
      for (let j = -halfExtent; j <= halfExtent; j++) {
        transform.setPosition(i * dotSpacing, 0, j * dotSpacing);
        ref.current.setMatrixAt(idx++, transform);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [gridExtent, dotSpacing]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} position={[0, -0.01, 0]}>
      <circleGeometry args={[0.02, 8]} />
      <meshBasicMaterial color="#222244" />
    </instancedMesh>
  );
}

// Road segment rendered as extruded shape
function RoadSegment({ start, end, width = 0.4, color = '#667788' }: { start: [number, number]; end: [number, number]; width?: number; color?: string }) {
  const geometry = useMemo(() => {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const length = Math.sqrt(dx * dx + dz * dz);

    if (length < 0.01) return null;

    const angle = Math.atan2(dz, dx);

    // Create road shape
    const shape = new THREE.Shape();
    const hw = width / 2;
    shape.moveTo(-hw, 0);
    shape.lineTo(-hw, length);
    shape.lineTo(hw, length);
    shape.lineTo(hw, 0);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.05,
      bevelEnabled: false,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Rotate and position
    geo.rotateX(-Math.PI / 2);
    geo.rotateY(-angle);
    geo.translate(start[0], 0, start[1]);

    return geo;
  }, [start, end, width]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Render a complete road path
function Road({ path, width, color = '#667788' }: { path: [number, number][]; width: number; color?: string }) {
  return (
    <>
      {path.slice(0, -1).map((start, i) => (
        <RoadSegment key={i} start={start} end={path[i + 1]} width={width} color={color} />
      ))}
    </>
  );
}

// Original road path (line, not extruded) for debugging
function OriginalRoadLine({ path, color = '#ff4444' }: { path: [number, number][]; color?: string }) {
  const points = useMemo(() => {
    return path.map(([x, z]) => new THREE.Vector3(x, 0.1, z)); // Slightly elevated
  }, [path]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  );
}

// Camera setup for isometric view
function CameraSetup() {
  const { camera } = useThree();

  useLayoutEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 45;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  return null;
}

// Main scene content
function Scene({ roads, showOriginal = true }: { roads: RoadData[]; showOriginal?: boolean }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <pointLight position={[-5, 10, -5]} intensity={0.2} color="#00C217" />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#010029" />
      </mesh>

      {/* Dot grid */}
      <DotFloor gridExtent={12} dotSpacing={0.4} />

      {/* Original roads (red lines for debugging) */}
      {showOriginal && roads.map((road, i) => (
        <OriginalRoadLine key={`orig-${i}`} path={road.originalPath} color="#ff4444" />
      ))}

      {/* Snapped roads (gray extruded) */}
      {roads.map((road, i) => (
        <Road key={`snap-${i}`} path={road.snappedPath} width={road.width} color="#556677" />
      ))}

      {/* Camera setup */}
      <CameraSetup />

      {/* Controls - pan only, no rotation */}
      <OrbitControls
        enableRotate={false}
        enableZoom={true}
        enablePan={true}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        minZoom={20}
        maxZoom={120}
      />
    </>
  );
}

export default function IsometricTest() {
  const [roads, setRoads] = useState<RoadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOSMRoads()
      .then((data) => {
        const parsedRoads = parseOSMRoads(data);
        setRoads(parsedRoads);
        setLoading(false);
        console.log(`Loaded ${parsedRoads.length} roads`);
      })
      .catch((err) => {
        console.error('OSM fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      <Canvas
        orthographic
        camera={{
          position: [20, 20, 20],
          zoom: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true }}
        style={{ background: '#010029' }}
      >
        <Scene roads={roads} />
      </Canvas>

      {/* Loading indicator */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#00C217', opacity: 0.7, fontSize: 12 }}>
        {loading ? 'Loading OSM roads...' : error ? `Error: ${error}` : `${roads.length} roads loaded (grid-snapped)`}
      </div>
    </div>
  );
}
