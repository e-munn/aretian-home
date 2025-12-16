'use client';

import { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { PolygonLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { OrbitView } from '@deck.gl/core';

// 41°23'27.1"N 2°09'23.2"E = 41.39086, 2.15644
const CENTER = { lat: 41.39086, lon: 2.15644 };
const HALF_SIZE_KM = 0.3; // 0.6km / 2

// Convert km to degrees
const LAT_OFFSET = HALF_SIZE_KM / 111;
const LON_OFFSET = HALF_SIZE_KM / (111 * Math.cos(CENTER.lat * Math.PI / 180));

// Bounding box: south,west,north,east
const BBOX = `${CENTER.lat - LAT_OFFSET},${CENTER.lon - LON_OFFSET},${CENTER.lat + LAT_OFFSET},${CENTER.lon + LON_OFFSET}`;

const SCALE = 500000;

// Lane width in meters (European standard)
const LANE_WIDTH = 3.5;
const PARKING_LANE_WIDTH = 2.5;
const SIDEWALK_WIDTH = 2.0;
const CYCLE_LANE_WIDTH = 1.5;

// Surface colors [R, G, B]
const SURFACE_COLORS: Record<string, number[]> = {
  asphalt: [70, 70, 75],
  concrete: [85, 85, 90],
  paved: [75, 75, 80],
  cobblestone: [100, 90, 75],
  sett: [95, 85, 70],
  paving_stones: [90, 85, 80],
  gravel: [120, 115, 100],
  dirt: [140, 120, 90],
  grass: [80, 120, 70],
  sand: [180, 170, 130],
  default: [80, 85, 90],
};

// Road hierarchy with default lanes
const ROAD_DEFAULTS: Record<string, { lanes: number; hasCenter: boolean; hasSidewalk: boolean }> = {
  motorway: { lanes: 3, hasCenter: true, hasSidewalk: false },
  motorway_link: { lanes: 1, hasCenter: false, hasSidewalk: false },
  trunk: { lanes: 2, hasCenter: true, hasSidewalk: false },
  trunk_link: { lanes: 1, hasCenter: false, hasSidewalk: false },
  primary: { lanes: 2, hasCenter: true, hasSidewalk: true },
  primary_link: { lanes: 1, hasCenter: false, hasSidewalk: true },
  secondary: { lanes: 2, hasCenter: true, hasSidewalk: true },
  secondary_link: { lanes: 1, hasCenter: false, hasSidewalk: true },
  tertiary: { lanes: 1, hasCenter: false, hasSidewalk: true },
  tertiary_link: { lanes: 1, hasCenter: false, hasSidewalk: true },
  residential: { lanes: 1, hasCenter: false, hasSidewalk: true },
  living_street: { lanes: 1, hasCenter: false, hasSidewalk: true },
  service: { lanes: 1, hasCenter: false, hasSidewalk: false },
  unclassified: { lanes: 1, hasCenter: false, hasSidewalk: true },
  pedestrian: { lanes: 0, hasCenter: false, hasSidewalk: false },
  footway: { lanes: 0, hasCenter: false, hasSidewalk: false },
  cycleway: { lanes: 0, hasCenter: false, hasSidewalk: false },
  path: { lanes: 0, hasCenter: false, hasSidewalk: false },
  default: { lanes: 1, hasCenter: false, hasSidewalk: true },
};

function project(lon: number, lat: number, z: number = 0): [number, number, number] {
  const x = (lon - CENTER.lon) * SCALE * Math.cos(CENTER.lat * Math.PI / 180);
  const y = (lat - CENTER.lat) * SCALE;
  return [x, y, z];
}

// Fetch comprehensive OSM data
async function fetchOSMData() {
  const query = `
    [out:json][timeout:60];
    (
      // Buildings
      way["building"](${BBOX});
      // Roads
      way["highway"](${BBOX});
      // Sidewalks
      way["footway"="sidewalk"](${BBOX});
      way["highway"="footway"]["footway"="sidewalk"](${BBOX});
      // Crossings
      node["highway"="crossing"](${BBOX});
      way["footway"="crossing"](${BBOX});
      // Traffic signals
      node["highway"="traffic_signals"](${BBOX});
      // Parking
      way["amenity"="parking"](${BBOX});
      // Cycle lanes
      way["cycleway"](${BBOX});
      way["highway"="cycleway"](${BBOX});
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

// Calculate road width from OSM tags
function calculateRoadWidth(tags: any, roadType: string): number {
  // Use explicit width tag if available
  if (tags.width) {
    const width = parseFloat(tags.width);
    if (!isNaN(width)) return width;
  }

  // Calculate from lanes
  const defaults = ROAD_DEFAULTS[roadType] || ROAD_DEFAULTS.default;
  let lanes = parseInt(tags.lanes) || defaults.lanes;

  // Handle one-way streets (usually have lanes in one direction)
  if (tags.oneway === 'yes' && !tags.lanes) {
    lanes = Math.max(1, lanes);
  }

  let width = lanes * LANE_WIDTH;

  // Add parking lanes
  if (tags['parking:lane:both'] || tags['parking:lane:left'] || tags['parking:lane:right']) {
    const leftParking = tags['parking:lane:left'] && tags['parking:lane:left'] !== 'no';
    const rightParking = tags['parking:lane:right'] && tags['parking:lane:right'] !== 'no';
    const bothParking = tags['parking:lane:both'] && tags['parking:lane:both'] !== 'no';

    if (bothParking) width += PARKING_LANE_WIDTH * 2;
    else {
      if (leftParking) width += PARKING_LANE_WIDTH;
      if (rightParking) width += PARKING_LANE_WIDTH;
    }
  }

  // Add cycle lanes
  if (tags['cycleway:left'] || tags['cycleway:right'] || tags.cycleway) {
    if (tags['cycleway:both'] || tags.cycleway === 'lane') {
      width += CYCLE_LANE_WIDTH * 2;
    } else {
      if (tags['cycleway:left']) width += CYCLE_LANE_WIDTH;
      if (tags['cycleway:right']) width += CYCLE_LANE_WIDTH;
    }
  }

  // Minimum widths for pedestrian paths
  if (roadType === 'footway' || roadType === 'path') {
    width = Math.max(1.5, width);
  } else if (roadType === 'cycleway') {
    width = Math.max(2, width);
  } else {
    width = Math.max(3, width); // Minimum road width
  }

  return width;
}

// Offset a path to create parallel lines (for sidewalks)
function offsetPath(path: [number, number, number][], offset: number, zOffset: number = 0): [number, number, number][] {
  if (path.length < 2) return path;

  const result: [number, number, number][] = [];

  for (let i = 0; i < path.length; i++) {
    let nx = 0, ny = 0;

    if (i === 0) {
      // First point - use direction to next point
      const dx = path[1][0] - path[0][0];
      const dy = path[1][1] - path[0][1];
      const len = Math.sqrt(dx * dx + dy * dy);
      nx = -dy / len;
      ny = dx / len;
    } else if (i === path.length - 1) {
      // Last point - use direction from previous point
      const dx = path[i][0] - path[i - 1][0];
      const dy = path[i][1] - path[i - 1][1];
      const len = Math.sqrt(dx * dx + dy * dy);
      nx = -dy / len;
      ny = dx / len;
    } else {
      // Middle points - average of both directions
      const dx1 = path[i][0] - path[i - 1][0];
      const dy1 = path[i][1] - path[i - 1][1];
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

      const dx2 = path[i + 1][0] - path[i][0];
      const dy2 = path[i + 1][1] - path[i][1];
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      nx = (-dy1 / len1 - dy2 / len2) / 2;
      ny = (dx1 / len1 + dx2 / len2) / 2;

      const nlen = Math.sqrt(nx * nx + ny * ny);
      if (nlen > 0) {
        nx /= nlen;
        ny /= nlen;
      }
    }

    result.push([path[i][0] + nx * offset, path[i][1] + ny * offset, (path[i][2] || 0) + zOffset]);
  }

  return result;
}

// Parse OSM data into structured objects
function parseOSMData(data: any) {
  const nodes: Record<number, { lon: number; lat: number; tags?: any }> = {};
  const buildings: any[] = [];
  const roads: any[] = [];
  const sidewalks: any[] = [];
  const crossings: any[] = [];
  const trafficSignals: any[] = [];
  const cycleways: any[] = [];
  const parkingAreas: any[] = [];

  // Index all nodes
  for (const el of data.elements) {
    if (el.type === 'node') {
      nodes[el.id] = { lon: el.lon, lat: el.lat, tags: el.tags };

      // Collect point features
      if (el.tags?.highway === 'crossing') {
        crossings.push({
          position: project(el.lon, el.lat, 0.2),
          type: el.tags.crossing || 'unmarked',
        });
      }
      if (el.tags?.highway === 'traffic_signals') {
        trafficSignals.push({
          position: project(el.lon, el.lat, 3), // Traffic signals elevated
        });
      }
    }
  }

  // Process ways
  for (const el of data.elements) {
    if (el.type !== 'way' || !el.nodes) continue;

    const coords = el.nodes
      .map((id: number) => nodes[id])
      .filter(Boolean)
      .map((n: any) => project(n.lon, n.lat));

    if (coords.length < 2) continue;

    const tags = el.tags || {};

    // Buildings
    if (tags.building) {
      const polygon = [...coords];
      if (polygon.length > 2) {
        const first = polygon[0];
        const last = polygon[polygon.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          polygon.push(first);
        }
      }

      const levels = parseFloat(tags['building:levels']) || Math.floor(Math.random() * 4) + 2;
      buildings.push({
        polygon,
        height: levels * 3.5,
        type: tags.building,
      });
    }
    // Highways/Roads
    else if (tags.highway) {
      const roadType = tags.highway;

      // Sidewalks as separate ways
      if (tags.footway === 'sidewalk' || (roadType === 'footway' && tags.footway === 'sidewalk')) {
        sidewalks.push({
          path: coords.map((c: [number, number, number]) => [c[0], c[1], 0.15] as [number, number, number]),
          width: SIDEWALK_WIDTH,
          surface: tags.surface || 'paved',
        });
        continue;
      }

      // Crossings as ways
      if (tags.footway === 'crossing') {
        crossings.push({
          path: coords,
          type: tags.crossing || 'unmarked',
          isWay: true,
        });
        continue;
      }

      // Cycleways
      if (roadType === 'cycleway') {
        cycleways.push({
          path: coords,
          width: parseFloat(tags.width) || CYCLE_LANE_WIDTH * 2,
          surface: tags.surface || 'asphalt',
        });
        continue;
      }

      // Skip footways and paths for main road layer
      if (roadType === 'footway' || roadType === 'path' || roadType === 'steps') {
        sidewalks.push({
          path: coords.map((c: [number, number, number]) => [c[0], c[1], 0.15] as [number, number, number]),
          width: parseFloat(tags.width) || 1.5,
          surface: tags.surface || 'paved',
        });
        continue;
      }

      // Main roads
      const defaults = ROAD_DEFAULTS[roadType] || ROAD_DEFAULTS.default;
      const width = calculateRoadWidth(tags, roadType);
      const surface = tags.surface || 'asphalt';
      const surfaceColor = SURFACE_COLORS[surface] || SURFACE_COLORS.default;

      const road = {
        path: coords,
        type: roadType,
        width,
        lanes: parseInt(tags.lanes) || defaults.lanes,
        surface,
        surfaceColor,
        oneway: tags.oneway === 'yes',
        name: tags.name || '',
        hasCenter: defaults.hasCenter && (parseInt(tags.lanes) || defaults.lanes) >= 2,
        maxspeed: tags.maxspeed,
      };

      roads.push(road);

      // Generate implicit sidewalks for roads that should have them
      if (defaults.hasSidewalk && tags.sidewalk !== 'no') {
        const sidewalkOffset = width / 2 + SIDEWALK_WIDTH / 2 + 0.5;

        if (tags.sidewalk === 'both' || tags.sidewalk === 'left' || !tags.sidewalk) {
          sidewalks.push({
            path: offsetPath(coords, -sidewalkOffset, 0.15), // Elevated sidewalk
            width: SIDEWALK_WIDTH,
            surface: 'paved',
            implicit: true,
          });
        }
        if (tags.sidewalk === 'both' || tags.sidewalk === 'right' || !tags.sidewalk) {
          sidewalks.push({
            path: offsetPath(coords, sidewalkOffset, 0.15), // Elevated sidewalk
            width: SIDEWALK_WIDTH,
            surface: 'paved',
            implicit: true,
          });
        }
      }
    }
    // Parking areas
    else if (tags.amenity === 'parking') {
      const polygon = [...coords];
      if (polygon.length > 2) {
        const first = polygon[0];
        const last = polygon[polygon.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          polygon.push(first);
        }
      }
      parkingAreas.push({
        polygon,
        surface: tags.surface || 'asphalt',
      });
    }
  }

  return { buildings, roads, sidewalks, crossings, trafficSignals, cycleways, parkingAreas };
}

// Generate crosswalk stripes
function generateCrosswalkStripes(crossing: any) {
  if (!crossing.path || crossing.path.length < 2) return [];

  const path = crossing.path;
  const stripes: any[] = [];

  // Calculate direction
  const dx = path[path.length - 1][0] - path[0][0];
  const dy = path[path.length - 1][1] - path[0][1];
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;

  // Perpendicular
  const px = -uy;
  const py = ux;

  // Generate stripes along the crossing
  const stripeWidth = 0.5;
  const stripeGap = 0.5;
  const stripeLength = 3;
  const numStripes = Math.floor(len / (stripeWidth + stripeGap));

  for (let i = 0; i < numStripes; i++) {
    const t = (i + 0.5) * (stripeWidth + stripeGap);
    const cx = path[0][0] + ux * t;
    const cy = path[0][1] + uy * t;

    stripes.push({
      path: [
        [cx - px * stripeLength / 2, cy - py * stripeLength / 2, 0.1],
        [cx + px * stripeLength / 2, cy + py * stripeLength / 2, 0.1],
      ],
    });
  }

  return stripes;
}

export default function CityScene() {
  const [data, setData] = useState<any>(null);
  const [time, setTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch OSM data
  useEffect(() => {
    fetchOSMData()
      .then((osmData) => {
        const parsed = parseOSMData(osmData);
        setData(parsed);
        setLoading(false);
        console.log('Loaded:', {
          buildings: parsed.buildings.length,
          roads: parsed.roads.length,
          sidewalks: parsed.sidewalks.length,
          crossings: parsed.crossings.length,
          signals: parsed.trafficSignals.length,
        });
      })
      .catch((err) => {
        console.error('OSM fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setTime((t) => (t + 1) % 500);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  if (!data) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#010029', zIndex: -1 }}>
        <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#00C217' }}>
          {loading ? 'Loading OSM data...' : error ? `Error: ${error}` : ''}
        </div>
      </div>
    );
  }

  const { buildings, roads, sidewalks, crossings, trafficSignals, cycleways, parkingAreas } = data;

  // Generate animated flows
  const flows = roads.slice(0, 60).flatMap((road: any, roadIdx: number) => {
    const path = road.path;
    if (path.length < 2) return [];

    return [0, 1, 2].map((particleIdx) => {
      const offset = (roadIdx * 37 + particleIdx * 167) % 500;
      const progress = ((time + offset) % 500) / 500;

      let totalLength = 0;
      for (let i = 1; i < path.length; i++) {
        const dx = path[i][0] - path[i - 1][0];
        const dy = path[i][1] - path[i - 1][1];
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }

      let targetDist = progress * totalLength;
      let px = path[0][0], py = path[0][1];

      for (let i = 1; i < path.length; i++) {
        const dx = path[i][0] - path[i - 1][0];
        const dy = path[i][1] - path[i - 1][1];
        const segLen = Math.sqrt(dx * dx + dy * dy);

        if (targetDist <= segLen) {
          const t = targetDist / segLen;
          px = path[i - 1][0] + dx * t;
          py = path[i - 1][1] + dy * t;
          break;
        }
        targetDist -= segLen;
        px = path[i][0];
        py = path[i][1];
      }

      return { position: [px, py, 1] }; // Elevated slightly above roads
    });
  });

  // Generate crosswalk stripes
  const crosswalkStripes = crossings
    .filter((c: any) => c.isWay)
    .flatMap(generateCrosswalkStripes);

  const layers = [
    // Parking areas
    new PolygonLayer({
      id: 'parking',
      data: parkingAreas,
      getPolygon: (d: any) => d.polygon,
      getFillColor: [50, 55, 60, 200],
      getLineColor: [70, 75, 80, 255],
      getLineWidth: 1,
      lineWidthMinPixels: 1,
    }),

    // Road casing (dark outline)
    new PathLayer({
      id: 'road-casing',
      data: roads,
      getPath: (d: any) => d.path,
      getColor: [30, 35, 40, 255],
      getWidth: (d: any) => d.width + 2,
      widthMinPixels: 3,
      widthScale: 1,
      capRounded: true,
      jointRounded: true,
    }),

    // Road fill
    new PathLayer({
      id: 'road-fill',
      data: roads,
      getPath: (d: any) => d.path,
      getColor: (d: any) => [...d.surfaceColor, 255],
      getWidth: (d: any) => d.width,
      widthMinPixels: 2,
      widthScale: 1,
      capRounded: true,
      jointRounded: true,
    }),

    // Sidewalks
    new PathLayer({
      id: 'sidewalks',
      data: sidewalks,
      getPath: (d: any) => d.path,
      getColor: [130, 130, 125, 200],
      getWidth: (d: any) => d.width,
      widthMinPixels: 1,
      widthScale: 1,
      capRounded: true,
      jointRounded: true,
    }),

    // Cycleways
    new PathLayer({
      id: 'cycleways',
      data: cycleways,
      getPath: (d: any) => d.path,
      getColor: [100, 150, 100, 255],
      getWidth: (d: any) => d.width,
      widthMinPixels: 1,
      widthScale: 1,
    }),

    // Center lines (yellow dashed)
    new PathLayer({
      id: 'center-lines',
      data: roads.filter((r: any) => r.hasCenter),
      getPath: (d: any) => d.path,
      getColor: [255, 200, 50, 220],
      getWidth: 0.3,
      widthMinPixels: 1,
    }),

    // Edge lines (white)
    new PathLayer({
      id: 'edge-lines-left',
      data: roads.filter((r: any) => r.lanes >= 2),
      getPath: (d: any) => offsetPath(d.path, -d.width / 2 + 0.3, 0.05),
      getColor: [255, 255, 255, 150],
      getWidth: 0.2,
      widthMinPixels: 1,
    }),

    new PathLayer({
      id: 'edge-lines-right',
      data: roads.filter((r: any) => r.lanes >= 2),
      getPath: (d: any) => offsetPath(d.path, d.width / 2 - 0.3, 0.05),
      getColor: [255, 255, 255, 150],
      getWidth: 0.2,
      widthMinPixels: 1,
    }),

    // Crosswalk stripes
    new PathLayer({
      id: 'crosswalks',
      data: crosswalkStripes,
      getPath: (d: any) => d.path,
      getColor: [255, 255, 255, 230],
      getWidth: 0.5,
      widthMinPixels: 2,
    }),

    // Traffic signals
    new ScatterplotLayer({
      id: 'traffic-signals',
      data: trafficSignals,
      getPosition: (d: any) => d.position,
      getFillColor: [255, 200, 50, 255],
      getRadius: 1.5,
      radiusMinPixels: 3,
    }),

    // Crossing points
    new ScatterplotLayer({
      id: 'crossing-points',
      data: crossings.filter((c: any) => !c.isWay),
      getPosition: (d: any) => d.position,
      getFillColor: [255, 255, 255, 200],
      getRadius: 1,
      radiusMinPixels: 2,
    }),

    // Buildings
    new PolygonLayer({
      id: 'buildings',
      data: buildings,
      extruded: true,
      filled: true,
      getPolygon: (d: any) => d.polygon,
      getElevation: (d: any) => d.height,
      getFillColor: [0, 194, 23, 130],
      getLineColor: [0, 194, 23, 180],
      getLineWidth: 1,
      lineWidthMinPixels: 1,
      material: {
        ambient: 0.4,
        diffuse: 0.6,
        shininess: 32,
      },
    }),

    // Animated flow particles
    new ScatterplotLayer({
      id: 'flows',
      data: flows,
      getPosition: (d: any) => d.position,
      getFillColor: [0, 194, 23, 255],
      getRadius: 1.5,
      radiusMinPixels: 3,
    }),
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      <DeckGL
        views={new OrbitView({ id: 'orbit', orbitAxis: 'Z' })}
        initialViewState={{
          target: [0, 0, 0],
          zoom: 11,
          rotationX: -55,      // Tilt angle (negative = looking down)
          rotationOrbit: 45,   // Horizontal rotation for isometric
          minZoom: 8,
          maxZoom: 16,
          minRotationX: -90,
          maxRotationX: 0,
        }}
        controller={{ rotateSpeed: 0.5, scrollSpeed: 1.5 }}
        layers={layers}
        getCursor={() => 'grab'}
        style={{ background: '#010029' }}
      />
      <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#00C217', opacity: 0.5, fontSize: 12 }}>
        {buildings.length} buildings · {roads.length} roads · {sidewalks.length} sidewalks · {crossings.length} crossings
      </div>
    </div>
  );
}
