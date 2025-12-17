'use client';

import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Tailwind colors
export const COLORS = {
  blue500: '#3b82f6',
  red500: '#ef4444',
  yellow400: '#facc15',
  green500: '#22c55e',
  white: '#ffffff',
};

// ============ BUS STOP MARKERS ============
// Simple circle on pole - BLUE

interface BusStopMarkersProps {
  positions: [number, number, number][];
  color?: string;
  poleHeight?: number;
}

export function BusStopMarkers({
  positions,
  color = COLORS.blue500,
  poleHeight = 30,
}: BusStopMarkersProps) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const circleRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!poleRef.current || !circleRef.current || positions.length === 0) return;

    const tempObject = new THREE.Object3D();

    positions.forEach((pos, i) => {
      // Pole
      tempObject.position.set(pos[0], pos[1], poleHeight / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      poleRef.current!.setMatrixAt(i, tempObject.matrix);

      // Circle at top
      tempObject.position.set(pos[0], pos[1], poleHeight + 4);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      circleRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    circleRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, poleHeight]);

  if (positions.length === 0) return null;

  return (
    <>
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]} frustumCulled>
        <cylinderGeometry args={[0.6, 0.6, poleHeight, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </instancedMesh>
      <instancedMesh ref={circleRef} args={[undefined, undefined, positions.length]} frustumCulled>
        <circleGeometry args={[5, 16]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.75} />
      </instancedMesh>
    </>
  );
}

// ============ BICING STATION MARKERS ============
// Simple square on pole - RED

interface BicingMarkersProps {
  positions: [number, number, number][];
  color?: string;
  poleHeight?: number;
}

export function BicingMarkers({
  positions,
  color = COLORS.red500,
  poleHeight = 30,
}: BicingMarkersProps) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const squareRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!poleRef.current || !squareRef.current || positions.length === 0) return;

    const tempObject = new THREE.Object3D();

    positions.forEach((pos, i) => {
      // Pole
      tempObject.position.set(pos[0], pos[1], poleHeight / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      poleRef.current!.setMatrixAt(i, tempObject.matrix);

      // Square at top
      tempObject.position.set(pos[0], pos[1], poleHeight + 4);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      squareRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    squareRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, poleHeight]);

  if (positions.length === 0) return null;

  return (
    <>
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]} frustumCulled>
        <cylinderGeometry args={[0.6, 0.6, poleHeight, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </instancedMesh>
      <instancedMesh ref={squareRef} args={[undefined, undefined, positions.length]} frustumCulled>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.75} />
      </instancedMesh>
    </>
  );
}

// ============ TRAFFIC VIOLATION MARKERS ============
// Simple triangle on pole - YELLOW

interface TrafficViolationMarkersProps {
  positions: [number, number, number][];
  color?: string;
  poleHeight?: number;
}

export function TrafficViolationMarkers({
  positions,
  color = COLORS.yellow400,
  poleHeight = 30,
}: TrafficViolationMarkersProps) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const triangleRef = useRef<THREE.InstancedMesh>(null);

  // Triangle geometry
  const triangleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 5);
    shape.lineTo(5, -3);
    shape.lineTo(-5, -3);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  useEffect(() => {
    if (!poleRef.current || !triangleRef.current || positions.length === 0) return;

    const tempObject = new THREE.Object3D();

    positions.forEach((pos, i) => {
      // Pole
      tempObject.position.set(pos[0], pos[1], poleHeight / 2);
      tempObject.rotation.set(Math.PI / 2, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      poleRef.current!.setMatrixAt(i, tempObject.matrix);

      // Triangle at top
      tempObject.position.set(pos[0], pos[1], poleHeight + 4);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      triangleRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    triangleRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, poleHeight]);

  if (positions.length === 0) return null;

  return (
    <>
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]} frustumCulled>
        <cylinderGeometry args={[0.6, 0.6, poleHeight, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </instancedMesh>
      <instancedMesh ref={triangleRef} args={[triangleGeometry, undefined, positions.length]} frustumCulled>
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.75} />
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
  color = COLORS.blue500,
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
      <instancedMesh ref={poleRef} args={[undefined, undefined, startPositions.length]}>
        <cylinderGeometry args={[0.25, 0.25, poleHeight, 6]} />
        <meshBasicMaterial color={color} />
      </instancedMesh>
      <instancedMesh ref={signRef} args={[undefined, undefined, startPositions.length]}>
        <circleGeometry args={[2, 16]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}

// ============ TREE MARKERS ============
// Stylized tree markers

interface TreeMarkersProps {
  positions: [number, number, number][];
  trunkColor?: string;
  canopyColor?: string;
}

export function TreeMarkers({
  positions,
  trunkColor = '#8b5a2b',
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
      <instancedMesh ref={trunkRef} args={[undefined, undefined, positions.length]}>
        <cylinderGeometry args={[0.5, 0.7, trunkHeight, 6]} />
        <meshBasicMaterial color={trunkColor} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, positions.length]}>
        <sphereGeometry args={[canopyRadius, 8, 6]} />
        <meshBasicMaterial color={canopyColor} />
      </instancedMesh>
    </>
  );
}
