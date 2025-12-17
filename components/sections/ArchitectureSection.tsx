'use client';

import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ReactFlowProvider,
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

function ArchitectureFlow() {
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      defaultViewport={{ x: 80, y: 120, zoom: 1.0 }}
      minZoom={1.0}
      maxZoom={1.0}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      panOnScroll={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
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
  );
}

export function ArchitectureSection() {
  return (
    <div className="w-full h-full bg-transparent relative">
      <Visible>
        <div className="w-full h-full pointer-events-none">
          <ReactFlowProvider>
            <ArchitectureFlow />
          </ReactFlowProvider>
        </div>
      </Visible>
    </div>
  );
}
