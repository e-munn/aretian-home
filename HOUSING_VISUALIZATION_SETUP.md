# Housing Visualization Setup Guide

This document provides instructions for integrating multi-family housing score visualizations into the Aretian homepage project.

## Overview

The housing visualization feature displays Barcelona metropolitan area housing data with:
- **Mapbox Style**: 3D dusk theme (key: 'q') from `mapbox://styles/e-munn/clw3zy9pz02jz01qz84h8ceiq`
- **Multi-Family Housing Score Layer**: Shows normalized multi-family housing scores (0-100)
- **Vector Tiles**: Dynamically loaded from Supabase using MVT (Mapbox Vector Tiles)
- **CSV Data**: Local copy of housing metrics for client-side coloring

## What's Been Migrated

### 1. Data Files
- ✅ **`/public/metrics_housing_v2.csv`** - Housing metrics for 3,245 sections
  - Contains: `norm_multi_family_score`, `norm_single_family_score`, `norm_score`, `num_housing_units`, etc.
  - Used for client-side layer coloring

### 2. API Routes
- ✅ **`/app/api/barcelona-tiles/housing-sections/[z]/[x]/[y]/route.ts`**
  - Serves vector tiles from Supabase
  - Requires environment variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Hooks
- ✅ **`/hooks/useHousingData.ts`** - Loads and caches housing CSV data
  - Exports: `useHousingData()`, `getHousingScoreForSection()`
  - Returns: `{ housingData, isLoading, error }`

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase (aretian-build instance)
NEXT_PUBLIC_SUPABASE_URL=https://jsoromtvaryxbyykxskw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<ask for this key>

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS=<your mapbox token>
```

## Database Requirements

The housing tiles API requires this Supabase function to exist in your `aretian-build` database:

```sql
boundaries_sections_v3_mvt(z integer, x integer, y integer)
```

This function generates Mapbox Vector Tiles from the boundaries/sections geometry data.

## Installation Steps

### 1. Install Required Dependencies

The homepage project already has most dependencies. Verify these are installed:

```bash
npm install @deck.gl/geo-layers @deck.gl/layers @deck.gl/react deck.gl
npm install @loaders.gl/core @loaders.gl/csv
npm install d3-scale d3-interpolate d3-color
npm install mapbox-gl react-map-gl
```

### 2. Create a Housing Visualization Component

Create `/components/housing/HousingMap.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { Map } from 'react-map-gl'
import { DeckGL } from '@deck.gl/react'
import { MVTLayer } from '@deck.gl/geo-layers'
import { useHousingData } from '@/hooks/useHousingData'

export function HousingMap() {
  const { housingData, isLoading } = useHousingData()

  const [viewState, setViewState] = useState({
    longitude: 2.1743,
    latitude: 41.3851,
    zoom: 11,
    pitch: 45,
    bearing: 0
  })

  const housingSectionsLayer = new MVTLayer({
    id: 'housing-sections',
    data: `${window.location.origin}/api/barcelona-tiles/housing-sections/{z}/{x}/{y}`,
    minZoom: 9,
    maxZoom: 18,
    filled: true,
    getFillColor: (feature: any) => {
      if (!housingData) return [128, 128, 128, 200]

      const sectionId = feature.id || feature.properties?.section_id
      if (!sectionId) return [128, 128, 128, 200]

      const section = housingData.data[String(sectionId)]
      if (!section) return [128, 128, 128, 200]

      // Color by multi-family score (0-100)
      const score = section.norm_multi_family_score || 0

      // Simple blue gradient: darker = higher score
      const intensity = Math.min(score / 100, 1)
      return [
        Math.round(59 + (37 - 59) * intensity),   // R: 59→37 (blue tint)
        Math.round(130 + (130 - 130) * intensity), // G: 130→130
        Math.round(246 + (246 - 246) * intensity), // B: 246→246
        200 // Alpha
      ]
    },
    pickable: true,
    autoHighlight: true
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={e => setViewState(e.viewState)}
        controller={true}
        layers={[housingSectionsLayer]}
      >
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS}
          mapStyle="mapbox://styles/e-munn/clw3zy9pz02jz01qz84h8ceiq"
        />
      </DeckGL>
      {isLoading && (
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '8px' }}>
          Loading housing data...
        </div>
      )}
    </div>
  )
}
```

### 3. Add to Your Homepage

In `/app/page.tsx`, import and use the component:

```typescript
import { HousingMap } from '@/components/housing/HousingMap'

