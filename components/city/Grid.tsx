'use client';

import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RADIUS_M } from './data';

// Grid constants
const GRID_ANGLE = 44.9 * (Math.PI / 180);
const GRID_SPACING = 10; // meters between dots

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

interface DotGridProps {
  color?: string;
  opacity?: number;
}

export function DotGrid({ color = '#6a5a50', opacity = 0.35 }: DotGridProps) {
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, dots.length]} frustumCulled>
      <circleGeometry args={[1.2, 6]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </instancedMesh>
  );
}

export { GRID_ANGLE };
