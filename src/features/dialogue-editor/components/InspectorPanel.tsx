import React from 'react';
import { type Node } from '@xyflow/react';
import { nodeRegistry } from '../../../registry/nodeRegistry';
import { type NodePort } from '../../../features/dialogue-editor/types/nodes';
import { LucideIcon } from '../../../components/LucideIcon';

interface InspectorPanelProps {
  selectedNode: Node | null;
  onNodeDataChange: (nodeId: string, key: string, value: unknown) => void;
  onNodeOutputsChange: (nodeId: string, outputs: NodePort[]) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNode,
  onNodeDataChange,
  onNodeOutputsChange,
}) => {
  // ── Empty state ────────────────────────────────────────────
  if (!selectedNode) {
    return (
      <div className="w-72 min-w-[288px] h-full bg-[#0b0c1e] border-l border-[#14152a] flex flex-col">
        <div className="h-14 border-b border-[#14152a] px-4 flex items-center gap-2 shrink-0">
          <LucideIcon name="SlidersHorizontal" size={14} className="text-gray-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-600">Inspector</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-[#0d0e26] border border-[#1a1c36] flex items-center justify-center mb-3">
            <LucideIcon name="MousePointerClick" size={18} className="text-gray-700" />
          </div>
          <p className="text-xs font-bold text-gray-600 mb-1">Tidak ada node dipilih</p>
          <p className="text-[10px] text-gray-700 leading-relaxed">
            Klik sebuah node di canvas untuk melihat dan mengedit propertinya di sini.
          </p>
        </div>
      </div>
    );
  }

  // ── Cari definisi dari registry ────────────────────────────
  const nodeType = selectedNode.type ?? '';
  const def = nodeRegistry.has(nodeType) ? nodeRegistry.get(nodeType) : null;

  if (!def) {
    return (
      <div className="w-72 min-w-[288px] h-full bg-[#0b0c1e] border-l border-[#14152a] flex flex-col">
        <div className="h-14 border-b border-[#14152a] px-4 flex items-center gap-2 shrink-0">
          <LucideIcon name="SlidersHorizontal" size={14} className="text-gray-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-600">Inspector</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-red-400">Node type "{nodeType}" tidak terdaftar di registry.</p>
        </div>
      </div>
    );
  }

  const InspectorComponent = def.inspectorComponent;

  // Output ports dari root node (bukan dari data)
  const currentOutputs: NodePort[] = (selectedNode as any).outputs ?? def.outputs;

  const handleChange = (key: string, value: unknown) => {
    onNodeDataChange(selectedNode.id, key, value);
  };

  const handleOutputsChange = (newOutputs: NodePort[]) => {
    onNodeOutputsChange(selectedNode.id, newOutputs);
  };

  // ── Render inspector ───────────────────────────────────────
  return (
    <div className="w-72 min-w-[288px] h-full bg-[#0b0c1e] border-l border-[#14152a] flex flex-col">

      {/* Header */}
      <div className="h-14 border-b border-[#14152a] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <LucideIcon name="SlidersHorizontal" size={14} className="text-[#e879f9]" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300">Inspector</span>
        </div>
      </div>

      {/* Node type badge */}
      <div className="px-4 py-3 border-b border-[#14152a] shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${def.color}18`, border: `1px solid ${def.color}35` }}
          >
            <LucideIcon name={def.icon as any} size={13} style={{ color: def.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-gray-200 truncate">{def.title}</p>
            <p className="text-[9px] text-gray-600 truncate">{def.description}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[9px] text-gray-700 font-mono">ID:</span>
          <span className="text-[9px] text-gray-600 font-mono truncate">{selectedNode.id}</span>
        </div>
      </div>

      {/* Inspector fields — scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <InspectorComponent
          nodeId={selectedNode.id}
          data={selectedNode.data as any}
          onChange={handleChange}
          outputs={currentOutputs}
          onOutputsChange={handleOutputsChange}
        />
      </div>
    </div>
  );
};
