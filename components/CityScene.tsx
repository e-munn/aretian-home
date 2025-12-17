'use client'

import { useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useLayerStore } from '@/stores/layerStore'

// City components
import { DotGrid, GRID_ANGLE } from './city/Grid'
import { Roads, FlowParticles, RoadData } from './city/Roads'
import { InstancedPalmTrees, fetchBarcelonaTrees } from './city/Trees'
import { DetailedBuildings, fetchOvertureBuildings, BuildingData } from './city/Buildings'
import {
  ParkingZones,
  BikeLanes,
  fetchBusStops,
  fetchBicingStations,
  fetchTrafficViolations,
  fetchParkingZones,
  fetchBikeLanes,
  BusStopData,
  BicingStationData,
  TrafficViolationData,
  ParkingZoneData,
  BikeLaneData,
} from './city/Infrastructure'
import { BusStopMarkers, BicingMarkers, TrafficViolationMarkers } from './city/Markers'
import { fetchOSMData, parseRoads } from './city/data'

// Visual settings
const BG_COLOR = '#0f0f1a'
const BUILDING_COLOR = '#18182b'
const BUILDING_OPACITY = 0.87

// Layer visibility for animations
export interface LayerVisibility {
  grid: boolean
  roads: boolean
  buildings: boolean
  trees: boolean
  parking: boolean
  bikeLanes: boolean
  busStops: boolean
  bicingStations: boolean
  trafficViolations: boolean
  flowParticles: boolean
}

const ALL_VISIBLE: LayerVisibility = {
  grid: true,
  roads: true,
  buildings: true,
  trees: true,
  parking: true,
  bikeLanes: true,
  busStops: true,
  bicingStations: true,
  trafficViolations: true,
  flowParticles: true,
}

// Scene
interface SceneProps {
  roads: RoadData[]
  trees: [number, number, number][]
  buildings: BuildingData[]
  busStops: BusStopData[]
  bicingStations: BicingStationData[]
  trafficViolations: TrafficViolationData[]
  parkingZones: ParkingZoneData[]
  bikeLanes: BikeLaneData[]
  layers: LayerVisibility
  buildingColor: string
  buildingOpacity: number
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
  layers,
  buildingColor,
  buildingOpacity,
}: SceneProps) {
  const { camera, size } = useThree()
  const [baseOffset, setBaseOffset] = useState({ x: 0, y: 0 })

  const dist = 500
  const orbitAngle = Math.PI / 4
  const elevation = Math.atan(1 / Math.sqrt(2))

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
      {layers.grid && <DotGrid color="#596689" activeColor="#c5c9d6" opacity={0.6} />}
      {layers.roads && <Roads roads={roads} />}
      {layers.parking && <ParkingZones zones={parkingZones} opacity={0.6} />}
      {layers.bikeLanes && <BikeLanes lanes={bikeLanes} color='#44cc66' lineWidth={2} />}
      {layers.trees && <InstancedPalmTrees positions={trees} />}
      {layers.buildings && (
        <DetailedBuildings
          buildings={buildings}
          color={buildingColor}
          fillOpacity={buildingOpacity}
          edgeOpacity={0}
        />
      )}
      {layers.busStops && <BusStopMarkers positions={busStops.map((s) => s.position)} />}
      {layers.bicingStations && <BicingMarkers positions={bicingStations.map((s) => s.position)} />}
      {layers.trafficViolations && <TrafficViolationMarkers positions={trafficViolations.map((v) => v.position)} />}
      {layers.flowParticles && <FlowParticles roads={roads} />}
    </group>
  )
}

// Main component
interface CitySceneProps {
  layers?: Partial<LayerVisibility>
}

