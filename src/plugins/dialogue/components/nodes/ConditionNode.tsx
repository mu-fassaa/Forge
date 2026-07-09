import React from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNodeWrapper } from './BaseNodeWrapper';
import { type ConditionNodeData } from '../../types/nodes';

export const ConditionNode: React.FC<NodeProps<Node<ConditionNodeData>>> = ({ id, data, selected }) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);
  const inputs = (node as any)?.inputs || [];
  const outputs = (node as any)?.outputs || [];

  return (
    <BaseNodeWrapper
      id={id}
      type="condition"
      selected={selected}
      title="Condition Branch"
      inputs={inputs}
      outputs={outputs}
      headerColorClass="text-amber-400"
    >
      <div>
        <code className="text-[10px] text-amber-300 font-mono bg-amber-500/5 px-2 py-1 rounded border border-amber-500/15 block">
          if ({data.parameter || '?'} {data.operator || '=='} {data.value || '?'})
        </code>
      </div>
    </BaseNodeWrapper>
  );
};
