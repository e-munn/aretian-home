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
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.8}
      maxZoom={0.8}
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
      {/* Header */}
      <div className="absolute top-8 left-16 z-10">
        <h2 className="text-3xl font-light text-white/90 mb-1">Platform Architecture</h2>
        <p className="text-lg text-white/50">Urban analytics infrastructure</p>
      </div>

      {/* Flow Diagram */}
      <div className="w-full h-full pt-20 pointer-events-none">
        <ReactFlowProvider>
          <ArchitectureFlow />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
