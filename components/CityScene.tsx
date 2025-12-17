'use client'

import { useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// City components
import { DotGrid, GRID_ANGLE, GRID_EXTENTS } from './city/Grid'
import { Roads, FlowParticles } from './city/Roads'
import { InstancedPalmTrees } from './city/Trees'
import { DetailedBuildings } from './city/Buildings'
import { ParkingZones, BikeLanes } from './city/Infrastructure'
import { BusStopMarkers, BicingMarkers, TrafficViolationMarkers } from './city/Markers'
import { useCityData, CityData } from '@/hooks/useCityData'
import { useLayerStore, LayerKey } from '@/stores/layerStore'
import ColorPicker from './ui/ColorPicker'

// Visual settings
const BG_COLOR = '#0f0f1a'
const BUILDING_COLOR = '#3c324e'
const BUILDING_OPACITY = 0.87

// Scene
interface SceneProps extends CityData {
  revealed: Record<LayerKey, boolean>
  buildingColor: string
}

function Scene({
  roads,
  trees,
  buildings,
  busStops,
  bicingStations,
  trafficViolations,
  parkingZones,
  bikeLanes,
  revealed,
  buildingColor,
}: SceneProps) {
  const { camera, size } = useThree()
  const [baseOffset, setBaseOffset] = useState({ x: 0, y: 0 })

  const dist = 500
  const orbitAngle = Math.PI / 4
  const elevation = Math.atan(1 / Math.sqrt(2))

  // Determine grid extent based on canvas size (more reliable than window.innerWidth in Three.js)
  const gridExtent = size.width > 1400
    ? GRID_EXTENTS.large
    : size.width > 900
      ? GRID_EXTENTS.medium
      : GRID_EXTENTS.small

  // Calculate responsive offset and zoom based on viewport
  useEffect(() => {
    const aspect = size.width / size.height
    const orthoCamera = camera as THREE.OrthographicCamera

    // Base zoom scales with viewport - use the smaller dimension
    // Reference: 1920x1080 should have zoom ~0.8
    const baseZoom = Math.min(size.width / 1920, size.height / 1080) * 0.85
    orthoCamera.zoom = Math.max(0.4, Math.min(1.2, baseZoom))

    // Offset to position scene - shifts right and up on wider screens
    // On narrow screens, center more
    let offsetX: number
    let offsetY: number

    if (aspect > 1.4) {
      // Wide screen (desktop) - push scene to the right
      offsetX = 250 + (aspect - 1.4) * 50
      offsetY = -150
    } else if (aspect > 1) {
      // Medium width - transition
      offsetX = 150 + (aspect - 1) * 100
      offsetY = -100
    } else {
      // Narrow (mobile/tablet) - center the scene more
      offsetX = 50
      offsetY = 0
    }

    const finalX = offsetX + baseOffset.x
    const finalY = offsetY + baseOffset.y

    camera.position.set(
      dist * Math.cos(orbitAngle) * Math.cos(elevation) + finalX,
      dist * Math.sin(orbitAngle) * Math.cos(elevation) + finalY,
      dist * Math.sin(elevation)
    )
    camera.up.set(0, 0, 1)
    camera.lookAt(finalX, finalY, 0)
    camera.updateProjectionMatrix()
  }, [camera, size, baseOffset])

  // Keyboard controls for camera position
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 20
      if (e.key === 'ArrowLeft') {
        setBaseOffset((prev) => ({ ...prev, x: prev.x - step }))
      } else if (e.key === 'ArrowRight') {
        setBaseOffset((prev) => ({ ...prev, x: prev.x + step }))
      } else if (e.key === 'ArrowUp') {
        setBaseOffset((prev) => ({ ...prev, y: prev.y + step }))
      } else if (e.key === 'ArrowDown') {
        setBaseOffset((prev) => ({ ...prev, y: prev.y - step }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <group rotation={[0, 0, -GRID_ANGLE]} position={[0, 0, -40]}>
      {revealed.grid && <DotGrid color="#596689" opacity={0.7} extent={gridExtent} />}
      {revealed.roads && <Roads roads={roads} />}
      {revealed.parking && <ParkingZones zones={parkingZones} opacity={0.6} />}
      {revealed.bikeLanes && <BikeLanes lanes={bikeLanes} color='#44cc66' lineWidth={2} />}
      {revealed.trees && <InstancedPalmTrees positions={trees} />}
      {revealed.flowParticles && <FlowParticles roads={roads} />}
      {revealed.buildings && (
        <DetailedBuildings
          buildings={buildings}
          color={buildingColor}
          fillOpacity={BUILDING_OPACITY}
          edgeOpacity={0}
        />
      )}
      {revealed.busStops && <BusStopMarkers positions={busStops.map((s) => s.position)} />}
      {revealed.bicingStations && <BicingMarkers positions={bicingStations.map((s) => s.position)} />}
      {revealed.trafficViolations && <TrafficViolationMarkers positions={trafficViolations.map((v) => v.position)} />}
    </group>
  )
}

// Main component
export default function CityScene() {
  // Use the centralized data loading hook
  const { data } = useCityData()
  const { roads, trees, buildings, busStops, bicingStations, trafficViolations, parkingZones, bikeLanes } = data

  // Get revealed state from store
  const revealed = useLayerStore((state) => state.revealed)

  // Building color control
  const [buildingColor, setBuildingColor] = useState(BUILDING_COLOR)

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <Canvas
        orthographic
        camera={{ zoom: 0.8, position: [0, 0, 500], near: -1000, far: 2000 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
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
            revealed={revealed}
            buildingColor={buildingColor}
          />
        )}
      </Canvas>

      {/* Building Color Picker */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 100,
        }}
      >
        <ColorPicker
          initialColor={BUILDING_COLOR}
          onColorChange={setBuildingColor}
        />
      </div>
    </div>
  )
}
