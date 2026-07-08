import React from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNodeWrapper } from './BaseNodeWrapper';
import { type DialogueNodeData } from '../../types/nodes';

export const DialogueNode: React.FC<NodeProps<Node<DialogueNodeData>>> = ({ id, data, selected }) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);
  const inputs = (node as any)?.inputs || [];
  const outputs = (node as any)?.outputs || [];

  return (
    <BaseNodeWrapper
      id={id}
      type="dialogue"
      selected={selected}
      title="Dialogue Card"
      inputs={inputs}
      outputs={outputs}
      headerColorClass="text-[#D946EF]"
    >
      {/* Preview ringkas: tidak bisa diedit, arahkan ke Inspector */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-gray-600 shrink-0">Speaker</span>
          <span className="text-xs font-semibold text-gray-200 truncate">
            {data.speaker || <span className="text-gray-600 italic">—</span>}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
          {data.text || <span className="italic">Belum ada teks...</span>}
        </p>
      </div>
    </BaseNodeWrapper>
  );
};
