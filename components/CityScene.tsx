'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { InstancedPalmTrees, fetchBarcelonaTrees } from './city/Trees';
import { DetailedBuildings, fetchOvertureBuildings, BuildingData } from './city/Buildings';
import {
  ParkingZones,
  BikeLanes,
  fetchBusStops,
  fetchBicingStations,
  fetchTrafficViolations,
  fetchParkingZones,
  fetchBikeLanes,
  BusStopData,
  BicingStationData,
  TrafficViolationData,
  ParkingZoneData,
  BikeLaneData,
} from './city/Infrastructure';
import {
  BusStopMarkers,
  BicingMarkers,
  TrafficViolationMarkers,
} from './city/Markers';

// Barcelona Eixample center
const CENTER = { lat: 41.39086, lon: 2.15644 };
const RADIUS_M = 1200; // 1.2km radius circular area

function project(lon: number, lat: number): [number, number, number] {
  const x = (lon - CENTER.lon) * 111000 * Math.cos(CENTER.lat * Math.PI / 180);
  const y = (lat - CENTER.lat) * 111000;
  return [x, y, 0];
}

// Load cached OSM road data
async function fetchOSMData() {
  const response = await fetch('/data/perimeter/barcelona-roads-1200m.json');
  if (!response.ok) throw new Error('Failed to load road data');
  return response.json();
}

// Parse roads from OSM data
function parseRoads(data: any) {
  const nodes: Record<number, { lon: number; lat: number }> = {};
  const roads: { path: [number, number, number][]; type: string; width: number }[] = [];

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
      roads.push({
        path,
        type: el.tags.highway,
        width: widths[el.tags.highway] || 5,
      });
    }
  }

  return roads;
}

// Grid constants
const GRID_ANGLE = 44.9 * (Math.PI / 180);
const GRID_SPACING = 10; // meters between dots

// Road type classification
const SIDEWALK_TYPES = ['footway', 'path', 'pedestrian', 'cycleway', 'steps'];

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

// Dot grid using instanced mesh
function DotGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dots = useMemo(() => generateDotGrid(RADIUS_M, GRID_SPACING, GRID_ANGLE), []);

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
      <circleGeometry args={[1.2, 8]} />
      <meshBasicMaterial color="#cc6600" transparent opacity={0.4} />
    </instancedMesh>
  );
}

// Simple road styling - one style for roads, one for sidewalks
const ROAD_COLOR = new THREE.Color(75 / 255, 80 / 255, 95 / 255);
const ROAD_WIDTH = 4;
const SIDEWALK_COLOR = new THREE.Color(45 / 255, 42 / 255, 40 / 255);
const SIDEWALK_WIDTH = 1.5;

