import { Node, Edge } from '@xyflow/react';
import { ServiceNodeData } from './ServiceNode';
import { GroupNodeData } from './GroupNode';

// Colors
const COLORS = {
  clients: '#61dafb',
  frontend: '#61dafb',
  backend: '#3ecf8e',
  external: '#f97316',
  data: '#a855f7',
  analytics: '#00C217',
};

// Node positions
const nodes: Node<ServiceNodeData | GroupNodeData>[] = [
  // Groups
  {
    id: 'group-clients',
    type: 'group',
    position: { x: 0, y: 0 },
    data: { label: 'Clients', color: COLORS.clients },
    style: { width: 280, height: 80 },
  },
  {
    id: 'group-frontend',
    type: 'group',
    position: { x: 0, y: 120 },
    data: { label: 'Frontend', color: COLORS.frontend },
    style: { width: 500, height: 100 },
  },
  {
    id: 'group-backend',
    type: 'group',
    position: { x: 0, y: 260 },
    data: { label: 'Backend Services', color: COLORS.backend },
    style: { width: 500, height: 100 },
  },
  {
    id: 'group-data',
    type: 'group',
    position: { x: 0, y: 400 },
    data: { label: 'Data & Analytics', color: COLORS.data },
    style: { width: 500, height: 100 },
  },
  {
    id: 'group-external',
    type: 'group',
    position: { x: 560, y: 120 },
    data: { label: 'External APIs', color: COLORS.external },
    style: { width: 180, height: 240 },
  },

  // Client nodes
  {
    id: 'browser',
    type: 'service',
    position: { x: 20, y: 35 },
    data: { label: 'Browser', icon: 'globe', color: COLORS.clients },
    parentId: 'group-clients',
    extent: 'parent',
  },
  {
    id: 'mobile',
    type: 'service',
    position: { x: 150, y: 35 },
    data: { label: 'Mobile', icon: 'globe', color: COLORS.clients, disabled: true },
    parentId: 'group-clients',
    extent: 'parent',
  },

  // Frontend nodes
  {
    id: 'nextjs',
    type: 'service',
    position: { x: 20, y: 40 },
    data: { label: 'Next.js', description: 'React Framework', icon: 'layers', color: COLORS.frontend },
    parentId: 'group-frontend',
    extent: 'parent',
  },
  {
    id: 'mapbox',
    type: 'service',
    position: { x: 180, y: 40 },
    data: { label: 'Mapbox GL', description: '3D Maps', icon: 'map', color: COLORS.frontend },
    parentId: 'group-frontend',
    extent: 'parent',
  },
  {
    id: 'threejs',
    type: 'service',
    position: { x: 340, y: 40 },
    data: { label: 'Three.js', description: '3D Graphics', icon: 'box', color: COLORS.frontend },
    parentId: 'group-frontend',
    extent: 'parent',
  },

  // Backend nodes
  {
    id: 'vercel',
    type: 'service',
    position: { x: 20, y: 40 },
    data: { label: 'Vercel', description: 'Hosting', icon: 'cloud', color: COLORS.backend },
    parentId: 'group-backend',
    extent: 'parent',
  },
  {
    id: 'supabase',
    type: 'service',
    position: { x: 180, y: 40 },
    data: { label: 'Supabase', description: 'Database', icon: 'database', color: COLORS.backend },
    parentId: 'group-backend',
    extent: 'parent',
  },
  {
    id: 'api',
    type: 'service',
    position: { x: 340, y: 40 },
    data: { label: 'API Routes', description: 'Serverless', icon: 'server', color: COLORS.backend },
    parentId: 'group-backend',
    extent: 'parent',
  },

  // Data & Analytics nodes
  {
    id: 'bigquery',
    type: 'service',
    position: { x: 20, y: 40 },
    data: { label: 'BigQuery', description: 'Data Warehouse', icon: 'database', color: COLORS.data },
    parentId: 'group-data',
    extent: 'parent',
  },
  {
    id: 'analytics',
    type: 'service',
    position: { x: 180, y: 40 },
    data: { label: 'Analytics Engine', description: 'Urban Metrics', icon: 'chart', color: COLORS.analytics },
    parentId: 'group-data',
    extent: 'parent',
  },
  {
    id: 'ml',
    type: 'service',
    position: { x: 340, y: 40 },
    data: { label: 'ML Models', description: 'Predictions', icon: 'brain', color: COLORS.data },
    parentId: 'group-data',
    extent: 'parent',
  },

  // External API nodes
  {
    id: 'mapbox-api',
    type: 'service',
    position: { x: 20, y: 40 },
    data: { label: 'Mapbox', icon: 'map', color: COLORS.external },
    parentId: 'group-external',
    extent: 'parent',
  },
  {
    id: 'opendata',
    type: 'service',
    position: { x: 20, y: 110 },
    data: { label: 'Open Data', icon: 'database', color: COLORS.external },
    parentId: 'group-external',
    extent: 'parent',
  },
  {
    id: 'osm',
    type: 'service',
    position: { x: 20, y: 180 },
    data: { label: 'OpenStreetMap', icon: 'globe', color: COLORS.external },
    parentId: 'group-external',
    extent: 'parent',
  },
];

// Edges
const edges: Edge[] = [
  // Client to Frontend
  { id: 'e-browser-nextjs', source: 'browser', target: 'nextjs', animated: true, style: { stroke: COLORS.clients } },

  // Frontend connections
  { id: 'e-nextjs-mapbox', source: 'nextjs', target: 'mapbox', style: { stroke: COLORS.frontend } },
  { id: 'e-nextjs-threejs', source: 'nextjs', target: 'threejs', style: { stroke: COLORS.frontend } },

  // Frontend to Backend
  { id: 'e-nextjs-vercel', source: 'nextjs', target: 'vercel', animated: true, style: { stroke: COLORS.backend } },
  { id: 'e-nextjs-api', source: 'nextjs', target: 'api', style: { stroke: COLORS.backend } },

  // Backend connections
  { id: 'e-api-supabase', source: 'api', target: 'supabase', style: { stroke: COLORS.backend } },

  // Backend to Data
  { id: 'e-supabase-bigquery', source: 'supabase', target: 'bigquery', style: { stroke: COLORS.data } },
  { id: 'e-api-analytics', source: 'api', target: 'analytics', animated: true, style: { stroke: COLORS.analytics } },
  { id: 'e-analytics-ml', source: 'analytics', target: 'ml', style: { stroke: COLORS.data } },

  // External API connections
  { id: 'e-mapbox-mapboxapi', source: 'mapbox', target: 'mapbox-api', style: { stroke: COLORS.external } },
  { id: 'e-bigquery-opendata', source: 'bigquery', target: 'opendata', style: { stroke: COLORS.external } },
  { id: 'e-bigquery-osm', source: 'bigquery', target: 'osm', style: { stroke: COLORS.external } },
];

export { nodes, edges, COLORS };
