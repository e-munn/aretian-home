'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Grid constants
const GRID_ANGLE = 44.9 * (Math.PI / 180);
const GRID_SPACING = 12; // meters between dots
const GRID_EXTENT = 2500; // meters

// Animation constants
const PROXIMITY = 150; // radius of mouse influence
const SHOCK_RADIUS = 300; // radius of click effect
const SHOCK_STRENGTH = 8; // how far dots get pushed
const RETURN_SPEED = 0.03; // elastic return speed
const SPEED_TRIGGER = 50; // mouse speed to trigger push
const PUSH_STRENGTH = 0.15; // velocity-based push multiplier

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
  activeColor?: string;
  opacity?: number;
}

export function DotGrid({
  color = '#596689',      // aretianBlue.400
  activeColor = '#c5c9d6', // aretianBlue.100
  opacity = 0.6
}: DotGridProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera, gl } = useThree();

  // Debug: log colors on mount
  useEffect(() => {
    console.log('DotGrid colors:', { color, activeColor, opacity });
  }, [color, activeColor, opacity]);

  // Store dot data with offsets
  const dotsRef = useRef(generateDotGrid(GRID_EXTENT, GRID_SPACING, GRID_ANGLE));
  const dots = dotsRef.current;

  // Mouse state
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, speed: 0, lastX: 0, lastY: 0, lastTime: 0 });
  const worldPosRef = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

  // Colors
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const glowColor = useMemo(() => new THREE.Color(activeColor), [activeColor]);
  const tempColor = useRef(new THREE.Color());
  const tempObject = useRef(new THREE.Object3D());

  // Initialize instance matrices and colors
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const obj = tempObject.current;
    const col = tempColor.current;

    dots.forEach((dot, i) => {
      obj.position.set(dot.x, dot.y, 0);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
      // Set initial color
      col.copy(baseColor);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dots, baseColor]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const now = performance.now();
      const mouse = mouseRef.current;

      // Calculate velocity
      const dt = mouse.lastTime ? now - mouse.lastTime : 16;
      const dx = e.clientX - mouse.lastX;
      const dy = e.clientY - mouse.lastY;
      mouse.vx = (dx / dt) * 1000;
      mouse.vy = (dy / dt) * 1000;
      mouse.speed = Math.hypot(mouse.vx, mouse.vy);
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
      mouse.lastTime = now;

      // Convert to NDC
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast to get world position
      raycaster.current.setFromCamera({ x: ndcX, y: ndcY }, camera);
      const intersection = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, intersection);

      if (intersection) {
        // Apply shock wave
        for (const dot of dots) {
          const dx = dot.x - intersection.x;
          const dy = dot.y - intersection.y;
          const dist = Math.hypot(dx, dy);

          if (dist < SHOCK_RADIUS && dist > 0) {
            const falloff = 1 - dist / SHOCK_RADIUS;
            const pushX = (dx / dist) * SHOCK_STRENGTH * falloff * falloff;
            const pushY = (dy / dist) * SHOCK_STRENGTH * falloff * falloff;
            dot.ox += pushX;
            dot.oy += pushY;
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    gl.domElement.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [camera, gl, dots]);

  // Animation frame
  useFrame(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const mouse = mouseRef.current;
    const obj = tempObject.current;
    const col = tempColor.current;

    // Raycast to get world position of mouse
    raycaster.current.setFromCamera({ x: mouse.x, y: mouse.y }, camera);
    raycaster.current.ray.intersectPlane(plane.current, worldPosRef.current);
    const mouseWorld = worldPosRef.current;

    const proxSq = PROXIMITY * PROXIMITY;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      // Distance to mouse
      const dx = dot.x - mouseWorld.x;
      const dy = dot.y - mouseWorld.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      // Speed-based push
      if (mouse.speed > SPEED_TRIGGER && distSq < proxSq && dist > 0) {
        const pushX = (dx / dist) * mouse.speed * PUSH_STRENGTH * 0.001;
        const pushY = (dy / dist) * mouse.speed * PUSH_STRENGTH * 0.001;
        dot.ox += pushX;
        dot.oy += pushY;
      }

      // Elastic return
      dot.ox *= (1 - RETURN_SPEED);
      dot.oy *= (1 - RETURN_SPEED);

      // Clamp offset
      const maxOffset = 50;
      dot.ox = Math.max(-maxOffset, Math.min(maxOffset, dot.ox));
      dot.oy = Math.max(-maxOffset, Math.min(maxOffset, dot.oy));

      // Update position
      obj.position.set(dot.x + dot.ox, dot.y + dot.oy, 0);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);

      // Proximity-based color
      if (distSq < proxSq) {
        const t = 1 - dist / PROXIMITY;
        col.copy(baseColor).lerp(glowColor, t * t);
      } else {
        col.copy(baseColor);
      }
      mesh.setColorAt(i, col);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, dots.length]} frustumCulled={false}>
      <circleGeometry args={[1.5, 8]} />
      <meshBasicMaterial transparent opacity={opacity} vertexColors />
    </instancedMesh>
  );
}

export { GRID_ANGLE };
