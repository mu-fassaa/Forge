import React from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNodeWrapper } from './BaseNodeWrapper';
import { type EventNodeData } from '../../types/nodes';

export const EventNode: React.FC<NodeProps<Node<EventNodeData>>> = ({ id, data, selected }) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);
  const inputs = (node as any)?.inputs || [];
  const outputs = (node as any)?.outputs || [];

  return (
    <BaseNodeWrapper
      id={id}
      type="event"
      selected={selected}
      title="Trigger Event"
      inputs={inputs}
      outputs={outputs}
      headerColorClass="text-emerald-400"
    >
      <div>
        <code className="text-[10px] text-emerald-300 font-mono bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/15 block truncate">
          emit("{data.eventName || '?'}")
        </code>
        {data.eventValue && (
          <p className="text-[9px] text-gray-600 mt-1 truncate">payload: "{data.eventValue}"</p>
        )}
      </div>
    </BaseNodeWrapper>
  );
};
