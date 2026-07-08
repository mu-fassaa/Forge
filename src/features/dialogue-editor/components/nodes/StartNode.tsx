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
      <div className="flex items-center gap-2.5 py-1">
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
          <LucideIcon name="Play" size={11} className="ml-0.5 fill-emerald-500/20" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold text-gray-200">Execution Entry</span>
          <p className="text-[9px] text-gray-600">First node to evaluate</p>
        </div>
      </div>
    </BaseNodeWrapper>
  );
};
