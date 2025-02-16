import proj4 from 'proj4'

proj4.defs([
  [
    'EPSG:4326',
    '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
  ],
  [
    'EPSG:2062',
    '+proj=lcc +lat_1=40 +lat_0=40 +lon_0=0 +k_0=0.9988085293 +x_0=600000 +y_0=600000 +a=6378298.3 +rf=294.73 +pm=-3.687375 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:25831',
    '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
])

export const PROJPOINTS = (data: any) => {
  return data.features.map((f: any) => ({
    ...f,
    geometry: {
      type: 'Point',
      coordinates: proj4('EPSG:2062', 'EPSG:4326', f.geometry.coordinates),
    },
  }))
}

export const PROJPOLY = (data: any) => {
  return data.features.map((f: any) => ({
    ...f,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          f.geometry.coordinates[0][0].map((p: any) =>
            proj4('EPSG:2062', 'EPSG:4326', p)
          ),
        ],
      ],
    },
  }))
}
