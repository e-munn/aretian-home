'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe, Server, Database, Cpu, Layers, Box, Map, BarChart3, Brain, Cloud } from 'lucide-react';

const iconMap = {
  globe: Globe,
  server: Server,
  database: Database,
  cpu: Cpu,
  layers: Layers,
  box: Box,
  map: Map,
  chart: BarChart3,
  brain: Brain,
  cloud: Cloud,
};

export interface ServiceNodeData {
  label: string;
  description?: string;
  icon?: keyof typeof iconMap;
  color?: string;
  disabled?: boolean;
}

function ServiceNodeComponent({ data }: NodeProps) {
  const nodeData = data as ServiceNodeData;
  const { label, description, icon, color = '#3ecf8e', disabled } = nodeData;
  const Icon = icon ? iconMap[icon] : null;

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div
        className={`
          px-4 py-3 rounded-lg border-2 bg-[#1a1a1a] min-w-[140px]
          transition-all duration-200 hover:scale-105
          ${disabled ? 'opacity-40 border-dashed' : ''}
        `}
        style={{
          borderColor: disabled ? '#666' : color,
          boxShadow: disabled ? 'none' : `0 0 20px ${color}33`,
        }}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              size={22}
              style={{ color: disabled ? '#666' : color }}
            />
          )}
          <span
            className="text-white uppercase"
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-bebas-neue), sans-serif',
              letterSpacing: '2px',
            }}
          >
            {label}
          </span>
        </div>
        {description && (
          <p
            className="text-white/50 mt-1 text-xs"
          >
            {description}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </>
  );
}

export const ServiceNode = memo(ServiceNodeComponent);
