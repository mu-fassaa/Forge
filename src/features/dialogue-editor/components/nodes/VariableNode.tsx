import React from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNodeWrapper } from './BaseNodeWrapper';
import { type VariableNodeData } from '../../types/nodes';

export const VariableNode: React.FC<NodeProps<Node<VariableNodeData>>> = ({ id, data, selected }) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);
  const inputs = (node as any)?.inputs || [];
  const outputs = (node as any)?.outputs || [];

  const opSymbol = data.operation === 'set' ? '=' : data.operation === 'add' ? '+=' : '-=';

  return (
    <BaseNodeWrapper
      id={id}
      type="variable"
      selected={selected}
      title="Set Variable"
      inputs={inputs}
      outputs={outputs}
      headerColorClass="text-indigo-400"
    >
      <div>
        <code className="text-[10px] text-indigo-300 font-mono bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/15 block truncate">
          {data.variableName || '?'} {opSymbol} {data.value || '?'}
        </code>
      </div>
    </BaseNodeWrapper>
  );
};
