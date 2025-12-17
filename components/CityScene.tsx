'use client'

import { useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'

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
const BG_COLOR = '#3a3958'
const BUILDING_COLOR = '#1B283B'
const BUILDING_OPACITY = 0.82

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

// Dot grid color derived from background
const DOT_COLOR = '#2e2e45' // darkenColor(BG_COLOR, 0.7)

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
}: SceneProps) {
  const { camera } = useThree()
  const [offset, setOffset] = useState({ x: 180, y: 180 })

  const dist = 500
  const orbitAngle = Math.PI / 4
  const elevation = Math.atan(1 / Math.sqrt(2))

  // Update camera position when offset changes
  useEffect(() => {
    camera.position.set(
      dist * Math.cos(orbitAngle) * Math.cos(elevation) + offset.x,
      dist * Math.sin(orbitAngle) * Math.cos(elevation) + offset.y,
      dist * Math.sin(elevation)
    )
    camera.up.set(0, 0, 1)
    camera.lookAt(offset.x, offset.y, 0)
    camera.updateProjectionMatrix()
    console.log('Camera offset:', offset.x, offset.y)
  }, [camera, offset])

  // Keyboard controls for camera position
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 20
      if (e.key === 'ArrowLeft') {
        setOffset((prev) => ({ ...prev, x: prev.x - step }))
      } else if (e.key === 'ArrowRight') {
        setOffset((prev) => ({ ...prev, x: prev.x + step }))
      } else if (e.key === 'ArrowUp') {
        setOffset((prev) => ({ ...prev, y: prev.y + step }))
      } else if (e.key === 'ArrowDown') {
        setOffset((prev) => ({ ...prev, y: prev.y - step }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <group rotation={[0, 0, -GRID_ANGLE]} position={[-100, -100, -80]}>
      {layers.grid && <DotGrid color={DOT_COLOR} opacity={0.5} />}
      {layers.roads && <Roads roads={roads} />}
      {layers.parking && <ParkingZones zones={parkingZones} opacity={0.6} />}
      {layers.bikeLanes && <BikeLanes lanes={bikeLanes} color='#44cc66' lineWidth={2} />}
      {layers.trees && <InstancedPalmTrees positions={trees} />}
      {layers.buildings && (
        <DetailedBuildings
          buildings={buildings}
          color={BUILDING_COLOR}
          fillOpacity={BUILDING_OPACITY}
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

  const layers: LayerVisibility = { ...ALL_VISIBLE, ...layerOverrides }

  // Fetch data
  useEffect(() => {
    fetchOSMData()
      .then((data) => setRoads(parseRoads(data)))
      .catch(console.error)
  }, [])
  useEffect(() => {
    fetchBarcelonaTrees().then(setTrees).catch(console.error)
  }, [])
  useEffect(() => {
    fetchOvertureBuildings().then(setBuildings).catch(console.error)
  }, [])
  useEffect(() => {
    fetchBusStops().then(setBusStops).catch(console.error)
  }, [])
  useEffect(() => {
    fetchBicingStations().then(setBicingStations).catch(console.error)
  }, [])
  useEffect(() => {
    fetchTrafficViolations().then(setTrafficViolations).catch(console.error)
  }, [])
  useEffect(() => {
    fetchParkingZones().then(setParkingZones).catch(console.error)
  }, [])
  useEffect(() => {
    fetchBikeLanes().then(setBikeLanes).catch(console.error)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <Canvas
        orthographic
        camera={{ zoom: 0.65, position: [0, 0, 500], near: 0.1, far: 2000 }}
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
          />
        )}
      </Canvas>
    </div>
  )
}
