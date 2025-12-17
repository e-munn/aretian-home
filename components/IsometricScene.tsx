'use client';

import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#00C217" />
    </mesh>
  );
}

function TestBox() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#00C217" />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      {/* Isometric camera - equal angles on all axes */}
      <OrthographicCamera
        makeDefault
        zoom={50}
        position={[10, 10, 10]}
        near={0.1}
        far={1000}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

      {/* Ground plane */}
      <Ground />

      {/* Test box to verify scene is working */}
      <TestBox />
    </>
  );
}

export default function IsometricScene() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: '#010029',
      }}
    >
      <Canvas gl={{ antialias: true }}>
        <Scene />
      </Canvas>
    </div>
  );
}
