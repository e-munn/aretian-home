'use client';

import { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';

export interface GroupNodeData {
  label: string;
  color?: string;
  hideTopHandle?: boolean;
  hideBottomHandle?: boolean;
}

function GroupNodeComponent({ data }: NodeProps) {
  const nodeData = data as GroupNodeData;
  const { label, color = '#3ecf8e', hideTopHandle, hideBottomHandle } = nodeData;

  return (
    <div className="relative w-full h-full">
      {/* Top handle (target) - hidden for Collection */}
      {!hideTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: color,
            width: 8,
            height: 8,
            border: 'none',
            top: -4,
          }}
        />
      )}

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
            fontSize: '28px',
            fontFamily: 'var(--font-bebas-neue), sans-serif',
            fontWeight: 400,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: '4px',
          }}
        >
          {label}
        </span>
      </div>

      {/* Bottom handle (source) - hidden for Deployment */}
      {!hideBottomHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: color,
            width: 8,
            height: 8,
            border: 'none',
            bottom: -4,
          }}
        />
      )}
    </div>
  );
}

export const GroupNode = memo(GroupNodeComponent);