// Roads component - renders roads and sidewalks
function Roads({
  roads,
}: {
  roads: { path: [number, number, number][]; type: string; width: number }[];
}) {
  const { mainRoads, sidewalks } = useMemo(() => {
    const main: typeof roads = [];
    const sw: typeof roads = [];

    for (const road of roads) {
      if (SIDEWALK_TYPES.includes(road.type)) {
        sw.push(road);
      } else {
        main.push(road);
      }
    }

    return { mainRoads: main, sidewalks: sw };
  }, [roads]);

  return (
    <group>
      {mainRoads.map((road, i) => (
        <Line
          key={`road-${i}`}
          points={road.path}
          color={ROAD_COLOR}
          lineWidth={ROAD_WIDTH}
          transparent
          opacity={0.9}
        />
      ))}
      {sidewalks.map((road, i) => (
        <Line
          key={`sw-${i}`}
          points={road.path}
          color={SIDEWALK_COLOR}
          lineWidth={SIDEWALK_WIDTH}
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
  trees,
  buildings,
  busStops,
  bicingStations,
  trafficViolations,
  parkingZones,
  bikeLanes,
  buildingColor,
}: {
  roads: { path: [number, number, number][]; type: string; width: number }[];
  trees: [number, number, number][];
  buildings: BuildingData[];
  busStops: BusStopData[];
  bicingStations: BicingStationData[];
  trafficViolations: TrafficViolationData[];
  parkingZones: ParkingZoneData[];
  bikeLanes: BikeLaneData[];
  buildingColor: string;
  buildingOpacity: number;
}) {
  const { camera, gl } = useThree();

  // Set up isometric camera
  useEffect(() => {
    const dist = 500;
    const angle = Math.PI / 4; // 45° azimuth
    const elevation = Math.atan(1 / Math.sqrt(2)); // ~35.264° elevation
    camera.position.set(
      dist * Math.cos(angle) * Math.cos(elevation),
      dist * Math.sin(angle) * Math.cos(elevation),
      dist * Math.sin(elevation)
    );
    camera.up.set(0, 0, 1); // Z is up
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      {/* Rotate entire scene so grid aligns with screen axes, shift down to center on screen */}
      <group rotation={[0, 0, -GRID_ANGLE]} position={[0, 0, -80]}>
        <DotGrid />
        <Roads roads={roads} />
        <ParkingZones zones={parkingZones} opacity={0.6} />
        <BikeLanes lanes={bikeLanes} color="#44cc66" lineWidth={2} />
        <InstancedPalmTrees positions={trees} />
        <DetailedBuildings
          buildings={buildings}
          color={buildingColor}
          edgeColor="#5a6a80"
          fillOpacity={0.7}
          edgeOpacity={0}
        />
        {/* Markers with tall poles (visible above buildings) */}
        <BusStopMarkers positions={busStops.map(s => s.position)} />
        <BicingMarkers positions={bicingStations.map(s => s.position)} />
        <TrafficViolationMarkers positions={trafficViolations.map(v => v.position)} />
        <FlowParticles roads={roads} />
      </group>
      <OrbitControls
        args={[camera, gl.domElement]}
        enableRotate={false}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN }}
        enableDamping={false}
      />
    </>
  );
}

export default function CityScene() {
  const [roads, setRoads] = useState<{ path: [number, number, number][]; type: string; width: number }[]>([]);
  const [trees, setTrees] = useState<[number, number, number][]>([]);
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [busStops, setBusStops] = useState<BusStopData[]>([]);
  const [bicingStations, setBicingStations] = useState<BicingStationData[]>([]);
  const [trafficViolations, setTrafficViolations] = useState<TrafficViolationData[]>([]);
  const [parkingZones, setParkingZones] = useState<ParkingZoneData[]>([]);
  const [bikeLanes, setBikeLanes] = useState<BikeLaneData[]>([]);
  const [buildingColor, setBuildingColor] = useState('#263040');
  const [buildingOpacity, setBuildingOpacity] = useState(0.7);

  // Fetch roads
  useEffect(() => {
    fetchOSMData()
      .then((data) => {
        const parsedRoads = parseRoads(data);
        setRoads(parsedRoads);
        console.log(`Loaded ${parsedRoads.length} roads`);
      })
      .catch((err) => console.error('OSM fetch error:', err));
  }, []);

  // Fetch trees (Barcelona Open Data - official city inventory)
  useEffect(() => {
    fetchBarcelonaTrees()
      .then((treePositions) => {
        setTrees(treePositions);
        console.log(`Loaded ${treePositions.length} trees`);
      })
      .catch((err) => console.error('Tree fetch error:', err));
  }, []);

  // Fetch buildings
  useEffect(() => {
    fetchOvertureBuildings()
      .then((buildingData) => {
        setBuildings(buildingData);
        console.log(`Loaded ${buildingData.length} buildings`);
      })
      .catch((err) => console.error('Building fetch error:', err));
  }, []);

  // Fetch bus stops (Barcelona Open Data)
  useEffect(() => {
    fetchBusStops()
      .then((stops) => {
        setBusStops(stops);
        console.log(`Loaded ${stops.length} bus stops`);
      })
      .catch((err) => console.error('Bus stops fetch error:', err));
  }, []);

  // Fetch Bicing stations (Barcelona Open Data - secured)
  useEffect(() => {
    fetchBicingStations()
      .then((stations) => {
        setBicingStations(stations);
        console.log(`Loaded ${stations.length} Bicing stations`);
      })
      .catch((err) => console.error('Bicing stations fetch error:', err));
  }, []);

  // Fetch traffic violations (Barcelona Open Data)
  useEffect(() => {
    fetchTrafficViolations()
      .then((violations) => {
        setTrafficViolations(violations);
        console.log(`Loaded ${violations.length} traffic violations`);
      })
      .catch((err) => console.error('Traffic violations fetch error:', err));
  }, []);

  // Fetch parking zones (Barcelona Open Data)
  useEffect(() => {
    fetchParkingZones()
      .then((zones) => {
        setParkingZones(zones);
        console.log(`Loaded ${zones.length} parking zones`);
      })
      .catch((err) => console.error('Parking zones fetch error:', err));
  }, []);

  // Fetch bike lanes (Barcelona Open Data GeoJSON)
  useEffect(() => {
    fetchBikeLanes()
      .then((lanes) => {
        setBikeLanes(lanes);
        console.log(`Loaded ${lanes.length} bike lanes`);
      })
      .catch((err) => console.error('Bike lanes fetch error:', err));
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas
        orthographic
        camera={{
          zoom: 1.1,
          position: [0, 0, 500],
          near: 0.1,
          far: 2000,
        }}
        style={{ width: '100%', height: '100%', background: '#010029' }}
      >
        {roads.length > 0 && (
          <Scene
            roads={roads}
            trees={trees}
            buildings={buildings}
            busStops={busStops}
            bicingStations={bicingStations}
            trafficViolations={trafficViolations}
            parkingZones={parkingZones}
            bikeLanes={bikeLanes}
            buildingColor={buildingColor}
          />
        )}
      </Canvas>
      {/* Color picker for buildings */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(0,0,0,0.5)',
        padding: '8px 12px',
        borderRadius: 8,
        zIndex: 10,
      }}>
        <label style={{ color: '#fff', fontSize: 12 }}>Buildings</label>
        <input
          type="color"
          value={buildingColor}
          onChange={(e) => setBuildingColor(e.target.value)}
          style={{ width: 40, height: 24, border: 'none', cursor: 'pointer' }}
        />
        <span style={{ color: '#888', fontSize: 11 }}>{buildingColor}</span>
      </div>
    </div>
  );
}
