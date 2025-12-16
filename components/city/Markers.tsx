'use client';

import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Tailwind color palette (bold colors)
export const COLORS = {
  blue500: '#3b82f6',
  blue600: '#2563eb',
  red500: '#ef4444',
  red600: '#dc2626',
  orange500: '#f97316',
  orange600: '#ea580c',
  green500: '#22c55e',
  green600: '#16a34a',
  yellow500: '#eab308',
  yellow400: '#facc15',
  purple500: '#a855f7',
  cyan500: '#06b6d4',
  pink500: '#ec4899',
  slate700: '#334155',
  white: '#ffffff',
};

// Barcelona Eixample center (must match CityScene)
const CENTER = { lat: 41.39086, lon: 2.15644 };

function project(lon: number, lat: number): [number, number, number] {
  const x = (lon - CENTER.lon) * 111000 * Math.cos(CENTER.lat * Math.PI / 180);
  const y = (lat - CENTER.lat) * 111000;
  return [x, y, 0];
}

// ============ BUS STOP MARKERS ============
// Tall pole with bus shelter icon at top

interface BusStopMarkersProps {
  positions: [number, number, number][];
  poleColor?: string;
  iconColor?: string;
  poleHeight?: number;
}

export function BusStopMarkers({
  positions,
  poleColor = COLORS.blue600,
  iconColor = COLORS.blue500,
  poleHeight = 35,
}: BusStopMarkersProps) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const iconRef = useRef<THREE.InstancedMesh>(null);
  const roofRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!poleRef.current || !iconRef.current || !roofRef.current || positions.length === 0) return;

    const tempObject = new THREE.Object3D();

    positions.forEach((pos, i) => {
      // Tall thin pole
      tempObject.position.set(pos[0], pos[1], poleHeight / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      poleRef.current!.setMatrixAt(i, tempObject.matrix);

      // Bus icon body (rectangle) at top - LARGE
      tempObject.position.set(pos[0], pos[1], poleHeight + 6);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      iconRef.current!.setMatrixAt(i, tempObject.matrix);

      // Bus roof/top - LARGE
      tempObject.position.set(pos[0], pos[1], poleHeight + 10);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      roofRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    iconRef.current.instanceMatrix.needsUpdate = true;
    roofRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, poleHeight]);

  if (positions.length === 0) return null;

  return (
    <>
      {/* Poles - thicker */}
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]}>
        <cylinderGeometry args={[0.8, 0.8, poleHeight, 6]} />
        <meshBasicMaterial color={poleColor} />
      </instancedMesh>

      {/* Bus body icon - LARGE */}
      <instancedMesh ref={iconRef} args={[undefined, undefined, positions.length]}>
        <boxGeometry args={[12, 6, 7]} />
        <meshBasicMaterial color={iconColor} />
      </instancedMesh>

      {/* Bus roof stripe - LARGE */}
      <instancedMesh ref={roofRef} args={[undefined, undefined, positions.length]}>
        <boxGeometry args={[13, 7, 1.5]} />
        <meshBasicMaterial color={COLORS.white} />
      </instancedMesh>
    </>
  );
}

// ============ BICING STATION MARKERS ============
// Tall pole with bike wheel icon at top

interface BicingMarkersProps {
  positions: [number, number, number][];
  poleColor?: string;
  iconColor?: string;
  poleHeight?: number;
}

export function BicingMarkers({
  positions,
  poleColor = COLORS.red600,
  iconColor = COLORS.red500,
  poleHeight = 35,
}: BicingMarkersProps) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const wheelRef = useRef<THREE.InstancedMesh>(null);
  const hubRef = useRef<THREE.InstancedMesh>(null);

  // Torus geometry for bike wheel - LARGE
  const wheelGeometry = useMemo(() => {
    return new THREE.TorusGeometry(6, 1.2, 8, 16);
  }, []);

  useEffect(() => {
    if (!poleRef.current || !wheelRef.current || !hubRef.current || positions.length === 0) return;

    const tempObject = new THREE.Object3D();

    positions.forEach((pos, i) => {
      // Tall thin pole
      tempObject.position.set(pos[0], pos[1], poleHeight / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      poleRef.current!.setMatrixAt(i, tempObject.matrix);

      // Bike wheel (torus) at top - rotated to face outward - LARGE
      tempObject.position.set(pos[0], pos[1], poleHeight + 8);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      wheelRef.current!.setMatrixAt(i, tempObject.matrix);

      // Hub center - LARGE
      tempObject.position.set(pos[0], pos[1], poleHeight + 8);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      hubRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    wheelRef.current.instanceMatrix.needsUpdate = true;
    hubRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, poleHeight]);

  if (positions.length === 0) return null;

  return (
    <>
      {/* Poles - thicker */}
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]}>
        <cylinderGeometry args={[0.8, 0.8, poleHeight, 6]} />
        <meshBasicMaterial color={poleColor} />
      </instancedMesh>

      {/* Bike wheel */}
      <instancedMesh ref={wheelRef} args={[wheelGeometry, undefined, positions.length]}>
        <meshBasicMaterial color={iconColor} />
      </instancedMesh>

      {/* Wheel hub - LARGE */}
      <instancedMesh ref={hubRef} args={[undefined, undefined, positions.length]}>
        <circleGeometry args={[2.5, 8]} />
        <meshBasicMaterial color={COLORS.white} />
      </instancedMesh>
    </>
  );
}

// ============ TRAFFIC VIOLATION MARKERS ============
// Warning triangle/diamond markers

