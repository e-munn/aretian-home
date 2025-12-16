'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Barcelona Eixample center
const CENTER = { lat: 41.39086, lon: 2.15644 };
const HALF_SIZE_KM = 0.4; // 0.8km x 0.8km area

// Eixample grid angle (45 degrees from north)
const GRID_ANGLE = 44.9 * (Math.PI / 180);
const GRID_SPACING = 10; // meters between dots

// Douglas-Peucker line simplification
function simplifyPath(
  path: [number, number, number][],
  tolerance: number
): [number, number, number][] {
  if (path.length < 3) return path;

  // Find point with max distance from line between first and last
  let maxDist = 0;
  let maxIdx = 0;

  const [x1, y1] = path[0];
  const [x2, y2] = path[path.length - 1];
  const lineLenSq = (x2 - x1) ** 2 + (y2 - y1) ** 2;

  for (let i = 1; i < path.length - 1; i++) {
    const [px, py] = path[i];
    let dist: number;

    if (lineLenSq === 0) {
      dist = Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    } else {
      const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLenSq));
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      dist = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
    }

    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(path.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(path.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [path[0], path[path.length - 1]];
}

// Snap a point to the rotated grid
function snapToGrid(x: number, y: number, spacing: number, angle: number): [number, number, number] {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);

  // Rotate to grid space
  const gx = x * cos - y * sin;
  const gy = x * sin + y * cos;

  // Snap to grid
  const sx = Math.round(gx / spacing) * spacing;
  const sy = Math.round(gy / spacing) * spacing;

  // Rotate back to world space
  const cosBack = Math.cos(angle);
  const sinBack = Math.sin(angle);
  const wx = sx * cosBack - sy * sinBack;
  const wy = sx * sinBack + sy * cosBack;

  return [wx, wy, 0];
}

// Snap a single segment to grid
function snapSegmentToGrid(
  start: [number, number, number],
  end: [number, number, number],
  spacing: number,
  angle: number
): [number, number, number][] {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const cosBack = Math.cos(angle);
  const sinBack = Math.sin(angle);

  const toGridFloat = (x: number, y: number) => {
    const gx = x * cos - y * sin;
    const gy = x * sin + y * cos;
    return [gx / spacing, gy / spacing];
  };

  const toWorld = (gx: number, gy: number): [number, number, number] => {
    const wx = gx * spacing;
    const wy = gy * spacing;
    return [
      wx * cosBack - wy * sinBack,
      wx * sinBack + wy * cosBack,
      0
    ];
  };

  const [startGx, startGy] = toGridFloat(start[0], start[1]);
  const [endGx, endGy] = toGridFloat(end[0], end[1]);

  const totalDx = endGx - startGx;
  const totalDy = endGy - startGy;
  const absDx = Math.abs(totalDx);
  const absDy = Math.abs(totalDy);

  // More aggressive thresholds for straightness
  const ratio = absDx > 0.001 ? absDy / absDx : 1000;
  let dominantDir: 'h' | 'v' | 'd';
  if (ratio < 0.2) {
    dominantDir = 'h';
  } else if (ratio > 5) {
    dominantDir = 'v';
  } else {
    dominantDir = 'd';
  }

  const result: [number, number, number][] = [];
  let cx = Math.round(startGx);
  let cy = Math.round(startGy);
  result.push(toWorld(cx, cy));

  const targetX = Math.round(endGx);
  const targetY = Math.round(endGy);

  while (cx !== targetX || cy !== targetY) {
    const dx = targetX - cx;
    const dy = targetY - cy;

    if (dominantDir === 'h') {
      if (dx !== 0) {
        cx += Math.sign(dx);
        const idealY = startGy + (totalDy / totalDx) * (cx - startGx);
        if (Math.abs(cy - idealY) > 0.8) {
          cy += Math.sign(idealY - cy);
        }
      } else if (dy !== 0) {
        cy += Math.sign(dy);
      }
    } else if (dominantDir === 'v') {
      if (dy !== 0) {
        cy += Math.sign(dy);
        const idealX = startGx + (totalDx / totalDy) * (cy - startGy);
        if (Math.abs(cx - idealX) > 0.8) {
          cx += Math.sign(idealX - cx);
        }
      } else if (dx !== 0) {
        cx += Math.sign(dx);
      }
    } else {
      if (dx !== 0 && dy !== 0) {
        cx += Math.sign(dx);
        cy += Math.sign(dy);
      } else if (dx !== 0) {
        cx += Math.sign(dx);
      } else if (dy !== 0) {
        cy += Math.sign(dy);
      }
    }

    result.push(toWorld(cx, cy));
  }

  return result;
}