export default function HomePage() {
  return (
    <div>
      <h1>Barcelona Housing Analysis</h1>
      <HousingMap />
    </div>
  )
}
```

## Color Schemes Available

### Multi-Family Housing Score
- **Data Column**: `norm_multi_family_score`
- **Range**: 0-100
- **Color Scale**: White to Blue gradient
  - Low values (0-20): Light gray/white
  - Medium values (20-60): Light to medium blue
  - High values (60-100): Deep blue

### Other Available Metrics

You can color the map by these fields from the CSV:

1. **`norm_score`** - Overall housing score (0-100)
2. **`norm_single_family_score`** - Single-family housing score (0-100)
3. **`num_housing_units`** - Number of housing units (0-2200+)
4. **`urban_parcel_classification`** - Categories: "Housing Consolidated", "Manufacturing", "Other", etc.
5. **`cluster_description`** - Housing cluster types

## Advanced: Creating Visualizations

For charts showing multi-family score distribution:

```typescript
import { useHousingData } from '@/hooks/useHousingData'

export function HousingScoreChart() {
  const { housingData } = useHousingData()

  if (!housingData) return <div>Loading...</div>

  // Extract scores into array
  const scores = Object.values(housingData.data)
    .map(section => section.norm_multi_family_score)
    .filter(score => score > 0)

  // Create histogram bins
  const bins = Array(10).fill(0)
  scores.forEach(score => {
    const binIndex = Math.min(Math.floor(score / 10), 9)
    bins[binIndex]++
  })

  return (
    <div>
      <h3>Multi-Family Score Distribution</h3>
      {bins.map((count, i) => (
        <div key={i}>
          {i * 10}-{(i + 1) * 10}: {count} sections
        </div>
      ))}
    </div>
  )
}
```

## Mapbox Styles Available

From the CDT project, these are the available Mapbox styles:

| Key | Name | Style URL |
|-----|------|-----------|
| **q** | **3D dusk (default)** | `mapbox://styles/e-munn/clw3zy9pz02jz01qz84h8ceiq` |
| w | main | `mapbox://styles/e-munn/clxjpjorn01jq01qm0jfsed6o` |
| e | light streets | `mapbox://styles/e-munn/cmeyf02nz00ov01rkdapa85sn` |
| r | 3D day | `mapbox://styles/e-munn/clw46c0si014v01pf2jhx4gpj` |
| t | dark | `mapbox://styles/e-munn/clwp1g6by04ep01nxdovw0dy1` |
| y | 3D dark | `mapbox://styles/e-munn/clw46doe602mz01qu46nc2wzn` |

## Data Structure Reference

### Housing CSV Columns
```typescript
interface HousingScoreData {
  section_id: string                              // e.g., "800101001"
  norm_multi_family_score: number                 // 0-100
  norm_single_family_score: number                // 0-100
  norm_score: number                              // 0-100 (overall)
  urban_parcel_classification: string             // "Housing Consolidated", etc.
  norm_optimal_housing_type: string               // "Multi-Family", "Single Family"
  num_housing_units: number                       // Count of units
  municipality_name: string                       // "Barcelona", "Abrera", etc.
  district_name: string                           // District within municipality
  comarca: string                                 // Regional area
  lat: number                                     // Latitude
  lon: number                                     // Longitude
  cluster_sc: number                              // Cluster ID (1-7)
  cluster_description: string                     // "Premium Areas", etc.
  household_income_sc: number                     // Household income
  multi_family_rental_ppm2_sc: number            // Rental price per m²
  multi_family_purchase_ppm2_percentile_sc: number // Purchase price percentile
  // ... more fields
}
```

## Performance Tips

1. **CSV Caching**: The `useHousingData` hook caches data globally - only loads once
2. **Tile Caching**: MVT tiles are cached by the API with `max-age=3600`
3. **Worker Parsing**: CSV parsing happens in a web worker (non-blocking)
4. **Lazy Loading**: Only load the map component when needed (use dynamic imports)

## Troubleshooting

### "Database error" from API
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Verify the `boundaries_sections_v3_mvt` function exists in your Supabase database
- Check Supabase project is the correct one (aretian-build)

### Map shows gray tiles
- Check that housing data is loaded: `console.log(housingData)`
- Verify section IDs match between CSV and tiles
- Ensure `getFillColor` function is receiving features with valid IDs

### CSV won't load
- Verify `/public/metrics_housing_v2.csv` exists
- Check browser console for 404 errors
- Ensure `@loaders.gl/csv` is installed

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test the housing tiles API endpoint
3. ✅ Create the HousingMap component
4. ✅ Add it to your homepage
5. ✅ Customize colors and interactivity
6. ✅ Add tooltips, legends, and filters
7. ✅ Create accompanying charts/visualizations

## Contact

For questions about the CDT project or data sources, reach out to the main development team.