export default function CityScene({ layers: layerOverrides }: CitySceneProps = {}) {
  const [roads, setRoads] = useState<RoadData[]>([])
  const [trees, setTrees] = useState<[number, number, number][]>([])
  const [buildings, setBuildings] = useState<BuildingData[]>([])
  const [busStops, setBusStops] = useState<BusStopData[]>([])
  const [bicingStations, setBicingStations] = useState<BicingStationData[]>([])
  const [trafficViolations, setTrafficViolations] = useState<TrafficViolationData[]>([])
  const [parkingZones, setParkingZones] = useState<ParkingZoneData[]>([])
  const [bikeLanes, setBikeLanes] = useState<BikeLaneData[]>([])

  // Building appearance controls
  const [buildingColor, setBuildingColor] = useState(BUILDING_COLOR)
  const [buildingOpacity, setBuildingOpacity] = useState(BUILDING_OPACITY)

  // Layer loading store
  const setLoaded = useLayerStore((state) => state.setLoaded)

  const layers: LayerVisibility = { ...ALL_VISIBLE, ...layerOverrides }

  // Grid is always immediately available (no data fetch)
  useEffect(() => {
    setLoaded('grid')
  }, [setLoaded])

  // Fetch roads data
  useEffect(() => {
    fetchOSMData()
      .then((data) => {
        setRoads(parseRoads(data))
        setLoaded('roads')
      })
      .catch(console.error)
  }, [setLoaded])

  // Fetch trees data
  useEffect(() => {
    fetchBarcelonaTrees()
      .then((data) => {
        setTrees(data)
        setLoaded('trees')
      })
      .catch(console.error)
  }, [setLoaded])

  // Fetch buildings data
  useEffect(() => {
    fetchOvertureBuildings()
      .then((data) => {
        setBuildings(data)
        setLoaded('buildings')
      })
      .catch(console.error)
  }, [setLoaded])

  // Fetch bus stops data
  useEffect(() => {
    fetchBusStops()
      .then((data) => {
        setBusStops(data)
        setLoaded('busStops')
      })
      .catch(console.error)
  }, [setLoaded])

  // Fetch bicing stations data
  useEffect(() => {
    fetchBicingStations()
      .then((data) => {
        setBicingStations(data)
        setLoaded('bicingStations')
      })
      .catch(console.error)
  }, [setLoaded])

  // Fetch traffic violations data
  useEffect(() => {
    fetchTrafficViolations()
      .then((data) => {
        setTrafficViolations(data)
        setLoaded('trafficViolations')
      })
      .catch(console.error)
  }, [setLoaded])

  // Fetch parking zones data
  useEffect(() => {
    fetchParkingZones()
      .then((data) => {
        setParkingZones(data)
        setLoaded('parking')
      })
      .catch(console.error)
  }, [setLoaded])

  // Fetch bike lanes data
  useEffect(() => {
    fetchBikeLanes()
      .then((data) => {
        setBikeLanes(data)
        setLoaded('bikeLanes')
      })
      .catch(console.error)
  }, [setLoaded])

  // Flow particles are available once roads are loaded
  useEffect(() => {
    if (roads.length > 0) {
      setLoaded('flowParticles')
    }
  }, [roads, setLoaded])

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <Canvas
        orthographic
        camera={{ zoom: 0.8, position: [0, 0, 500], near: -1000, far: 2000 }}
        style={{ width: '100%', height: '100%', background: BG_COLOR }}
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
            layers={layers}
            buildingColor={buildingColor}
            buildingOpacity={buildingOpacity}
          />
        )}
      </Canvas>

      {/* Building Controls - hidden */}
      <div
        style={{
          display: 'none',
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(0,0,0,0.7)',
          padding: '12px 16px',
          borderRadius: 8,
          flexDirection: 'column',
          gap: 12,
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'white',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ opacity: 0.7, minWidth: 50 }}>Color</label>
          <input
            type="color"
            value={buildingColor}
            onChange={(e) => setBuildingColor(e.target.value)}
            style={{
              width: 32,
              height: 24,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: 'transparent',
            }}
          />
          <span style={{ opacity: 0.5, fontFamily: 'monospace' }}>{buildingColor}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ opacity: 0.7, minWidth: 50 }}>Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={buildingOpacity}
            onChange={(e) => setBuildingOpacity(parseFloat(e.target.value))}
            style={{ width: 80 }}
          />
          <span style={{ opacity: 0.5, fontFamily: 'monospace', minWidth: 36 }}>
            {buildingOpacity.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
