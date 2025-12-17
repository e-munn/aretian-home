// Barcelona Eixample bounds (polygon centroid)
export const CENTER = { lat: 41.39112, lon: 2.15665 };
export const RADIUS_M = 1300;

// Custom perimeter polygon
export const BOUNDS_POLYGON = [
  { lat: 41.39281945945946, lon: 2.1423599813729917 },
  { lat: 41.40115279279279, lon: 2.1572505767653074 },
  { lat: 41.39052216216216, lon: 2.1705500399886866 },
  { lat: 41.379981621621624, lon: 2.15644 },
  { lat: 41.392278918918926, lon: 2.1408589132890885 },
];

export function project(lon: number, lat: number): [number, number, number] {
  const x = (lon - CENTER.lon) * 111000 * Math.cos(CENTER.lat * Math.PI / 180);
  const y = (lat - CENTER.lat) * 111000;
  return [x, y, 0];
}

// Project perimeter to scene coordinates (cached)
let projectedPerimeter: [number, number][] | null = null;
function getProjectedPerimeter(): [number, number][] {
  if (!projectedPerimeter) {
    projectedPerimeter = BOUNDS_POLYGON.map(p => {
      const [x, y] = project(p.lon, p.lat);
      return [x, y] as [number, number];
    });
  }
  return projectedPerimeter;
}

// Point-in-polygon test (2D)
function pointInPolygon2D(x: number, y: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Line segment intersection
function lineIntersection(
  p1: [number, number], p2: [number, number],
  p3: [number, number], p4: [number, number]
): [number, number] | null {
  const [x1, y1] = p1, [x2, y2] = p2;
  const [x3, y3] = p3, [x4, y4] = p4;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  }
  return null;
}

// Find intersection of line segment with polygon boundary
function findBoundaryIntersection(
  inside: [number, number], outside: [number, number], polygon: [number, number][]
): [number, number] {
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const intersection = lineIntersection(inside, outside, polygon[i], polygon[j]);
    if (intersection) return intersection;
  }
  return inside; // fallback
}

// Clip a path to the polygon boundary
function clipPathToPolygon(path: [number, number, number][], polygon: [number, number][]): [number, number, number][][] {
  const segments: [number, number, number][][] = [];
  let currentSegment: [number, number, number][] = [];

  for (let i = 0; i < path.length; i++) {
    const [x, y, z] = path[i];
    const isInside = pointInPolygon2D(x, y, polygon);

    if (isInside) {
      if (currentSegment.length === 0 && i > 0) {
        // Entering polygon - add intersection point
        const [px, py] = path[i - 1];
        const wasInside = pointInPolygon2D(px, py, polygon);
        if (!wasInside) {
          const [ix, iy] = findBoundaryIntersection([x, y], [px, py], polygon);
          currentSegment.push([ix, iy, z]);
        }
      }
      currentSegment.push([x, y, z]);
    } else {
      if (currentSegment.length > 0) {
        // Exiting polygon - add intersection point and close segment
        const lastInside = currentSegment[currentSegment.length - 1];
        const [ix, iy] = findBoundaryIntersection(
          [lastInside[0], lastInside[1]], [x, y], polygon
        );
        currentSegment.push([ix, iy, z]);
        segments.push(currentSegment);
        currentSegment = [];
      }
    }
  }

  if (currentSegment.length >= 2) {
    segments.push(currentSegment);
  }

  return segments;
}

// Load cached OSM road data (custom perimeter)
export async function fetchOSMData() {
  const response = await fetch('/data/perimeter/barcelona-roads-custom.json');
  if (!response.ok) throw new Error('Failed to load road data');
  return response.json();
}

// Parse roads from OSM data (with polygon clipping)
export function parseRoads(data: any) {
  const nodes: Record<number, { lon: number; lat: number }> = {};
  const roads: { path: [number, number, number][]; type: string; width: number }[] = [];
  const polygon = getProjectedPerimeter();

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
  };

  for (const el of data.elements) {
    if (el.type !== 'way' || !el.nodes || !el.tags?.highway) continue;

    const path = el.nodes
      .map((id: number) => nodes[id])
      .filter(Boolean)
      .map((n: { lon: number; lat: number }) => project(n.lon, n.lat));

    if (path.length >= 2) {
      // Clip road to polygon boundary
      const clippedSegments = clipPathToPolygon(path, polygon);
      for (const segment of clippedSegments) {
        if (segment.length >= 2) {
          roads.push({
            path: segment,
            type: el.tags.highway,
            width: widths[el.tags.highway] || 5,
          });
        }
      }
    }
  }

  return roads;
}
