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
      defaultViewport={{ x: 100, y: 50, zoom: 1.2 }}
      minZoom={1.2}
      maxZoom={1.2}
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
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#333"
      />
    </ReactFlow>
  );
}

export function ArchitectureSection() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] relative">
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
