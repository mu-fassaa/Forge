import React from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNodeWrapper } from './BaseNodeWrapper';
import { type EndNodeData } from '../../types/nodes';
import { LucideIcon } from '../../../../components/LucideIcon';

const END_CONFIG = {
  default:  { label: 'Default',  icon: 'CheckCircle', color: 'text-gray-400' },
  complete: { label: 'Complete', icon: 'Trophy',       color: 'text-emerald-400' },
  fail:     { label: 'Failed',   icon: 'XCircle',     color: 'text-red-400' },
};

export const EndNode: React.FC<NodeProps<Node<EndNodeData>>> = ({ id, data, selected }) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);
  const inputs = (node as any)?.inputs || [];
  const outputs = (node as any)?.outputs || [];

  const endCfg = END_CONFIG[data.endType as keyof typeof END_CONFIG] ?? END_CONFIG.default;

  return (
    <BaseNodeWrapper
      id={id}
      type="end"
      selected={selected}
      title="End Conversation"
      inputs={inputs}
      outputs={outputs}
      headerColorClass="text-red-400"
    >
      <div className="flex items-center gap-2">
        <LucideIcon name={endCfg.icon as any} size={14} className={endCfg.color} />
        <span className={`text-xs font-bold ${endCfg.color}`}>{endCfg.label}</span>
      </div>
    </BaseNodeWrapper>
  );
};
