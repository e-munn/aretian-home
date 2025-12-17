'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useState } from 'react';

// Define three states with matching polygon structures (12 buildings each)
// Each building stays in the same position, only shape changes
const buildingStates = {
  grid: {
    // Blue grid pattern - rectangular buildings
    buildings: [
      'M 50,50 L 130,50 L 130,170 L 50,170 Z',      // Top-left
      'M 145,50 L 200,50 L 200,150 L 145,150 Z',     // Top-center-left
      'M 215,50 L 280,50 L 280,140 L 215,140 Z',     // Top-center-right
      'M 50,180 L 140,180 L 140,260 L 50,260 Z',     // Middle-left
      'M 150,165 L 205,165 L 205,270 L 150,270 Z',   // Middle-center-left
      'M 215,155 L 290,155 L 290,225 L 215,225 Z',   // Middle-center-right
      'M 305,80 L 360,80 L 360,180 L 305,180 Z',     // Top-right
      'M 50,275 L 120,275 L 120,360 L 50,360 Z',     // Bottom-left
      'M 135,280 L 210,280 L 210,360 L 135,360 Z',   // Bottom-center-left
      'M 225,235 L 290,235 L 290,350 L 225,350 Z',   // Bottom-center-right
      'M 305,195 L 375,195 L 375,285 L 305,285 Z',   // Middle-right
      'M 305,300 L 360,300 L 360,360 L 305,360 Z',   // Bottom-right
    ],
    colors: ['#2563eb', '#1d4ed8', '#1e40af', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#3b82f6'],
    rotation: -25,
  },
  organic: {
    // Gray organic pattern - slightly warped shapes, same positions
    buildings: [
      'M 50,55 L 128,52 L 132,168 L 52,172 Z',       // Top-left (slight warp)
      'M 145,52 L 198,55 L 202,148 L 147,152 Z',     // Top-center-left
      'M 215,53 L 278,50 L 282,142 L 218,145 Z',     // Top-center-right
      'M 50,182 L 138,178 L 142,262 L 52,265 Z',     // Middle-left
      'M 150,167 L 203,163 L 207,272 L 152,273 Z',   // Middle-center-left
      'M 215,157 L 288,153 L 292,227 L 218,228 Z',   // Middle-center-right
      'M 305,82 L 358,78 L 362,182 L 308,183 Z',     // Top-right
      'M 50,277 L 118,273 L 122,362 L 52,363 Z',     // Bottom-left
      'M 135,282 L 208,278 L 212,362 L 138,363 Z',   // Bottom-center-left
      'M 225,237 L 288,233 L 292,352 L 228,353 Z',   // Bottom-center-right
      'M 305,197 L 373,193 L 377,287 L 308,288 Z',   // Middle-right
      'M 305,302 L 358,298 L 362,362 L 308,363 Z',   // Bottom-right
    ],
    colors: ['#e5e7eb', '#d1d5db', '#f3f4f6', '#e5e7eb', '#d1d5db', '#f3f4f6', '#e5e7eb', '#d1d5db', '#f3f4f6', '#e5e7eb', '#d1d5db', '#f3f4f6'],
    rotation: -15,
  },
  angular: {
    // Red angular pattern - skewed shapes, same positions
    buildings: [
      'M 55,60 L 125,45 L 135,165 L 48,175 Z',       // Top-left (angled)
      'M 150,45 L 195,52 L 205,145 L 142,155 Z',     // Top-center-left
      'M 220,48 L 275,43 L 285,138 L 212,148 Z',     // Top-center-right
      'M 55,185 L 135,175 L 145,265 L 48,268 Z',     // Middle-left
      'M 155,168 L 200,162 L 210,275 L 148,273 Z',   // Middle-center-left
      'M 220,158 L 285,152 L 295,230 L 213,228 Z',   // Middle-center-right
      'M 310,85 L 355,72 L 365,185 L 302,183 Z',     // Top-right
      'M 55,280 L 115,270 L 125,365 L 48,368 Z',     // Bottom-left
      'M 140,283 L 205,275 L 215,365 L 133,365 Z',   // Bottom-center-left
      'M 230,240 L 285,230 L 295,355 L 223,358 Z',   // Bottom-center-right
      'M 310,200 L 370,188 L 380,290 L 303,293 Z',   // Middle-right
      'M 310,305 L 355,295 L 365,365 L 303,366 Z',   // Bottom-right
    ],
    colors: ['#dc2626', '#b91c1c', '#991b1b', '#dc2626', '#b91c1c', '#991b1b', '#dc2626', '#b91c1c', '#991b1b', '#dc2626', '#b91c1c', '#991b1b'],
    rotation: 30,
  },
};

export default function BuildingGroups() {
  const [currentState, setCurrentState] = useState(0);
  const controls = useAnimationControls();
  const stateKeys = Object.keys(buildingStates) as Array<keyof typeof buildingStates>;
  const currentConfig = buildingStates[stateKeys[currentState]];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState((prev) => (prev + 1) % stateKeys.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-full max-w-2xl"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.g
            animate={{ rotate: currentConfig.rotation }}
            transition={{
              type: 'spring',
              stiffness: 50,
              damping: 15,
              mass: 1,
            }}
            style={{ transformOrigin: '200px 200px' }}
          >
            {currentConfig.buildings.map((path, index) => (
              <motion.path
                key={index}
                d={path}
                animate={{
                  d: currentConfig.buildings[index],
                  fill: currentConfig.colors[index],
                }}
                transition={{
                  type: 'spring',
                  stiffness: 60,
                  damping: 18,
                  mass: 1.2,
                  duration: 1.5,
                }}
                opacity={0.85}
              />
            ))}
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
