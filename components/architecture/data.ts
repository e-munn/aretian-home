import { Node, Edge, MarkerType } from '@xyflow/react';
import { ServiceNodeData } from './ServiceNode';
import { GroupNodeData } from './GroupNode';

// Colors - Process-focused palette
const COLORS = {
  collection: '#61dafb',    // Cyan - gathering/intake
  analysis: '#a855f7',      // Purple - processing/insight
  deployment: '#3ecf8e',    // Green - output/delivery
  flow: '#ffffff',          // White - main flow
};

// Vertical top-down layout for process flow - spacious layout
const nodes: Node<ServiceNodeData | GroupNodeData>[] = [
  // === COLLECTION GROUP (Top) ===
  {
    id: 'group-collection',
    type: 'group',
    position: { x: 100, y: 0 },
    data: { label: 'Collection', color: COLORS.collection },
    style: { width: 580, height: 150, border: `1px solid ${COLORS.collection}30`, borderRadius: '24px', backgroundColor: 'transparent' },
  },
  {
    id: 'urban-data',
    type: 'service',
    position: { x: 30, y: 55 },
    data: { label: 'Urban Data', description: 'City infrastructure', icon: 'map', color: COLORS.collection },
    parentId: 'group-collection',
    extent: 'parent',
  },
  {
    id: 'spatial-feeds',
    type: 'service',
    position: { x: 210, y: 55 },
    data: { label: 'Spatial Feeds', description: 'GIS & satellite', icon: 'globe', color: COLORS.collection },
    parentId: 'group-collection',
    extent: 'parent',
  },
  {
    id: 'mobility-data',
    type: 'service',
    position: { x: 390, y: 55 },
    data: { label: 'Mobility', description: 'Transit & flows', icon: 'layers', color: COLORS.collection },
    parentId: 'group-collection',
    extent: 'parent',
  },

  // === ANALYSIS GROUP (Middle) ===
  {
    id: 'group-analysis',
    type: 'group',
    position: { x: 100, y: 220 },
    data: { label: 'Analysis', color: COLORS.analysis },
    style: { width: 580, height: 150, border: `1px solid ${COLORS.analysis}30`, borderRadius: '24px', backgroundColor: 'transparent' },
  },
  {
    id: 'pattern-detection',
    type: 'service',
    position: { x: 30, y: 55 },
    data: { label: 'Patterns', description: 'Network analysis', icon: 'chart', color: COLORS.analysis },
    parentId: 'group-analysis',
    extent: 'parent',
  },
  {
    id: 'simulation',
    type: 'service',
    position: { x: 210, y: 55 },
    data: { label: 'Simulation', description: 'Urban models', icon: 'brain', color: COLORS.analysis },
    parentId: 'group-analysis',
    extent: 'parent',
  },
  {
    id: 'optimization',
    type: 'service',
    position: { x: 390, y: 55 },
    data: { label: 'Optimization', description: 'Resource allocation', icon: 'server', color: COLORS.analysis },
    parentId: 'group-analysis',
    extent: 'parent',
  },

  // === DEPLOYMENT GROUP (Bottom) ===
  {
    id: 'group-deployment',
    type: 'group',
    position: { x: 100, y: 440 },
    data: { label: 'Deployment', color: COLORS.deployment },
    style: { width: 580, height: 150, border: `1px solid ${COLORS.deployment}30`, borderRadius: '24px', backgroundColor: 'transparent' },
  },
  {
    id: 'digital-twin',
    type: 'service',
    position: { x: 30, y: 55 },
    data: { label: 'Digital Twin', description: '3D city models', icon: 'box', color: COLORS.deployment },
    parentId: 'group-deployment',
    extent: 'parent',
  },
  {
    id: 'dashboards',
    type: 'service',
    position: { x: 210, y: 55 },
    data: { label: 'Dashboards', description: 'KPI tracking', icon: 'chart', color: COLORS.deployment },
    parentId: 'group-deployment',
    extent: 'parent',
  },
  {
    id: 'recommendations',
    type: 'service',
    position: { x: 390, y: 55 },
    data: { label: 'Insights', description: 'Action plans', icon: 'layers', color: COLORS.deployment },
    parentId: 'group-deployment',
    extent: 'parent',
  },
];

// Edges - Top-down flow
const edges: Edge[] = [
  // Collection to Analysis (vertical flow)
  {
    id: 'e-urban-patterns',
    source: 'urban-data',
    target: 'pattern-detection',
    style: { stroke: COLORS.flow, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },
  {
    id: 'e-spatial-simulation',
    source: 'spatial-feeds',
    target: 'simulation',
    animated: true,
    style: { stroke: COLORS.flow, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },
  {
    id: 'e-mobility-optimization',
    source: 'mobility-data',
    target: 'optimization',
    style: { stroke: COLORS.flow, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },

  // Analysis to Deployment (vertical flow)
  {
    id: 'e-patterns-twin',
    source: 'pattern-detection',
    target: 'digital-twin',
    style: { stroke: COLORS.flow, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },
  {
    id: 'e-simulation-dashboards',
    source: 'simulation',
    target: 'dashboards',
    animated: true,
    style: { stroke: COLORS.flow, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },
  {
    id: 'e-optimization-insights',
    source: 'optimization',
    target: 'recommendations',
    style: { stroke: COLORS.flow, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },

  // Cross-connections within groups (subtle)
  {
    id: 'e-patterns-simulation',
    source: 'pattern-detection',
    target: 'simulation',
    style: { stroke: COLORS.analysis, strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'e-simulation-optimization',
    source: 'simulation',
    target: 'optimization',
    style: { stroke: COLORS.analysis, strokeWidth: 1, strokeDasharray: '4 4' },
  },
];

export { nodes, edges, COLORS };