// Snap a road path to grid with simplification first
function snapRoadToGrid(
  path: [number, number, number][],
  spacing: number,
  angle: number
): [number, number, number][] {
  if (path.length < 2) return path;

  // Simplify path minimally (tolerance = 0.25x grid spacing)
  const simplified = simplifyPath(path, spacing * 0.25);

  // Process each segment independently
  const result: [number, number, number][] = [];

  for (let i = 0; i < simplified.length - 1; i++) {
    const segmentPoints = snapSegmentToGrid(simplified[i], simplified[i + 1], spacing, angle);

    // Add points, avoiding duplicates at segment boundaries
    if (i === 0) {
      result.push(...segmentPoints);
    } else {
      result.push(...segmentPoints.slice(1));
    }
  }

  return result;
}

// Deduplicate sidewalks from primary roads - shift entire sidewalk if it overlaps
function deduplicateRoads(
  roads: { path: [number, number, number][]; type: string; width: number }[],
  spacing: number,
  angle: number
): { path: [number, number, number][]; type: string; width: number }[] {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const cosBack = Math.cos(angle);
  const sinBack = Math.sin(angle);

  // Convert world coord to grid key
  const toGridKey = (x: number, y: number): string => {
    const gx = x * cos - y * sin;
    const gy = x * sin + y * cos;
    return `${Math.round(gx / spacing)},${Math.round(gy / spacing)}`;
  };

  // First pass: collect all grid points used by primary/secondary/tertiary roads
  const primaryPoints = new Set<string>();
  const primaryRoads = roads.filter(r =>
    r.type === 'primary' || r.type === 'secondary' || r.type === 'tertiary'
  );

  for (const road of primaryRoads) {
    for (const [x, y] of road.path) {
      primaryPoints.add(toGridKey(x, y));
    }
  }

  // Second pass: for non-primary roads, check overlap and shift ENTIRE path
  return roads.map(road => {
    if (road.type === 'primary' || road.type === 'secondary' || road.type === 'tertiary') {
      return road; // Keep primary roads as-is
    }

    // Count how many points overlap with primary roads
    let overlapCount = 0;
    for (const [x, y] of road.path) {
      if (primaryPoints.has(toGridKey(x, y))) {
        overlapCount++;
      }
    }

    // If significant overlap (>30% of points), shift entire path
    if (overlapCount > road.path.length * 0.3) {
      // Determine road direction to shift perpendicular
      const start = road.path[0];
      const end = road.path[road.path.length - 1];
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];

      // Perpendicular direction (rotate 90°)
      const len = Math.sqrt(dx * dx + dy * dy);
      const perpX = -dy / len;
      const perpY = dx / len;

      // Try shifting by 1 grid cell perpendicular to road direction
      const shifts = [1, -1, 2, -2];

      for (const shift of shifts) {
        const offsetX = perpX * spacing * shift;
        const offsetY = perpY * spacing * shift;

        // Check if shifted path is clear
        let isClear = true;
        for (const [x, y] of road.path) {
          const newKey = toGridKey(x + offsetX, y + offsetY);
          if (primaryPoints.has(newKey)) {
            isClear = false;
            break;
          }
        }

        if (isClear) {
          // Apply shift to entire path
          const newPath = road.path.map(([x, y, z]): [number, number, number] => [
            x + offsetX,
            y + offsetY,
            z
          ]);
          return { ...road, path: newPath };
        }
      }
    }

    return road;
  });
}

