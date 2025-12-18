'use client';

import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ServiceNode } from '@/components/architecture/ServiceNode';
import { GroupNode } from '@/components/architecture/GroupNode';
import { nodes as initialNodes, edges as initialEdges } from '@/components/architecture/data';
import { Visible } from '@/components/layout/Visible';

const nodeTypes = {
  service: ServiceNode,
  group: GroupNode,
};

// DEV MODE: Set to false to lock down for production
const DEV_MODE = false;

function ArchitectureFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);
  const { getViewport } = useReactFlow();

  // Log node position when drag ends
  const onNodeDragStop = (_event: React.MouseEvent, node: Node) => {
    console.log(`Node "${node.id}" position:`, node.position);
    console.log('Current viewport:', getViewport());
  };

  // Log all node positions
  const logAllPositions = () => {
    console.log('\n=== ALL NODE POSITIONS ===');
    nodes.forEach((node) => {
      console.log(`  { id: '${node.id}', position: { x: ${node.position.x}, y: ${node.position.y} } },`);
    });
    console.log('Viewport:', getViewport());
    console.log('========================\n');
  };

  return (
    <>
      {DEV_MODE && (
        <button
          onClick={logAllPositions}
          className="absolute top-4 right-4 z-50 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
        >
          Log All Positions
        </button>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={DEV_MODE ? onNodesChange : undefined}
        onNodeDragStop={DEV_MODE ? onNodeDragStop : undefined}
        defaultViewport={{ x: -320, y: 60, zoom: 0.75 }}
        minZoom={DEV_MODE ? 0.3 : 0.75}
        maxZoom={DEV_MODE ? 2 : 0.75}
        nodesDraggable={DEV_MODE}
        nodesConnectable={false}
        elementsSelectable={DEV_MODE}
        panOnDrag={DEV_MODE}
        panOnScroll={DEV_MODE}
        zoomOnScroll={DEV_MODE}
        zoomOnPinch={DEV_MODE}
        zoomOnDoubleClick={DEV_MODE}
        preventScrolling={!DEV_MODE}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#333"
          style={{ backgroundColor: 'transparent' }}
        />
      </ReactFlow>
    </>
  );
}

export function ArchitectureSection() {
  return (
    <div className="w-full h-full bg-transparent relative">
      <Visible>
        <div className="w-full h-full" style={{ pointerEvents: DEV_MODE ? 'auto' : 'none' }}>
          <ReactFlowProvider>
            <ArchitectureFlow />
          </ReactFlowProvider>
        </div>
      </Visible>
    </div>
  );
}
