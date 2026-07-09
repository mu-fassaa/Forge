import React from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { LucideIcon } from '../../components/LucideIcon';

// ─────────────────────────────────────────────────────────────
// HelloNodeData: payload data untuk Hello Node
// ─────────────────────────────────────────────────────────────
export interface HelloNodeData extends Record<string, unknown> {
  message: string;
  author: string;
}

// ─────────────────────────────────────────────────────────────
// HelloNode: komponen canvas untuk Hello Node.
// Dirender oleh ReactFlow pada canvas editor.
// ─────────────────────────────────────────────────────────────
export const HelloNode: React.FC<NodeProps<Node<HelloNodeData>>> = ({ data, selected }) => {
  return (
    <div
      className="rounded-lg overflow-hidden select-none"
      style={{
        width: 200,
        background: '#0c1833',
        border: `1.5px solid ${selected ? '#00A3FF' : 'rgba(0,163,255,0.2)'}`,
        boxShadow: selected ? '0 0 0 2px rgba(0,163,255,0.15)' : undefined,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Node Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background: 'linear-gradient(135deg, rgba(0,163,255,0.12) 0%, rgba(0,163,255,0.04) 100%)',
          borderBottom: '1px solid rgba(0,163,255,0.15)',
        }}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,163,255,0.15)' }}
        >
          <LucideIcon name="Sparkles" size={11} className="text-[#00A3FF]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-[#00A3FF]">
          Hello Node
        </span>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2.5 space-y-1.5">
        <div>
          <p className="text-[9px] font-mono text-[#3d5275] uppercase tracking-wider mb-0.5">Message</p>
          <p className="text-xs text-[#F3F4F6] font-medium truncate">
            {data.message || 'No message set'}
          </p>
        </div>
        {data.author && (
          <div>
            <p className="text-[9px] font-mono text-[#3d5275] uppercase tracking-wider mb-0.5">Author</p>
            <p className="text-[10px] text-[#8E9BB4] truncate">{data.author}</p>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#00A3FF',
          border: '2px solid #0c1833',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#00A3FF',
          border: '2px solid #0c1833',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
};
