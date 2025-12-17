'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Barcelona Eixample center
const CENTER = { lat: 41.39086, lon: 2.15644 };

function project(lon: number, lat: number): [number, number] {
  const x = (lon - CENTER.lon) * 111000 * Math.cos(CENTER.lat * Math.PI / 180);
  const y = (lat - CENTER.lat) * 111000;
  return [x, y];
}

function unproject(x: number, y: number): { lat: number; lon: number } {
  const lon = x / (111000 * Math.cos(CENTER.lat * Math.PI / 180)) + CENTER.lon;
  const lat = y / 111000 + CENTER.lat;
  return { lat, lon };
}

// Load roads for reference
async function fetchRoads() {
  const response = await fetch('/data/perimeter/barcelona-roads-1200m.json');
  if (!response.ok) return [];
  const data = await response.json();

  const nodes: Record<number, { lon: number; lat: number }> = {};
  const roads: [number, number][][] = [];

  for (const el of data.elements) {
    if (el.type === 'node') nodes[el.id] = { lon: el.lon, lat: el.lat };
  }

  for (const el of data.elements) {
    if (el.type !== 'way' || !el.nodes || !el.tags?.highway) continue;
    const path = el.nodes
      .map((id: number) => nodes[id])
      .filter(Boolean)
      .map((n: { lon: number; lat: number }) => project(n.lon, n.lat));
    if (path.length >= 2) roads.push(path);
  }

  return roads;
}

// Reference roads layer
function RoadsLayer({ roads }: { roads: [number, number][][] }) {
  return (
    <group>
      {roads.map((path, i) => (
        <Line
          key={i}
          points={path.map(p => [p[0], p[1], 0] as [number, number, number])}
          color="#555566"
          lineWidth={1}
        />
      ))}
    </group>
  );
}

// Drawing polygon
function PolygonLayer({
  points,
  isComplete
}: {
  points: [number, number][];
  isComplete: boolean;
}) {
  if (points.length === 0) return null;

  const linePoints = points.map(p => [p[0], p[1], 1] as [number, number, number]);
  if (isComplete && points.length > 2) {
    linePoints.push([points[0][0], points[0][1], 1]);
  }

  return (
    <group>
      {/* Line */}
      {linePoints.length >= 2 && (
        <Line
          points={linePoints}
          color="#00ff00"
          lineWidth={3}
        />
      )}
      {/* Vertices */}
      {points.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], 1]}>
          <circleGeometry args={[15, 16]} />
          <meshBasicMaterial color={i === 0 ? '#ff0000' : '#00ff00'} />
        </mesh>
      ))}
    </group>
  );
}

// Click handler component
function ClickHandler({
  onPointAdd,
  enabled,
}: {
  onPointAdd: (point: [number, number]) => void;
  enabled: boolean;
}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, intersection);

      if (intersection) {
        onPointAdd([intersection.x, intersection.y]);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, onPointAdd, enabled]);

  return null;
}

// Top-down camera setup
function TopDownCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 2000);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export default function DrawPage() {
  const [roads, setRoads] = useState<[number, number][][]>([]);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);

  // Load roads on mount
  useEffect(() => {
    fetchRoads().then(setRoads);
  }, []);

  const handlePointAdd = useCallback((point: [number, number]) => {
    if (!isDrawing) return;
    setPoints(prev => [...prev, point]);
  }, [isDrawing]);

  const handleComplete = () => {
    if (points.length >= 3) {
      setIsComplete(true);
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    setPoints([]);
    setIsComplete(false);
    setIsDrawing(true);
  };

  const handleExport = () => {
    const geoPoints = points.map(p => unproject(p[0], p[1]));
    const json = JSON.stringify(geoPoints, null, 2);

    // Copy to clipboard
    navigator.clipboard.writeText(json);
    alert('Polygon coordinates copied to clipboard!\n\nFormat: [{lat, lon}, ...]');

    // Also log to console
    console.log('Polygon coordinates:', geoPoints);
  };

  const handleSave = () => {
    const geoPoints = points.map(p => unproject(p[0], p[1]));
    const blob = new Blob([JSON.stringify(geoPoints, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perimeter.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas
        orthographic
        camera={{ zoom: 0.4, position: [0, 0, 2000], near: 0.1, far: 5000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <TopDownCamera />
        <RoadsLayer roads={roads} />
        <PolygonLayer points={points} isComplete={isComplete} />
        <ClickHandler onPointAdd={handlePointAdd} enabled={isDrawing} />
        <OrbitControls
          enableRotate={false}
          mouseButtons={{ LEFT: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN }}
        />
      </Canvas>

      {/* UI Controls */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'rgba(0,0,0,0.7)',
        padding: 16,
        borderRadius: 8,
        color: '#fff',
        fontSize: 14,
      }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Draw Perimeter</h2>
        <p style={{ margin: 0, color: '#888' }}>
          {isDrawing
            ? 'Click to add points. Complete polygon when done.'
            : 'Polygon complete. Export or clear to redraw.'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {isDrawing && points.length >= 3 && (
            <button
              onClick={handleComplete}
              style={{
                padding: '8px 16px',
                background: '#00aa00',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Complete
            </button>
          )}
          <button
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              background: '#aa0000',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
        {isComplete && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                background: '#0066aa',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Copy JSON
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                background: '#6600aa',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Download
            </button>
          </div>
        )}
        <div style={{ fontSize: 12, color: '#666' }}>
          Points: {points.length}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        background: 'rgba(0,0,0,0.7)',
        padding: 12,
        borderRadius: 8,
        color: '#888',
        fontSize: 12,
      }}>
        <div>• Click to add points</div>
        <div>• Pan with left mouse drag</div>
        <div>• Scroll to zoom</div>
        <div>• Red dot = first point</div>
      </div>
    </div>
  );
}
