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
    position: { x: 499, y: 28 },
    data: { label: 'Collection', color: COLORS.collection, hideTopHandle: true },
    style: { width: 780, height: 220, border: `1px solid ${COLORS.collection}30`, borderRadius: '24px', backgroundColor: 'transparent' },
  },
  {
    id: 'urban-data',
    type: 'service',
    position: { x: 50, y: 100 },
    data: { label: 'Urban Data', description: 'City infrastructure', icon: 'map', color: COLORS.collection },
    parentId: 'group-collection',
    extent: 'parent',
  },
  {
    id: 'spatial-feeds',
    type: 'service',
    position: { x: 290, y: 100 },
    data: { label: 'Spatial Feeds', description: 'GIS & satellite', icon: 'globe', color: COLORS.collection },
    parentId: 'group-collection',
    extent: 'parent',
  },
  {
    id: 'mobility-data',
    type: 'service',
    position: { x: 530, y: 100 },
    data: { label: 'Mobility', description: 'Transit & flows', icon: 'layers', color: COLORS.collection },
    parentId: 'group-collection',
    extent: 'parent',
  },

  // === ANALYSIS GROUP (Middle) ===
  {
    id: 'group-analysis',
    type: 'group',
    position: { x: 650, y: 376 },
    data: { label: 'Analysis', color: COLORS.analysis },
    style: { width: 780, height: 220, border: `1px solid ${COLORS.analysis}30`, borderRadius: '24px', backgroundColor: 'transparent' },
  },
  {
    id: 'pattern-detection',
    type: 'service',
    position: { x: 50, y: 100 },
    data: { label: 'Patterns', description: 'Network analysis', icon: 'chart', color: COLORS.analysis },
    parentId: 'group-analysis',
    extent: 'parent',
  },
  {
    id: 'simulation',
    type: 'service',
    position: { x: 290, y: 100 },
    data: { label: 'Simulation', description: 'Urban models', icon: 'brain', color: COLORS.analysis },
    parentId: 'group-analysis',
    extent: 'parent',
  },
  {
    id: 'optimization',
    type: 'service',
    position: { x: 530, y: 100 },
    data: { label: 'Optimization', description: 'Resource allocation', icon: 'server', color: COLORS.analysis },
    parentId: 'group-analysis',
    extent: 'parent',
  },

  // === DEPLOYMENT GROUP (Bottom) ===
  {
    id: 'group-deployment',
    type: 'group',
    position: { x: 830, y: 730 },
    data: { label: 'Equip', color: COLORS.deployment, hideBottomHandle: true },
    style: { width: 780, height: 220, border: `1px solid ${COLORS.deployment}30`, borderRadius: '24px', backgroundColor: 'transparent' },
  },
  {
    id: 'digital-twin',
    type: 'service',
    position: { x: 50, y: 100 },
    data: { label: 'Digital Twin', description: '3D city models', icon: 'box', color: COLORS.deployment },
    parentId: 'group-deployment',
    extent: 'parent',
  },
  {
    id: 'dashboards',
    type: 'service',
    position: { x: 290, y: 100 },
    data: { label: 'Dashboards', description: 'KPI tracking', icon: 'chart', color: COLORS.deployment },
    parentId: 'group-deployment',
    extent: 'parent',
  },
  {
    id: 'recommendations',
    type: 'service',
    position: { x: 530, y: 100 },
    data: { label: 'Insights', description: 'Action plans', icon: 'layers', color: COLORS.deployment },
    parentId: 'group-deployment',
    extent: 'parent',
  },
];

// Edges - Simple group-to-group flow with dashed animated lines
const edges: Edge[] = [
  // Collection -> Analysis
  {
    id: 'e-collection-analysis',
    source: 'group-collection',
    target: 'group-analysis',
    animated: true,
    style: { stroke: COLORS.flow, strokeWidth: 2, strokeDasharray: '8 4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },
  // Analysis -> Deployment
  {
    id: 'e-analysis-deployment',
    source: 'group-analysis',
    target: 'group-deployment',
    animated: true,
    style: { stroke: COLORS.flow, strokeWidth: 2, strokeDasharray: '8 4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.flow },
  },
];

export { nodes, edges, COLORS };
