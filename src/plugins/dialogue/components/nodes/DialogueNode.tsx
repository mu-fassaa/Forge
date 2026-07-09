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
      <div className="space-y-1.5 font-sans select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[8px] font-bold uppercase tracking-widest text-[#8E9BB4]/60 font-mono shrink-0">Speaker</span>
          <span className="text-[10px] font-bold text-[#F3F4F6] truncate">
            {data.speaker || <span className="text-[#8E9BB4]/40 italic">—</span>}
          </span>
        </div>
        <p className="text-[10px] text-[#8E9BB4] leading-relaxed line-clamp-2">
          {data.text || <span className="italic text-[#8E9BB4]/45">Belum ada teks...</span>}
        </p>
      </div>
    </BaseNodeWrapper>
  );
};
