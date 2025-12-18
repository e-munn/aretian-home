# Barcelona City Data Pipeline

This folder contains geospatial data for the Barcelona Eixample district visualization.

## Bounds Definition

The visualization uses a **circular perimeter** defined in `components/city/data.ts`:

```typescript
CENTER = { lat: 41.39217756756757, lon: 2.15813620693481 }
RADIUS_M = 665  // meters
```

The circle polygon is generated programmatically with 64 points.

## Data Sources

### OSM Data (Overpass API)
- **Roads**: `perimeter/barcelona-roads-custom.json`
- **Buildings**: `perimeter/barcelona-buildings-custom.json`

### Barcelona Open Data
- **Trees**: `perimeter/barcelona-trees-custom.json` (filtered from street trees dataset)
- **Bus Stops**: `barcelona/bus-stops.json`
- **Parking Zones**: `barcelona/parking-zones.json`
- **Bicing Stations**: `barcelona/bicing-stations.json`
- **Traffic Violations**: `barcelona/traffic-violations.json`
- **Bike Lanes**: `barcelona/bike-lanes.geojson`

## Regeneration Script

To regenerate OSM data (roads, buildings, trees) for the current bounds:

```bash
node scripts/regenerate-city-data.js
```

This script:
1. Generates a circular polygon from CENTER and RADIUS_M
2. Fetches roads from Overpass API within bounding box
3. Fetches buildings from Overpass API within bounding box
4. Filters trees to only those inside the circle
5. Saves filtered data to `public/data/perimeter/`

## Data Flow

```
1. Define bounds (CENTER, RADIUS_M) in data.ts
   ↓
2. Generate BOUNDS_POLYGON (64-point circle)
   ↓
3. Fetch raw data from APIs (Overpass, Barcelona Open Data)
   ↓
4. Filter to circular bounds:
   - Roads: clipped at polygon boundary
   - Buildings: filtered by centroid
   - Trees/Markers: point-in-polygon test
   ↓
5. Project to scene coordinates using project(lon, lat)
   ↓
6. Render in Three.js scene
```

## Clipping Methods

| Data Type | Clipping Method |
|-----------|-----------------|
| Roads | Line segment clipping (intersection calculation) |
| Buildings | Centroid point-in-polygon test |
| Trees | Point-in-polygon test |
| Bus Stops | Point-in-polygon test |
| Parking Zones | Both endpoints must be inside |
| Bike Lanes | Point filtering per vertex |
| Bicing Stations | Point-in-polygon test |
| Traffic Violations | Point-in-polygon test |

## Updating Bounds

To change the visualization area:

1. Edit `CENTER` and `RADIUS_M` in `components/city/data.ts`
2. Update the same values in `scripts/regenerate-city-data.js`
3. Run `node scripts/regenerate-city-data.js`
4. Refresh the app (infrastructure layers filter dynamically)

## API References

- **Overpass API**: https://overpass-api.de/
- **Barcelona Open Data**: https://opendata-ajuntament.barcelona.cat/
- **CityBikes API**: https://api.citybik.es/v2/