// Generate rotated dot grid
function generateDotGrid(extent: number, spacing: number, angle: number) {
  const dots: [number, number, number][] = [];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const gridExtent = extent * 1.5;
  for (let x = -gridExtent; x <= gridExtent; x += spacing) {
    for (let y = -gridExtent; y <= gridExtent; y += spacing) {
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;

      if (Math.abs(rx) <= extent && Math.abs(ry) <= extent) {
        dots.push([rx, ry, 0]);
      }
    }
  }
  return dots;
}

// Bounding box
const LAT_OFFSET = HALF_SIZE_KM / 111;
const LON_OFFSET = HALF_SIZE_KM / (111 * Math.cos(CENTER.lat * Math.PI / 180));
const BBOX = `${CENTER.lat - LAT_OFFSET},${CENTER.lon - LON_OFFSET},${CENTER.lat + LAT_OFFSET},${CENTER.lon + LON_OFFSET}`;

function project(lon: number, lat: number, decimals: number = 7): [number, number, number] {
  // Round to specified decimal places before projecting
  const factor = Math.pow(10, decimals);
  const roundedLon = Math.round(lon * factor) / factor;
  const roundedLat = Math.round(lat * factor) / factor;
  const x = (roundedLon - CENTER.lon) * 111000 * Math.cos(CENTER.lat * Math.PI / 180);
  const y = (roundedLat - CENTER.lat) * 111000;
  return [x, y, 0];
}

