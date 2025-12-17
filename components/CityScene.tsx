'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// City components
import { DotGrid, GRID_ANGLE } from './city/Grid'
import { Roads, FlowParticles } from './city/Roads'
import { InstancedPalmTrees } from './city/Trees'
import { DetailedBuildings } from './city/Buildings'
import { ParkingZones, BikeLanes } from './city/Infrastructure'
import { BusStopMarkers, BicingMarkers, TrafficViolationMarkers } from './city/Markers'
import { useCityData, CityData } from '@/hooks/useCityData'
import { useLayerStore, LayerKey } from '@/stores/layerStore'
import { usePaletteStore, PALETTES } from '@/stores/paletteStore'
import { useSizeStore, SIZE_ZOOMS, SIZE_EXTENTS, SIZE_RADII, SizeMode } from '@/stores/sizeStore'
import { filterPointsByRadius, filterRoadsByRadius, isWithinRadius } from './city/data'

// Scene
interface SceneProps extends CityData {
  revealed: Record<LayerKey, boolean>
  buildingColor: string
  buildingOpacity: number
  dotGridColor: string
  getLayerOpacity: (layer: LayerKey) => number
  sizeMode: SizeMode
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
  buildingOpacity,
  dotGridColor,
  getLayerOpacity,
  sizeMode,
}: SceneProps) {
  const { camera, size } = useThree()

  const dist = 500
  const orbitAngle = Math.PI / 4
  const elevation = Math.atan(1 / Math.sqrt(2))

  // Get extent from size mode
  const gridExtent = SIZE_EXTENTS[sizeMode]

  // Calculate responsive offset and zoom based on viewport and size mode
  useEffect(() => {
    const aspect = size.width / size.height
    const orthoCamera = camera as THREE.OrthographicCamera

    // Base zoom from size mode, scaled by viewport
    const sizeZoom = SIZE_ZOOMS[sizeMode]
    const viewportScale = Math.min(size.width / 1920, size.height / 1080)
    orthoCamera.zoom = Math.max(0.4, Math.min(3.0, sizeZoom * viewportScale * 1.1))

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

    camera.position.set(
      dist * Math.cos(orbitAngle) * Math.cos(elevation) + offsetX,
      dist * Math.sin(orbitAngle) * Math.cos(elevation) + offsetY,
      dist * Math.sin(elevation)
    )
    camera.up.set(0, 0, 1)
    camera.lookAt(offsetX, offsetY, 0)
    camera.updateProjectionMatrix()
  }, [camera, size, sizeMode])

  return (
    <group rotation={[0, 0, -GRID_ANGLE]} position={[0, 0, -40]}>
      {revealed.grid && <DotGrid color={dotGridColor} opacity={0.7 * getLayerOpacity('grid')} extent={gridExtent} />}
      {revealed.roads && <Roads roads={roads} opacity={getLayerOpacity('roads')} />}
      {revealed.parking && <ParkingZones zones={parkingZones} opacity={0.6 * getLayerOpacity('parking')} />}
      {revealed.bikeLanes && <BikeLanes lanes={bikeLanes} color='#44cc66' lineWidth={2} opacity={getLayerOpacity('bikeLanes')} />}
      {revealed.trees && <InstancedPalmTrees positions={trees} opacity={getLayerOpacity('trees')} />}
      {revealed.flowParticles && <FlowParticles roads={roads} opacity={getLayerOpacity('flowParticles')} />}
      {revealed.buildings && (
        <DetailedBuildings
          buildings={buildings}
          color={buildingColor}
          fillOpacity={buildingOpacity * getLayerOpacity('buildings')}
          edgeOpacity={0}
        />
      )}
      {revealed.busStops && <BusStopMarkers positions={busStops.map((s) => s.position)} opacity={getLayerOpacity('busStops')} />}
      {revealed.bicingStations && <BicingMarkers positions={bicingStations.map((s) => s.position)} opacity={getLayerOpacity('bicingStations')} />}
      {revealed.trafficViolations && <TrafficViolationMarkers positions={trafficViolations.map((v) => v.position)} opacity={getLayerOpacity('trafficViolations')} />}
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
  const hoveredLayers = useLayerStore((state) => state.hoveredLayers)

  // Get palette from store
  const { palette, currentIndex, next, prev } = usePaletteStore()

  // Get size mode from store
  const { mode: sizeMode, setMode: setSizeMode } = useSizeStore()

  // Get radius for current size mode
  const radius = SIZE_RADII[sizeMode]

  // Filter all data layers by radius (memoized)
  const filteredData = useMemo(() => {
    return {
      roads: filterRoadsByRadius(roads, radius),
      trees: filterPointsByRadius(trees, radius),
      buildings: buildings.filter(b => isWithinRadius(b.centroid[0], b.centroid[1], radius)),
      busStops: busStops.filter(s => isWithinRadius(s.position[0], s.position[1], radius)),
      bicingStations: bicingStations.filter(s => isWithinRadius(s.position[0], s.position[1], radius)),
      trafficViolations: trafficViolations.filter(v => isWithinRadius(v.position[0], v.position[1], radius)),
      parkingZones: parkingZones.filter(z => isWithinRadius(z.startPos[0], z.startPos[1], radius)),
      bikeLanes: bikeLanes.filter(l => {
        // Check if any point in the lane is within radius
        return l.path.some(([x, y]) => isWithinRadius(x, y, radius))
      }),
    }
  }, [roads, trees, buildings, busStops, bicingStations, trafficViolations, parkingZones, bikeLanes, radius])

  // Calculate opacity for a layer based on hover state
  const getLayerOpacity = useCallback((layer: LayerKey): number => {
    // If nothing is hovered, everything is at full opacity
    if (hoveredLayers === null) return 1
    // Otherwise, only hovered layers are at full opacity
    return hoveredLayers.includes(layer) ? 1 : 0.15
  }, [hoveredLayers])

  // Keyboard navigation: arrows for palette, 1/2/3 for size
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === '1') {
        e.preventDefault()
        setSizeMode('small')
      } else if (e.key === '2') {
        e.preventDefault()
        setSizeMode('medium')
      } else if (e.key === '3') {
        e.preventDefault()
        setSizeMode('large')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, prev, setSizeMode])

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <Canvas
        orthographic
        camera={{ zoom: 0.8, position: [0, 0, 500], near: -1000, far: 2000 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        {filteredData.roads.length > 0 && (
          <Scene
            roads={filteredData.roads}
            trees={filteredData.trees}
            buildings={filteredData.buildings}
            busStops={filteredData.busStops}
            bicingStations={filteredData.bicingStations}
            trafficViolations={filteredData.trafficViolations}
            parkingZones={filteredData.parkingZones}
            bikeLanes={filteredData.bikeLanes}
            revealed={revealed}
            buildingColor={palette.building}
            buildingOpacity={palette.buildingOpacity}
            dotGridColor={palette.dotGrid}
            getLayerOpacity={getLayerOpacity}
            sizeMode={sizeMode}
          />
        )}
      </Canvas>

      {/* Palette & size indicator */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: 8,
          color: 'white',
          fontSize: 12,
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: palette.bg, border: '1px solid rgba(255,255,255,0.2)' }} />
          <div style={{ width: 16, height: 16, borderRadius: 4, background: palette.building, border: '1px solid rgba(255,255,255,0.2)' }} />
          <div style={{ width: 16, height: 16, borderRadius: 4, background: palette.dotGrid, border: '1px solid rgba(255,255,255,0.2)' }} />
        </div>
        <span style={{ opacity: 0.7 }}>{currentIndex + 1}/{PALETTES.length}</span>
        {palette.name && <span style={{ opacity: 0.5 }}>{palette.name}</span>}
        <span style={{ opacity: 0.4, fontSize: 10 }}>← →</span>
        <span style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 12 }}>
          {['small', 'medium', 'large'].map((s, i) => (
            <span
              key={s}
              style={{
                opacity: sizeMode === s ? 1 : 0.3,
                marginRight: 4,
                cursor: 'pointer',
              }}
              onClick={() => setSizeMode(s as SizeMode)}
            >
              {i + 1}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