interface TrafficViolationMarkersProps {
  positions: [number, number, number][];
  poleColor?: string;
  iconColor?: string;
  poleHeight?: number;
}

export function TrafficViolationMarkers({
  positions,
  poleColor = COLORS.yellow500,
  iconColor = COLORS.yellow400,
  poleHeight = 30,
}: TrafficViolationMarkersProps) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const diamondRef = useRef<THREE.InstancedMesh>(null);
  const exclamationRef = useRef<THREE.InstancedMesh>(null);

  // Diamond/warning shape - LARGE
  const diamondGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 6);
    shape.lineTo(6, 0);
    shape.lineTo(0, -6);
    shape.lineTo(-6, 0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  useEffect(() => {
    if (!poleRef.current || !diamondRef.current || !exclamationRef.current || positions.length === 0) return;

    const tempObject = new THREE.Object3D();

    positions.forEach((pos, i) => {
      // Thin pole
      tempObject.position.set(pos[0], pos[1], poleHeight / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      poleRef.current!.setMatrixAt(i, tempObject.matrix);

      // Warning diamond at top - LARGE
      tempObject.position.set(pos[0], pos[1], poleHeight + 8);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      diamondRef.current!.setMatrixAt(i, tempObject.matrix);

      // Exclamation mark - LARGE
      tempObject.position.set(pos[0], pos[1], poleHeight + 8);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      exclamationRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    diamondRef.current.instanceMatrix.needsUpdate = true;
    exclamationRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, poleHeight]);

  if (positions.length === 0) return null;

  return (
    <>
      {/* Poles - thicker */}
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]}>
        <cylinderGeometry args={[0.8, 0.8, poleHeight, 6]} />
        <meshBasicMaterial color={poleColor} />
      </instancedMesh>

      {/* Warning diamond */}
      <instancedMesh ref={diamondRef} args={[diamondGeometry, undefined, positions.length]}>
        <meshBasicMaterial color={iconColor} side={THREE.DoubleSide} />
      </instancedMesh>

      {/* Exclamation mark - LARGE */}
      <instancedMesh ref={exclamationRef} args={[undefined, undefined, positions.length]}>
        <boxGeometry args={[1.5, 1.5, 5]} />
        <meshBasicMaterial color={COLORS.slate700} />
      </instancedMesh>
    </>
  );
}

// ============ PARKING MARKERS ============
// P symbol on pole

interface ParkingMarkersProps {
  startPositions: [number, number, number][];
  color?: string;
}

export function ParkingMarkers({
  startPositions,
  color = COLORS.cyan500,
}: ParkingMarkersProps) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const signRef = useRef<THREE.InstancedMesh>(null);

  const poleHeight = 28;

  useEffect(() => {
    if (!poleRef.current || !signRef.current || startPositions.length === 0) return;

    const tempObject = new THREE.Object3D();

    startPositions.forEach((pos, i) => {
      // Pole
      tempObject.position.set(pos[0], pos[1], poleHeight / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      poleRef.current!.setMatrixAt(i, tempObject.matrix);

      // P sign (circle)
      tempObject.position.set(pos[0], pos[1], poleHeight + 1.5);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      signRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    signRef.current.instanceMatrix.needsUpdate = true;
  }, [startPositions]);

  if (startPositions.length === 0) return null;

  return (
    <>
      {/* Poles */}
      <instancedMesh ref={poleRef} args={[undefined, undefined, startPositions.length]}>
        <cylinderGeometry args={[0.25, 0.25, poleHeight, 6]} />
        <meshBasicMaterial color={color} />
      </instancedMesh>

      {/* P sign circle */}
      <instancedMesh ref={signRef} args={[undefined, undefined, startPositions.length]}>
        <circleGeometry args={[2, 16]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}

// ============ TREE MARKERS ============
// Stylized tree markers (taller, more visible)

interface TreeMarkersProps {
  positions: [number, number, number][];
  trunkColor?: string;
  canopyColor?: string;
}

export function TreeMarkers({
  positions,
  trunkColor = COLORS.orange600,
  canopyColor = COLORS.green500,
}: TreeMarkersProps) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);

  const trunkHeight = 12;
  const canopyRadius = 5;

  useEffect(() => {
    if (!trunkRef.current || !canopyRef.current || positions.length === 0) return;

    const tempObject = new THREE.Object3D();
    const seed = (i: number) => ((i * 127) % 100) / 100;

    positions.forEach((pos, i) => {
      const heightVar = 0.8 + seed(i) * 0.4;
      const canopyVar = 0.8 + seed(i + 50) * 0.4;

      // Trunk
      tempObject.position.set(pos[0], pos[1], (trunkHeight * heightVar) / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, heightVar);
      tempObject.updateMatrix();
      trunkRef.current!.setMatrixAt(i, tempObject.matrix);

      // Canopy (sphere)
      tempObject.position.set(pos[0], pos[1], trunkHeight * heightVar + canopyRadius * canopyVar * 0.6);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(canopyVar, canopyVar, canopyVar * 0.7);
      tempObject.updateMatrix();
      canopyRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <>
      {/* Trunks */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, positions.length]}>
        <cylinderGeometry args={[0.5, 0.7, trunkHeight, 6]} />
        <meshBasicMaterial color={trunkColor} />
      </instancedMesh>

      {/* Canopies */}
      <instancedMesh ref={canopyRef} args={[undefined, undefined, positions.length]}>
        <sphereGeometry args={[canopyRadius, 8, 6]} />
        <meshBasicMaterial color={canopyColor} />
      </instancedMesh>
    </>
  );
}
