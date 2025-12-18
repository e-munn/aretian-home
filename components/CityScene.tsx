'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import uniqBy from 'lodash/uniqBy'

// City components
import { DotGrid, GRID_ANGLE, GRID_EXTENTS } from './city/Grid'
import { Roads, FlowParticles } from './city/Roads'
import { InstancedPalmTrees } from './city/Trees'
import { DetailedBuildings } from './city/Buildings'
import { ParkingZones, BikeLanes } from './city/Infrastructure'
import { BusStopMarkers, BicingMarkers, TrafficViolationMarkers } from './city/Markers'
import { FadeInLayer } from './city/LayerAnimations'
import { useCityData, CityData } from '@/hooks/useCityData'
import { useLayerStore, LayerKey } from '@/stores/layerStore'
import { usePaletteStore } from '@/stores/paletteStore'
import { SIZE_ZOOMS, SIZE_RADII, SizeMode } from '@/stores/sizeStore'
import { filterPointsByRadius, filterRoadsByRadius, isWithinRadius } from './city/data'
import BuildingColorPicker from '@/components/ui/BuildingColorPicker'

// Screen width breakpoints for size mode
const SIZE_BREAKPOINTS = {
  small: 900,   // < 900px = small
  // >= 900px = medium (large disabled for performance)
}

// Determine size mode from screen width (large disabled)
function getSizeModeFromWidth(width: number): SizeMode {
  if (width < SIZE_BREAKPOINTS.small) return 'small'
  return 'medium' // Use medium for all larger screens
}

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

  // Grid extent based on size mode (medium max since large is disabled)
  const gridExtent = GRID_EXTENTS[sizeMode]

  // Calculate responsive offset and zoom based on viewport and size mode
  useEffect(() => {
    const aspect = size.width / size.height
    const orthoCamera = camera as THREE.OrthographicCamera

    // Zoom based on size mode
    const sizeZoom = SIZE_ZOOMS[sizeMode]
    const viewportScale = Math.min(size.width / 1920, size.height / 1080)
    orthoCamera.zoom = Math.max(0.5, Math.min(3.0, sizeZoom * viewportScale * 1.1))

    // Shift scene to the right for navbar visibility
    let offsetX: number
    let offsetY: number

    if (aspect > 1.4) {
      // Wide screen - push scene to the right
      offsetX = 140 + (aspect - 1.4) * 60
      offsetY = -150
    } else if (aspect > 1) {
      // Medium width
      offsetX = 70 + (aspect - 1) * 80
      offsetY = -110
    } else {
      // Narrow (mobile) - center more
      offsetX = 10
      offsetY = -30
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
      {/* Fade-in layers */}
      <FadeInLayer revealed={revealed.grid} duration={1.0}>
        <DotGrid color={dotGridColor} opacity={0.7 * getLayerOpacity('grid')} extent={gridExtent} />
      </FadeInLayer>
      <FadeInLayer revealed={revealed.roads} duration={0.8} delay={0.1}>
        <Roads roads={roads} opacity={getLayerOpacity('roads')} />
      </FadeInLayer>
      <FadeInLayer revealed={revealed.parking} duration={0.8} delay={0.05}>
        <ParkingZones zones={parkingZones} opacity={0.6 * getLayerOpacity('parking')} />
      </FadeInLayer>
      <FadeInLayer revealed={revealed.bikeLanes} duration={0.8} delay={0.1}>
        <BikeLanes lanes={bikeLanes} color='#44cc66' lineWidth={2} opacity={getLayerOpacity('bikeLanes')} />
      </FadeInLayer>
      <FadeInLayer revealed={revealed.trees} duration={1.0} delay={0.15}>
        <InstancedPalmTrees positions={trees} opacity={getLayerOpacity('trees')} />
      </FadeInLayer>
      <FadeInLayer revealed={revealed.flowParticles} duration={0.6}>
        <FlowParticles roads={roads} opacity={getLayerOpacity('flowParticles')} />
      </FadeInLayer>
      <FadeInLayer revealed={revealed.buildings} duration={1.2} delay={0.1}>
        <DetailedBuildings
          buildings={buildings}
          color={buildingColor}
          fillOpacity={buildingOpacity * getLayerOpacity('buildings')}
          edgeOpacity={0}
        />
      </FadeInLayer>

      {/* Data markers with built-in per-marker staggered drop animations */}
      {revealed.busStops && (
        <BusStopMarkers positions={busStops.map((s) => s.position)} opacity={getLayerOpacity('busStops')} />
      )}
      {revealed.bicingStations && (
        <BicingMarkers positions={bicingStations.map((s) => s.position)} opacity={getLayerOpacity('bicingStations')} />
      )}
      {revealed.trafficViolations && (
        <TrafficViolationMarkers
          positions={uniqBy(trafficViolations, v => `${v.position[0]},${v.position[1]}`).map((v) => v.position)}
          opacity={getLayerOpacity('trafficViolations')}
        />
      )}
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
  const { palette, next, prev, customBuildingColor, customBuildingOpacity, setBuildingColor, setBuildingOpacity } = usePaletteStore()

  // Auto-determine size mode from screen width (medium default, large disabled)
  const [sizeMode, setSizeMode] = useState<SizeMode>('medium')

  useEffect(() => {
    const updateSizeMode = () => {
      setSizeMode(getSizeModeFromWidth(window.innerWidth))
    }
    updateSizeMode()
    window.addEventListener('resize', updateSizeMode)
    return () => window.removeEventListener('resize', updateSizeMode)
  }, [])

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
    // Hovered layers get a brightness boost, others dim
    if (hoveredLayers.includes(layer)) {
      // Boost trees and buildings more since they're visually subtle
      if (layer === 'trees' || layer === 'buildings') return 1.5
      return 1.2
    }
    return 0.15
  }, [hoveredLayers])

  // Calculate building color - use custom color if set, otherwise palette
  const buildingColor = useMemo(() => {
    if (hoveredLayers?.includes('buildings')) {
      // Bright desaturated color for hover - light grayish blue
      return '#8090a8'
    }
    return customBuildingColor || palette.building
  }, [hoveredLayers, palette.building, customBuildingColor])

  // Calculate building opacity - more transparent when hovered
  const buildingOpacity = useMemo(() => {
    if (hoveredLayers?.includes('buildings')) {
      return 0.5
    }
    return customBuildingOpacity ?? palette.buildingOpacity
  }, [hoveredLayers, customBuildingOpacity, palette.buildingOpacity])

  // Keyboard navigation: arrows for palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, prev])

  // State for showing color picker
  const [showColorPicker, setShowColorPicker] = useState(false)

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
            buildingColor={buildingColor}
            buildingOpacity={buildingOpacity}
            dotGridColor={palette.dotGrid}
            getLayerOpacity={getLayerOpacity}
            sizeMode={sizeMode}
          />
        )}
      </Canvas>

      {/* Color picker - hidden for now
      <button
        onClick={() => setShowColorPicker(!showColorPicker)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: customBuildingColor || palette.building,
          border: '2px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'transform 0.2s, border-color 0.2s',
          opacity: customBuildingOpacity ?? palette.buildingOpacity,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
        }}
        title="Pick building color"
      />
      {showColorPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 24,
            zIndex: 100,
          }}
        >
          <BuildingColorPicker
            color={customBuildingColor || palette.building}
            opacity={customBuildingOpacity ?? palette.buildingOpacity}
            onColorChange={setBuildingColor}
            onOpacityChange={setBuildingOpacity}
            onClose={() => setShowColorPicker(false)}
          />
        </div>
      )}
      */}
    </div>
  )
}
