'use client';
import React, { useRef, useState, useEffect } from 'react';

import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  useFBX,
  useAnimations,
  AccumulativeShadows,
  RandomizedLight,
  Edges,
  OrbitControls,
  Outlines,
  Environment,
} from '@react-three/drei';
import _ from 'lodash';
import { Button } from '../ui/button';

const Model = (props: any) => {
  // const { nodes } = useGLTF('./block.glb')
  const [hovered, hover] = useState(false);
  const ref = useRef();

  const model = useGLTF('./untitled3.glb');
  const { nodes, materials, animations } = model;
  const { actions, names } = useAnimations(animations, ref);
  useEffect(() => {
    console.log(actions[names[0]]?.reset().fadeIn(0.1).play());
    actions[names[0]]?.reset().fadeIn(0.1).play();

    // myMesh.current.rotation.x = Math.sin(clock.getElapsedTime()) * 0.1
  }, []);

  return (
    <mesh
      ref={ref}
      castShadow
      receiveShadow
      scale={0.00003}
      // animations={animations}
      // onPointerOver={() => hover(true)}
      // onPointerOut={() => hover(false)}
      //   geometry={nodes.Cube.geometry}
      geometry={nodes[_.keys(nodes)[1]].geometry}
      {...props}
    >
      <meshStandardMaterial roughness={1} metalness={0.001} color={'#94a3b8'} />
      {/* <Edges linewidth={0.1} threshold={12} color={hovered ? '#FFF' : '#fff'} /> */}
      {/* <Outlines thickness={0.01} color={hovered ? '#c02040' : 'black'} /> */}
    </mesh>
  );
};

const Three: React.FC = () => {
  return (
    <Canvas shadows camera={{ position: [2, 10, 0], fov: 80 }}>
      <ambientLight intensity={Math.PI / 8} />
      {/* <spotLight intensity={Math.PI} decay={0} angle={0.5} castShadow position={[5, 2.5, 5]} shadow-mapSize={128} /> */}
      <Model position={[0, 0, 0]} rotation={[0, 0.5, 0.15]} />
      {/* <AccumulativeShadows frames={10} temporal opacity={0.2}>
        <RandomizedLight radius={0.1} position={[1, 2.5, 5]} />
      </AccumulativeShadows> */}
      <OrbitControls makeDefault enableZoom={false} />
      <Environment preset='city' />
    </Canvas>
  );
};
export default Three;
