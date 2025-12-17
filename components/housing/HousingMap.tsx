'use client'
import { useState } from 'react'
import { Map } from 'react-map-gl'
import DeckGL from '@deck.gl/react'
import { MVTLayer } from '@deck.gl/geo-layers'
import { useHousingData } from '@/hooks/useHousingData'
import 'mapbox-gl/dist/mapbox-gl.css'

export function HousingMap() {
  const { housingData, isLoading, error } = useHousingData()

  const [viewState, setViewState] = useState({
    longitude: 2.1743,
    latitude: 41.3851,
    zoom: 11,
    pitch: 45,
    bearing: 0
  })

  // Create the housing sections MVT layer
  const layers = [
    new MVTLayer({
      id: 'housing-sections',
      data: typeof window !== 'undefined'
        ? `${window.location.origin}/api/barcelona-tiles/housing-sections/{z}/{x}/{y}`
        : '',
      minZoom: 9,
      maxZoom: 18,
      filled: true,
      stroked: false,
      opacity: 0.6,

      getFillColor: (feature: any) => {
        // Default gray color while loading
        if (!housingData) return [128, 128, 128, 200]

        // Get section ID from feature
        const sectionId = feature.id || feature.properties?.section_id || feature.properties?.cusec_id
        if (!sectionId) return [128, 128, 128, 200]

        // Look up housing data for this section
        const section = housingData.data[String(sectionId)] || housingData.data[Number(sectionId)]
        if (!section) return [128, 128, 128, 200]

        // Color by multi-family housing score (0-100)
        const score = section.norm_multi_family_score || 0

        // Blue gradient: gray for low scores, blue for high scores
        // Using a simple linear interpolation
        const intensity = Math.min(score / 100, 1)

        // Color scale: slate-400 (low) → blue-600 (high)
        // slate-400: rgb(148, 163, 184)
        // blue-200: rgb(191, 219, 254)
        // blue-400: rgb(96, 165, 250)
        // blue-600: rgb(37, 99, 235)

        return [
          Math.round(148 + (37 - 148) * intensity),   // R: 148→37
          Math.round(163 + (99 - 163) * intensity),   // G: 163→99
          Math.round(184 + (235 - 184) * intensity),  // B: 184→235
          200 // Alpha
        ]
      },

      pickable: true,
      autoHighlight: true,

      // Show tooltip on hover
      onHover: (info: any) => {
        if (info.object) {
          const sectionId = info.object.id || info.object.properties?.section_id
          if (sectionId && housingData) {
            const section = housingData.data[String(sectionId)]
            if (section) {
              console.log('Section:', section.municipality_name,
                         'Multi-Family Score:', section.norm_multi_family_score.toFixed(1))
            }
          }
        }
      }
    })
  ]

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-slate-200">
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e: any) => setViewState(e.viewState)}
        controller={true}
        layers={layers}
      >
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS}
          mapStyle="mapbox://styles/e-munn/clw3zy9pz02jz01qz84h8ceiq"
        />
      </DeckGL>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm">
          Loading housing data...
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-50 border border-red-200 px-3 py-2 rounded-lg shadow-md text-sm text-red-700">
          Error loading housing data
        </div>
      )}

      {/* Legend */}
      {housingData && (
        <div className="absolute bottom-4 left-4 bg-white px-4 py-3 rounded-lg shadow-md">
          <div className="text-xs font-semibold mb-2">Multi-Family Housing Score</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Low</span>
            <div className="w-32 h-4 rounded" style={{
              background: 'linear-gradient(to right, rgb(148, 163, 184), rgb(37, 99, 235))'
            }} />
            <span className="text-xs text-slate-600">High</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {Object.keys(housingData.data).length.toLocaleString()} sections
          </div>
        </div>
      )}
    </div>
  )
}
