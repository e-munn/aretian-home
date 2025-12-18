// City configurations for transit visualization

export interface CityConfig {
  id: string;
  name: string;
  country: string;
  center: { lat: number; lon: number };
  zoom: number;
  rotation: number; // radians, 0 = north up
  roadTypes: string[]; // highway types to show
  transitDataPath: string;
  roadsDataPath: string;
  clipRadius?: number; // meters - optional radial clip
}

export const CITIES: Record<string, CityConfig> = {
  barcelona: {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    center: { lat: 41.39086, lon: 2.15644 },
    zoom: 0.5,
    rotation: 0,
    roadTypes: ['primary', 'secondary', 'tertiary', 'residential'],
    transitDataPath: '/data/barcelona/transit-stops.json',
    roadsDataPath: '/data/perimeter/barcelona-roads-1200m.json',
  },
  boston: {
    id: 'boston',
    name: 'Boston',
    country: 'USA',
    center: { lat: 42.365, lon: -71.09 }, // Centered for radial data
    zoom: 0.12,
    rotation: 0,
    roadTypes: ['primary', 'secondary', 'tertiary', 'residential'],
    transitDataPath: '/data/boston/transit-stops-radial.json',
    roadsDataPath: '/data/boston/roads-radial.json',
    clipRadius: 4500, // meters - match data radius
  },
};

export const CITY_LIST = Object.values(CITIES);
export const DEFAULT_CITY = 'barcelona';
