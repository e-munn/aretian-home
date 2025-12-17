#!/usr/bin/env node

/**
 * Regenerate city data files for the custom perimeter
 * Run with: node scripts/regenerate-city-data.js
 */

const fs = require('fs');
const path = require('path');

// Load perimeter
const perimeterPath = path.join(__dirname, '../public/data/perimeter/custom-perimeter.json');
const perimeter = JSON.parse(fs.readFileSync(perimeterPath, 'utf-8'));

console.log('Loaded perimeter with', perimeter.length, 'points');

// Calculate bounding box from perimeter
const lats = perimeter.map(p => p.lat);
const lons = perimeter.map(p => p.lon);
const bbox = {
  minLat: Math.min(...lats),
  maxLat: Math.max(...lats),
  minLon: Math.min(...lons),
  maxLon: Math.max(...lons),
};

console.log('Bounding box:', bbox);

// Point-in-polygon test (ray casting)
function pointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon, yi = polygon[i].lat;
    const xj = polygon[j].lon, yj = polygon[j].lat;

    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Fetch roads from Overpass API
async function fetchRoads() {
  console.log('\nFetching roads from Overpass API...');

  const bboxStr = `${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon}`;
  const query = `
    [out:json][timeout:60];
    (
      way["highway"~"^(primary|secondary|tertiary|residential|living_street|pedestrian|service|footway|path|cycleway)$"](${bboxStr});
    );
    out body;
    >;
    out skel qt;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Failed to fetch roads');
  const data = await response.json();

  console.log(`Fetched ${data.elements.length} elements`);
  return data;
}

// Fetch buildings from Overpass API
async function fetchBuildings() {
  console.log('\nFetching buildings from Overpass API...');

  const bboxStr = `${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon}`;
  const query = `
    [out:json][timeout:120];
    (
      way["building"](${bboxStr});
      relation["building"](${bboxStr});
    );
    out body;
    >;
    out skel qt;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Failed to fetch buildings');
  const data = await response.json();

  console.log(`Fetched ${data.elements.length} elements`);
  return data;
}

// Fetch trees from Barcelona Open Data
async function fetchTrees() {
  console.log('\nFetching trees from Barcelona Open Data...');

  const ARBRAT_VIARI_ID = '28034af4-b636-48e7-b3df-fa1c422e6287';
  const BCN_API = 'https://opendata-ajuntament.barcelona.cat/data/api/action/datastore_search_sql';

  const sql = `
    SELECT latitud, longitud FROM "${ARBRAT_VIARI_ID}"
    WHERE latitud >= ${bbox.minLat} AND latitud <= ${bbox.maxLat}
    AND longitud >= ${bbox.minLon} AND longitud <= ${bbox.maxLon}
    LIMIT 10000
  `;

  const response = await fetch(`${BCN_API}?sql=${encodeURIComponent(sql)}`);
  if (!response.ok) throw new Error('Failed to fetch trees');

  const data = await response.json();

  if (!data.success || !data.result?.records) {
    console.log('No tree data returned');
    return [];
  }

  // Filter trees inside polygon
  const trees = data.result.records
    .filter(r => r.latitud && r.longitud)
    .map(r => ({
      lat: parseFloat(r.latitud),
      lon: parseFloat(r.longitud),
    }))
    .filter(t => pointInPolygon(t.lat, t.lon, perimeter));

  console.log(`Fetched ${data.result.records.length} trees, ${trees.length} inside perimeter`);
  return trees;
}

// Filter OSM data to perimeter (check if any node is inside)
function filterOSMData(data, checkInside = true) {
  const nodes = {};
  const filteredElements = [];

  // Index nodes
  for (const el of data.elements) {
    if (el.type === 'node') {
      nodes[el.id] = { lon: el.lon, lat: el.lat };
    }
  }

  // Filter ways
  for (const el of data.elements) {
    if (el.type === 'node') {
      // Keep all nodes for reference
      filteredElements.push(el);
    } else if (el.type === 'way' && el.nodes) {
      if (!checkInside) {
        filteredElements.push(el);
        continue;
      }

      // Check if any node is inside polygon
      const hasNodeInside = el.nodes.some(nodeId => {
        const node = nodes[nodeId];
        return node && pointInPolygon(node.lat, node.lon, perimeter);
      });

      if (hasNodeInside) {
        filteredElements.push(el);
      }
    } else if (el.type === 'relation') {
      filteredElements.push(el);
    }
  }

  return { ...data, elements: filteredElements };
}

// Main
async function main() {
  const outputDir = path.join(__dirname, '../public/data/perimeter');

  try {
    // Fetch and save roads
    const roadsData = await fetchRoads();
    const filteredRoads = filterOSMData(roadsData);
    const roadsPath = path.join(outputDir, 'barcelona-roads-custom.json');
    fs.writeFileSync(roadsPath, JSON.stringify(filteredRoads, null, 2));
    console.log(`Saved ${filteredRoads.elements.length} road elements to ${roadsPath}`);

    // Fetch and save buildings
    const buildingsData = await fetchBuildings();
    const filteredBuildings = filterOSMData(buildingsData);
    const buildingsPath = path.join(outputDir, 'barcelona-buildings-custom.json');
    fs.writeFileSync(buildingsPath, JSON.stringify(filteredBuildings, null, 2));
    console.log(`Saved ${filteredBuildings.elements.length} building elements to ${buildingsPath}`);

    // Fetch and save trees
    const treesData = await fetchTrees();
    const treesPath = path.join(outputDir, 'barcelona-trees-custom.json');
    fs.writeFileSync(treesPath, JSON.stringify(treesData, null, 2));
    console.log(`Saved ${treesData.length} trees to ${treesPath}`);

    console.log('\nDone! All data files regenerated.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
