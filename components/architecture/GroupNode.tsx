'use client';

import { memo } from 'react';
import { NodeProps } from '@xyflow/react';

export interface GroupNodeData {
  label: string;
  color?: string;
}

function GroupNodeComponent({ data }: NodeProps) {
  const nodeData = data as GroupNodeData;
  const { label, color = '#3ecf8e' } = nodeData;

  return (
    <div
      className="rounded-xl border border-white/10 bg-white/5 min-w-[200px] min-h-[100px]"
      style={{
        borderTopColor: color,
        borderTopWidth: 3,
      }}
    >
      <div
        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t-lg"
        style={{ color }}
      >
        {label}
      </div>
    </div>
  );
}

export const GroupNode = memo(GroupNodeComponent);
