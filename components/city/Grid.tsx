'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Grid constants
export const GRID_ANGLE = 44.9 * (Math.PI / 180);
const GRID_SPACING = 24; // meters between dots

// Responsive extents based on screen width
export const GRID_EXTENTS = {
  large: 2500,  // Desktop (>1400px)
  medium: 1600, // Tablet (>900px)
  small: 800,   // Mobile - focused on ~4 building blocks
};

// Animation constants - subtle hover effect
const PROXIMITY = 200; // radius of mouse influence
const RETURN_SPEED = 0.08; // faster elastic return for snappier feel
const SCALE_MULTIPLIER = 1.5; // max scale boost (1 + 1.5 = 2.5x at center)

// Generate rotated dot grid
function generateDotGrid(extent: number, spacing: number, angle: number) {
  const dots: { x: number; y: number; ox: number; oy: number }[] = [];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const gridExtent = extent * 1.5;
  for (let x = -gridExtent; x <= gridExtent; x += spacing) {
    for (let y = -gridExtent; y <= gridExtent; y += spacing) {
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;

      if (Math.abs(rx) <= extent && Math.abs(ry) <= extent) {
        dots.push({ x: rx, y: ry, ox: 0, oy: 0 }); // ox, oy = offset
      }
    }
  }
  return dots;
}

interface DotGridProps {
  color?: string;
  opacity?: number;
  extent?: number;
}

export function DotGrid({
  color = '#596689',
  opacity = 0.7,
  extent = GRID_EXTENTS.large,
}: DotGridProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera, gl } = useThree();

  // Generate dots based on extent - recalculate when extent changes
  const dots = useMemo(() => generateDotGrid(extent, GRID_SPACING, GRID_ANGLE), [extent]);

  // Mouse state
  const mouseRef = useRef({ x: 0, y: 0, lastMoveTime: 0, isActive: false });
  const worldPosRef = useRef(new THREE.Vector3());
  const localPosRef = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  // Plane at z=-35 (scene at z=-40, grid at z=5 relative to scene)
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 35));
  const tempObject = useRef(new THREE.Object3D());
  // Track current scale for smooth transitions
  const scalesRef = useRef<Float32Array | null>(null);

  // Initialize instance matrices and scales array
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const obj = tempObject.current;

    // Initialize scales array
    scalesRef.current = new Float32Array(dots.length).fill(1);

    dots.forEach((dot, i) => {
      obj.position.set(dot.x, dot.y, 0);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dots]);

  // Handle mouse move - track activity and NDC position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = mouseRef.current;

      // Check if mouse is within canvas bounds
      const inBounds =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inBounds) {
        // Convert to NDC
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouse.lastMoveTime = performance.now();
        mouse.isActive = true;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    gl.domElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gl]);

  // Animation frame - smooth proximity-based scale with activity detection
  useFrame(() => {
    if (!meshRef.current || !scalesRef.current) return;
    const mesh = meshRef.current;
    const mouse = mouseRef.current;
    const obj = tempObject.current;
    const scales = scalesRef.current;

    // Check if mouse has been inactive for more than 150ms
    const now = performance.now();
    const INACTIVE_THRESHOLD = 150;
    if (mouse.isActive && now - mouse.lastMoveTime > INACTIVE_THRESHOLD) {
      mouse.isActive = false;
    }

    // Raycast to get world position of mouse (only if active)
    let mouseLocal = localPosRef.current;
    if (mouse.isActive) {
      raycaster.current.setFromCamera({ x: mouse.x, y: mouse.y }, camera);
      raycaster.current.ray.intersectPlane(plane.current, worldPosRef.current);

      // Transform world position to local space (rotate by +GRID_ANGLE to undo scene's -GRID_ANGLE rotation)
      const cos = Math.cos(GRID_ANGLE);
      const sin = Math.sin(GRID_ANGLE);
      const wx = worldPosRef.current.x;
      const wy = worldPosRef.current.y;
      localPosRef.current.set(wx * cos - wy * sin, wx * sin + wy * cos, 0);
    }

    const proxSq = PROXIMITY * PROXIMITY;
    let needsUpdate = false;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      // Calculate target scale
      let targetScale = 1;
      if (mouse.isActive) {
        const dx = dot.x - mouseLocal.x;
        const dy = dot.y - mouseLocal.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < proxSq) {
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / PROXIMITY;
          targetScale = 1 + t * t * SCALE_MULTIPLIER;
        }
      }

      // Smoothly interpolate current scale toward target
      const currentScale = scales[i];
      const diff = targetScale - currentScale;

      // Only update if there's a meaningful difference
      if (Math.abs(diff) > 0.001) {
        scales[i] = currentScale + diff * RETURN_SPEED;
        needsUpdate = true;
      } else if (scales[i] !== targetScale) {
        scales[i] = targetScale;
        needsUpdate = true;
      }

      // Update position and scale
      obj.position.set(dot.x, dot.y, 0);
      obj.scale.set(scales[i], scales[i], 1);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }

    if (needsUpdate) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      key={extent}
      ref={meshRef}
      args={[undefined, undefined, dots.length]}
      frustumCulled={false}
      position={[0, 0, 5]} // Render above other elements
    >
      <circleGeometry args={[1.8, 8]} />
      <meshBasicMaterial
        transparent
        opacity={opacity}
        color={color}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