// Fetch OSM road data
async function fetchOSMData() {
  const query = `
    [out:json][timeout:30];
    (
      way["highway"~"^(primary|secondary|tertiary|residential|living_street|pedestrian|service|footway)$"](${BBOX});
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

// Raw road data with lat/lon coordinates
type RawRoad = { rawPath: { lon: number; lat: number }[]; type: string; width: number };

// Parse roads from OSM data (store raw lat/lon)
function parseRoadsRaw(data: any): RawRoad[] {
  const nodes: Record<number, { lon: number; lat: number }> = {};
  const roads: RawRoad[] = [];

  for (const el of data.elements) {
    if (el.type === 'node') {
      nodes[el.id] = { lon: el.lon, lat: el.lat };
    }
  }

  const widths: Record<string, number> = {
    primary: 12,
    secondary: 10,
    tertiary: 8,
    residential: 6,
    living_street: 5,
    pedestrian: 4,
    service: 4,
    footway: 2,
  };

  for (const el of data.elements) {
    if (el.type !== 'way' || !el.nodes || !el.tags?.highway) continue;

    const rawPath = el.nodes
      .map((id: number) => nodes[id])
      .filter(Boolean);

    if (rawPath.length >= 2) {
      roads.push({
        rawPath,
        type: el.tags.highway,
        width: widths[el.tags.highway] || 5,
      });
    }
  }

  return roads;
}

// Project raw roads with given precision
function projectRoads(rawRoads: RawRoad[], decimals: number) {
  return rawRoads.map(road => ({
    path: road.rawPath.map(n => project(n.lon, n.lat, decimals)),
    type: road.type,
    width: road.width,
  }));
}

// Dot grid using instanced mesh
function DotGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dots = useMemo(() => generateDotGrid(500, GRID_SPACING, GRID_ANGLE), []);

  useEffect(() => {
    if (!meshRef.current) return;
    const tempObject = new THREE.Object3D();
    dots.forEach((pos, i) => {
      tempObject.position.set(pos[0], pos[1], pos[2]);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dots]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, dots.length]}>
      <circleGeometry args={[0.8, 6]} />
      <meshBasicMaterial color="#ff8800" />
    </instancedMesh>
  );
}

// Original road component (faded)
function Roads({ roads }: { roads: { path: [number, number, number][]; type: string; width: number }[] }) {
  return (
    <group>
      {roads.map((road, i) => (
        <Line
          key={i}
          points={road.path}
          color={new THREE.Color(80 / 255, 90 / 255, 100 / 255)}
          transparent
          opacity={0.4}
          lineWidth={road.width * 0.5}
        />
      ))}
    </group>
  );
}

// Snapped road component (grid-aligned)
function SnappedRoads({ roads }: { roads: { path: [number, number, number][]; type: string; width: number }[] }) {
  const snappedRoads = useMemo(() => {
    // First snap all roads to grid
    const snapped = roads.map(road => ({
      ...road,
      path: snapRoadToGrid(road.path, GRID_SPACING, GRID_ANGLE)
    }));
    // Then deduplicate - shift sidewalks off primary road paths
    return deduplicateRoads(snapped, GRID_SPACING, GRID_ANGLE);
  }, [roads]);

  return (
    <group>
      {snappedRoads.map((road, i) => (
        <Line
          key={i}
          points={road.path}
          color="#00ff88"
          lineWidth={road.width * 0.3}
        />
      ))}
    </group>
  );
}

// Flow particles using InstancedMesh
function FlowParticles({ roads }: { roads: { path: [number, number, number][]; type: string; width: number }[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  const particleRoads = useMemo(() => roads.slice(0, 40), [roads]);
  const particleCount = particleRoads.length * 2;

  const pathData = useMemo(() => {
    return particleRoads.map((road, ri) => {
      const path = road.path;
      let totalLen = 0;
      const segLengths: number[] = [];

      for (let i = 1; i < path.length; i++) {
        const segLen = Math.sqrt(
          Math.pow(path[i][0] - path[i - 1][0], 2) +
          Math.pow(path[i][1] - path[i - 1][1], 2)
        );
        segLengths.push(segLen);
        totalLen += segLen;
      }

      return { path, totalLen, segLengths, offsets: [(ri * 37) % 500, (ri * 37 + 167) % 500] };
    });
  }, [particleRoads]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = (clock.getElapsedTime() * 100) % 500;
    let idx = 0;

    for (const { path, totalLen, segLengths, offsets } of pathData) {
      if (path.length < 2) continue;

      for (const offset of offsets) {
        const progress = ((time + offset) % 500) / 500;
        let targetDist = progress * totalLen;
        let pos: [number, number, number] = path[0];

        for (let i = 0; i < segLengths.length; i++) {
          if (targetDist <= segLengths[i]) {
            const t = targetDist / segLengths[i];
            pos = [
              path[i][0] + (path[i + 1][0] - path[i][0]) * t,
              path[i][1] + (path[i + 1][1] - path[i][1]) * t,
              0.1,
            ];
            break;
          }
          targetDist -= segLengths[i];
          pos = [path[i + 1][0], path[i + 1][1], 0.1];
        }

        tempObject.position.set(pos[0], pos[1], pos[2]);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(idx, tempObject.matrix);
        idx++;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <circleGeometry args={[4, 16]} />
      <meshBasicMaterial color={new THREE.Color(0 / 255, 194 / 255, 23 / 255)} transparent opacity={0.47} />
    </instancedMesh>
  );
}

// Scene content
function Scene({
  roads,
  showGrid,
  showOriginalRoads,
  showSnappedRoads,
  showParticles,
}: {
  roads: { path: [number, number, number][]; type: string; width: number }[];
  showGrid: boolean;
  showOriginalRoads: boolean;
  showSnappedRoads: boolean;
  showParticles: boolean;
}) {
  return (
    <>
      {showGrid && <DotGrid />}
      {showOriginalRoads && <Roads roads={roads} />}
      {showSnappedRoads && <SnappedRoads roads={roads} />}
      {showParticles && <FlowParticles roads={roads} />}
      <OrbitControls enableRotate={false} />
    </>
  );
}

export default function CityScene() {
  const [rawRoads, setRawRoads] = useState<RawRoad[]>([]);
  const [loading, setLoading] = useState(true);

  // Layer visibility toggles
  const [showGrid, setShowGrid] = useState(true);
  const [showOriginalRoads, setShowOriginalRoads] = useState(false);
  const [showSnappedRoads, setShowSnappedRoads] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [precision, setPrecision] = useState(6); // decimal places

  // Project roads with current precision
  const roads = useMemo(() => {
    return projectRoads(rawRoads, precision);
  }, [rawRoads, precision]);

  useEffect(() => {
    fetchOSMData()
      .then((data) => {
        const parsedRoads = parseRoadsRaw(data);
        setRawRoads(parsedRoads);
        setLoading(false);
        console.log(`Loaded ${parsedRoads.length} roads`);

        // Analyze primary road angles
        const primaryRoads = parsedRoads.filter(r =>
          r.type === 'primary' || r.type === 'secondary'
        );

        const angles: number[] = [];
        for (const road of primaryRoads) {
          const rawPath = road.rawPath;
          if (rawPath.length < 2) continue;

          // Project for analysis
          const path = rawPath.map(n => project(n.lon, n.lat, 7));

          // Calculate angle for each segment
          for (let i = 1; i < path.length; i++) {
            const dx = path[i][0] - path[i-1][0];
            const dy = path[i][1] - path[i-1][1];
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len < 10) continue; // Skip very short segments

            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            // Normalize to 0-90 range (we only care about orientation, not direction)
            while (angle < 0) angle += 180;
            while (angle >= 90) angle -= 90;
            // Convert to 45-centered (Eixample is ~45°)
            if (angle < 22.5) angle += 90;
            if (angle > 67.5) angle -= 90;

            angles.push(angle);
          }
        }

        if (angles.length > 0) {
          // Weight by segment length would be better, but this gives a quick estimate
          const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
          const sortedAngles = [...angles].sort((a, b) => a - b);
          const medianAngle = sortedAngles[Math.floor(sortedAngles.length / 2)];

          console.log(`Primary road angle analysis:`);
          console.log(`  Segments analyzed: ${angles.length}`);
          console.log(`  Average angle: ${avgAngle.toFixed(2)}°`);
          console.log(`  Median angle: ${medianAngle.toFixed(2)}°`);
          console.log(`  Min: ${Math.min(...angles).toFixed(2)}°, Max: ${Math.max(...angles).toFixed(2)}°`);
        }
      })
      .catch((err) => {
        console.error('OSM fetch error:', err);
        setLoading(false);
      });
  }, []);

  const buttonStyle = (active: boolean) => ({
    padding: '6px 12px',
    fontSize: 11,
    background: active ? 'rgba(0, 194, 23, 0.3)' : 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${active ? '#00C217' : 'rgba(255, 255, 255, 0.2)'}`,
    borderRadius: 4,
    color: active ? '#00C217' : 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
  });

  return (
    <>
      {/* Canvas background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Canvas
          orthographic
          camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 1000 }}
          style={{ background: '#010029' }}
        >
          {roads.length > 0 && (
            <Scene
              roads={roads}
              showGrid={showGrid}
              showOriginalRoads={showOriginalRoads}
              showSnappedRoads={showSnappedRoads}
              showParticles={showParticles}
            />
          )}
        </Canvas>
      </div>

      {/* Layer toggles */}
      <div style={{ position: 'fixed', top: 20, left: 20, display: 'flex', gap: 8, zIndex: 50 }}>
        <button style={buttonStyle(showGrid)} onClick={() => setShowGrid(!showGrid)}>
          Grid
        </button>
        <button style={buttonStyle(showOriginalRoads)} onClick={() => setShowOriginalRoads(!showOriginalRoads)}>
          Original
        </button>
        <button style={buttonStyle(showSnappedRoads)} onClick={() => setShowSnappedRoads(!showSnappedRoads)}>
          Snapped
        </button>
        <button style={buttonStyle(showParticles)} onClick={() => setShowParticles(!showParticles)}>
          Particles
        </button>
      </div>

      {/* Precision control */}
      <div style={{ position: 'fixed', top: 60, left: 20, display: 'flex', gap: 8, alignItems: 'center', zIndex: 50 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Precision:</span>
        {[4, 5, 6, 7].map(p => (
          <button
            key={p}
            style={buttonStyle(precision === p)}
            onClick={() => setPrecision(p)}
          >
            {p}
          </button>
        ))}
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginLeft: 4 }}>
          (~{precision === 4 ? '11m' : precision === 5 ? '1.1m' : precision === 6 ? '11cm' : '1cm'})
        </span>
      </div>

      <div style={{ position: 'fixed', bottom: 20, left: 20, color: '#00C217', opacity: 0.5, fontSize: 12, zIndex: 50 }}>
        {loading ? 'Loading...' : `${roads.length} roads`}
      </div>
    </>
  );
}
