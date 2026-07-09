import React from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNodeWrapper } from './BaseNodeWrapper';
import { LucideIcon } from '../../../../components/LucideIcon';

export const StartNode: React.FC<NodeProps<Node<Record<string, unknown>>>> = ({ id, selected }) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);
  const outputs = (node as any)?.outputs || [{ id: 'out', label: 'Out' }];

  return (
    <BaseNodeWrapper
      id={id}
      type="start"
      selected={selected}
      title="Start Graph"
      inputs={[]}
      outputs={outputs}
      headerColorClass="text-emerald-400"
    >
      <div className="flex items-center gap-2.5 py-1.5 select-none">
        <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
          <LucideIcon name="Play" size={10} className="ml-0.5 fill-emerald-500/10" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-[#F3F4F6] block">Execution Entry</span>
          <p className="text-[8px] text-[#8E9BB4]/65 leading-none mt-0.5">First node to evaluate</p>
        </div>
      </div>
    </BaseNodeWrapper>
  );
};
