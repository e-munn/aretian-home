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
    <div>
      {/* Header bar only - no background */}
      <div
        style={{
          backgroundColor: `${color}25`,
          borderBottom: `2px solid ${color}50`,
          borderRadius: '16px 16px 0 0',
          padding: '12px 24px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export const GroupNode = memo(GroupNodeComponent);
